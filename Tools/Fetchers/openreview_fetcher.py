import ast
import tqdm
import click
import pandas
import seaborn
import pathlib
import textblob
import wordcloud
import openreview

from matplotlib import pyplot
from multiprocessing import Pool


@click.group(name='fresh-fetchers-openreview')
@click.option('--username', type=str, required=False, default=None, help='OpenReview username')
@click.option('--password', type=str, required=False, default=None, help='OpenReview password')
@click.pass_context
def main(context: click.Context, username: str | None = None, password: str | None = None):
    context.ensure_object(dict)
    client = openreview.api.OpenReviewClient(
        baseurl='https://api2.openreview.net',
        username=username,
        password=password,
    )
    context.obj['client'] = client


@main.command(name='iclr')
@click.option('--year', type=int, required=True, help='Year of the ICLR conference')
@click.option('--topk', type=int, required=True, help='Top K keyword of the ICLR conference')
@click.option('--output-dirpath', type=click.Path(exists=False, file_okay=False, dir_okay=True, path_type=pathlib.Path), required=True, help='Output directory path for the fetched data about ICLR conference submissions')
@click.option('--online', is_flag=True, help='Online View')
@click.option('--refetch', is_flag=True, help='Refetch')
@click.pass_context
def iclr(context: click.Context, year: int, topk: int, output_dirpath: pathlib.Path, online: bool, refetch: bool):

    # Submissions
    submissions_filepath = output_dirpath.joinpath(f'ICLR-{year}-Submissions.csv')
    if not submissions_filepath.exists() or refetch:
        client = context.obj['client']
        venue_id = f'ICLR.cc/{year}/Conference'
        page_url = f'https://openreview.net/group?id={venue_id}'
        click.echo(f'Fetching ICLR {year} papers from OpenReview {page_url}')

        venue_group = client.get_group(venue_id)
        submission_name = venue_group.content['submission_name']['value']
        submission_notes = client.get_all_notes(invitation=f'{venue_id}/-/{submission_name}', details='directReplies')
        submissions = [submission_note.to_json() for submission_note in submission_notes]

        data_frame = pandas.json_normalize(submissions)
        data_frame.to_csv(submissions_filepath, index=False)
        data_frame = pandas.read_csv(submissions_filepath)
    else:
        click.echo(f'Reload ICLR {year} papers from {submissions_filepath}')
        data_frame = pandas.read_csv(submissions_filepath)

    # print(data_frame.head())
    print(f'Number of Submissions Fetched: {len(data_frame)}')

    # Keyword Statistics
    keyword_lists = data_frame['content.keywords.value'].apply(ast.literal_eval)
    keyword_count = dict()
    with tqdm.tqdm(total=len(keyword_lists), desc='Checking Keywords') as progress_bar:
        for keyword_list in keyword_lists:
            for keyword in keyword_list:
                words_of_keyword = textblob.Sentence(keyword).lower().words
                last_word_of_keyword = words_of_keyword[-1].singularize()
                keyword = " ".join(words_of_keyword[:-1] + [last_word_of_keyword])
                keyword_count[keyword] = keyword_count.get(keyword, 0) + 1
            progress_bar.update()
    print(f'Number of Keywords: {len(keyword_count)}')

    # Static Keyword Top K
    keyword_topk_filepath = output_dirpath.joinpath(f'ICLR-{year}-Submissions-Keyword-Top-{topk}.png')
    if not keyword_topk_filepath.exists() or refetch:

        topk_keywords = pandas.Series(keyword_count).sort_values(ascending=False).head(topk)
        fig, ax = pyplot.subplots(figsize=(10, min(13, (0.2 * topk))))
        seaborn.barplot(x=topk_keywords.values, y=topk_keywords.index, hue=topk_keywords.index, palette='crest', legend=False, ax=ax)
        ax.set_title(f"Top {topk} Keywords of ICLR {year} Conference", fontsize=16, weight='bold')
        ax.set_xlabel("Frequency")
        ax.set_ylabel("")
        ax.grid(axis='x', linestyle='--', alpha=0.3)
        fig.tight_layout()
        pyplot.savefig(keyword_topk_filepath, dpi=300, bbox_inches='tight')
        pyplot.close(fig)

    # Static Keyword Cloud
    keyword_cloud_filepath = output_dirpath.joinpath(f'ICLR-{year}-Submissions-Keyword-Cloud.png')
    if not keyword_cloud_filepath.exists() or refetch:
        wc = wordcloud.WordCloud(background_color=None, mode='RGBA', max_words=300, max_font_size=64, width=1280, height=640, random_state=0)
        wc.generate_from_frequencies(keyword_count)
        fig, ax = pyplot.subplots(figsize=(10, 13))
        ax.imshow(wc, interpolation='bilinear')
        ax.axis('off')
        ax.set_title(f'Keywords Cloud of ICLR {year} Conference', fontsize=16)
        fig.tight_layout()
        pyplot.savefig(keyword_cloud_filepath, dpi=300, bbox_inches='tight')
        pyplot.close(fig)

    if online:
        pass

if __name__ == '__main__':
    main()