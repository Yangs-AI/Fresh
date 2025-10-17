import ast
import tqdm
import click
import numpy
import pandas
import random
import seaborn
import pathlib
import textblob
import datetime
import wordcloud
import openreview

import bokeh.models
import bokeh.layouts
import bokeh.palettes
import bokeh.plotting

from matplotlib import pyplot


def _to_datetime_for_bokeh_(x: float):
    return datetime.datetime.fromtimestamp(int(x)/1000, tz=datetime.timezone.utc)


def _datearea2submission_(data_frame: pandas.DataFrame):
    data_frame['_area_'] = data_frame['_area_'].fillna('Unknown').astype(str)
    data_frame['_create_date_'] = data_frame['_create_date_'].apply(_to_datetime_for_bokeh_)
    data_frame['_finish_date_'] = data_frame['_finish_date_'].apply(_to_datetime_for_bokeh_)

    def group(time_type: str) -> tuple[list[str], list[bokeh.models.ColumnDataSource]]:
        partial_data_frame = data_frame[time_type].copy()
        partial_data_frame['_date_'] = partial_data_frame[time_type].dt.tz_convert('UTC').dt.date
        da2s = partial_data_frame.groupby(['_date_', 'content.primary_area.value']).size().reset_index(name='_count_')
        area_labels = da2s.groupby('content.primary_area.value')['_count_'].sum().sort_values(ascending=False).index.tolist()

        d2s_total = da2s.groupby('_date_')['_count_'].sum().reset_index()
        d2s_total_data_source = bokeh.models.ColumnDataSource(dict(x=pandas.to_datetime(d2s_total['_date_']), y=d2s_total['_count_']))
        d2s_area_data_sources = list()
        for area_label in area_labels:
            d2s_area = da2s[da2s['content.primary_area.value'] == area_label]
            d2s_area_data_sources.append(bokeh.models.ColumnDataSource(dict(x=pandas.to_datetime(d2s_area['_date_']), y=d2s_area['_count_'])))
        return ['Total'] + area_labels, [d2s_total_data_source] + d2s_area_data_sources

    create_labels, create_sources = group('_create_date_')
    finish_labels, finish_sources = group('_finish_date_')

    labels = create_labels
    available_time_types = ['_create_date_', '_finish_date_']

    fig = bokeh.plotting.figure(height=360, x_axis_type='datetime', title="Submission Count w.r.t. Date")
    fig.add_tools(
        bokeh.models.PanTool(),
        bokeh.models.BoxZoomTool(),
        bokeh.models.ResetTool(),
        bokeh.models.SaveTool(),
        bokeh.models.HoverTool(
            tooltips=[("Area", "$name"), ("Date", "@x{%F}"), ("Count", "@y")],
            formatters={"@x": "datetime"},
            mode="vline"
        )
    )

    fig.y_range.start = 0
    fig.xaxis.axis_label = "Date"
    fig.yaxis.axis_label = "Submission"

    palette = [bokeh.palettes.Category20[random.randint(20)][index % 20] for index in range(len(labels))]
    renderers = list()
    for index, label in enumerate(labels):
        renderer = fig.line('x', 'y', source=create_sources[index], line_width=2.0, color=palette[index], name=label, legend_label=label)
        renderers.append(renderer)

    fig.legend.click_policy = "hide"


    default_active = list(range(min(1+8, len(labels))))
    checkbox = bokeh.models.CheckboxGroup(labels=labels, active=default_active)
    checkbox_args = {'checkbox': checkbox}
    for index, renderer in enumerate(renderers):
        checkbox_args[f'renderer-{i}'] = renderer

    checkbox.js_on_change(
        'active',
        bokeh.models.CustomJS(args=checkbox_args, code="""
            const a = new Set(checkbox.active);
            const n = Object.keys(this.models).filter(k => k.startsWith("renderer-")).length;
            for (let i = 0; i < n; i++) {
                const rend = this.models["renderer-"+i];
                rend.visible = a.has(i);
            }
        """)
    )

    for i, renderer in enumerate(renderers):
        renderer.visible = (i in default_active)

    default_value = 'cdate'
    selection = bokeh.models.Select(title='Time Type', value=default_value, options=available_time_types)
    selection_args = {"selection": selection}
    for i in range(labels):
        selection_args[f"renderer-{i}"] = renderers[i]
        selection_args[f"cdate-{i}"] = create_sources[i]
        selection_args[f"fdate-{i}"] = finish_sources[i]

    selection.js_on_change(
        'value',
        bokeh.models.CustomJS(args=selection_args, code="""
            const use_m = (cb_obj.value === 'fdate');
            const n = Object.keys(this.models).filter(k => k.startsWith("renderer-")).length;
            for (let i = 0; i < n; i++) {
                const rend = this.models["renderer-"+i];
                const from = this.models[(use_m ? "fdate-" : "cdate-")+i];
                rend.data_source.data = Object.assign({}, from.data);
                rend.data_source.change.emit();
            }
        """)
    )

    return bokeh.layouts.column(selection, checkbox, fig)


def _area2abstract_(data_frame: pandas.DataFrame):
    data_frame['_area_'] = data_frame['_area_'].fillna('Unknown').astype(str)
    data_frame['_abstract_'] = data_frame['_abstract_'].fillna('').astype(str)
    data_frame['_abstract_length_'] = data_frame['_abstract_'].str.len()
    areas = ['_all_'] + sorted(data_frame['_area_'].unique().tolist())

    def make_hist(partial_data_frame: pandas.DataFrame):
        ablen = partial_data_frame['_abstract_length_'].values
        counts, edges = numpy.histogram(ablen, bins=30)
        return pandas.DataFrame({'left': edges[:-1], 'right': edges[1:], 'count': counts})

    hist_dict = {'_all_': make_hist(data_frame)}
    for area in areas:
        if area == '_all_':
            continue
        hist_dict[area] = make_hist(data_frame[data_frame['_area_'] == area])

    hist_data_source = bokeh.models.ColumnDataSource(hist_dict['_all_'])
    fig = bokeh.plotting.figure(height=350, title='Histogram of Abstract', tools="pan,wheel_zoom,box_zoom,reset,save,hover")
    fig.quad(top='count', bottom=0, left='left', right='right', source=hist_data_source, fill_alpha=0.6, line_color="#AE51C0")
    fig.xaxis.axis_label = "Length of Abstract"
    fig.yaxis.axis_label = "Number of Submissions"
    fig.hover.tooltips = [("Range", "@left{0} - @right{0}"), ("Count", "@count")]

    selection_args = {'hist-_all_': hist_data_source}
    for area in areas:
        selection_args[f'hist-{area}'] = bokeh.models.ColumnDataSource(hist_dict[area])

    selection = bokeh.models.Select(title="Area", value="_all_", options=areas)
    selection.js_on_change(
        'value',
        bokeh.models.CustomJS(args=selection_args, code="""
            const key = 'hist-' + cb_obj.value;
            const from = this.models[key].data;
            src.data = Object.assign({}, from);
            src.change.emit();
        """)
    )

    return bokeh.layouts.column(selection, fig)


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
        da2s_block = _datearea2submission_(data_frame.rename(columns={'content.primary_area.value': '_area_', 'cdate': '_create_date_', 'mdate': '_finish_date_'}))
        a2a_block = _area2abstract_(data_frame.rename(columns={'content.primary_area.value': '_area_', 'content.abstract.value': '_abstract_'}))

        tabs = bokeh.models.Tabs(tabs=[
            bokeh.models.Panel(child=da2s_block, title="Submission Count w.r.t. Time Change"),
            bokeh.models.Panel(child=a2a_block,  title="Abstract Length"),
        ])

        title = f"ICLR Submissions Visualization ({year})"
        html_filepath = output_dirpath.joinpath(f'ICLR-{year}-Submissions-Online.html')
        bokeh.plotting.output_file(html_filepath, title=title)
        bokeh.plotting.save(tabs)

if __name__ == '__main__':
    main()