import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

import statistics from '@site/static/statistics.json';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
  footnote?: ReactNode;
};

const FeatureItems: FeatureItem[] = [
  {
    title: 'Plug-n-Play Components',
    Svg: require('@site/static/img/undraws/undraw_modified_components.svg').default,
    description: (
      <p>
        Includes data visualization code, LaTeX table source code, LaTeX algorithm pseudocode, etc. These elements can be directly copied or lightly modified for immediate use.
      </p>
    ),
    footnote: (
      <div className={styles.metaLine}>
        <span className={styles.kbd}>Vis</span> {statistics.viss}
        <span className={styles.dot}>·</span>
        <span className={styles.kbd}>Tab</span> {statistics.tabs}
        <span className={styles.dot}>·</span>
        <span className={styles.kbd}>Alg</span> {statistics.algs}
      </div>
    ),
  },
  {
    title: 'Quick Replication',
    Svg: require('@site/static/img/undraws/undraw_modified_replication.svg').default,
    description: (
      <p>
        Each entry in the library comes with a minimal reproducibility example, input/output formats, and dependency descriptions, specifically designed for quick replication and secondary modification by newcomers.
      </p>
    )
  },
  {
    title: 'Unified Reference',
    Svg: require('@site/static/img/undraws/undraw_modified_reference.svg').default,
    description: (
      <p>
        Includes paper fields, titles, doi, and <code>.bib</code> source code supporting BibTeX/Biber formats. These enable efficient retrieval and citation possibilities.
      </p>
    ),
    footnote: (
      <div className={styles.metaLine}>
        <span className={styles.kbd}>.bib</span> {statistics.bibs}
      </div>
    ),
  },
  {
    title: 'Easy Access',
    Svg: require('@site/static/img/undraws/undraw_modified_access.svg').default,
    description: (
      <p>
        Each entry is clearly named and can be quickly searched using any "recipes" like tags, keywords, and fields, for easy retrieval.
      </p>
    )
  },
];

const OtherFeatureItems: FeatureItem[] = [
  {
    title: 'Tools and Scripts',
    Svg: require('@site/static/img/undraws/undraw_modified_tools.svg').default,
    description: (
      <p>
        Provides quick insights for researchers. All scripts are standalone, easy to assemble, and come with dependency documentation. For instance, helping with statistical analysis for conferences like ICLR that are hosted on OpenReview.
      </p>
    ),
    footnote: (
      <div className={styles.metaLine}>
        <span className={styles.kbd}>Tools</span> {statistics.miss}
      </div>
    ),
  },
  {
    title: 'Reusable Writing Assets',
    Svg: require('@site/static/img/undraws/undraw_modified_writing.svg').default,
    description: (
      <p className={styles.desc}>
        Includes good sentences, word choices, figure captions, title templates, and style tips, compiled into reusable writing assets.
      </p>
    )
  },
  {
    title: 'Fresh News',
    Svg: require('@site/static/img/undraws/undraw_modified_news.svg').default,
    description: (
      <p className={styles.desc}>
        Announces lab updates and Fresh repository revisions, including new "recipes," important updates, and research milestones in a clear and concise format.
      </p>
    )
  },
];

function FeatureCard({ title, Svg, description, footnote, count }: FeatureItem & { count: number }) {
  const colClass = 'col col--' + Math.floor(12 / count);
  return (
    <div className={clsx(colClass, styles.col)}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <Heading as="h4" className={styles.title}>{title}</Heading>
        {description}
        {footnote}
      </div>
    </div>
  );
}

export default function HomePageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className={clsx('container', styles.container)}>
        <div className={styles.sectionHeader}>Core Features</div>
        <div className={clsx('row', styles.row)}>
          {FeatureItems.map((props, idx) => (
            <FeatureCard key={idx} {...props} count={FeatureItems.length}/>
          ))}
        </div>

        <div className={styles.sectionDivider} />

        <div className={styles.sectionHeader}>Additional Resources</div>
        <div className={clsx('row', styles.row)}>
          {OtherFeatureItems.map((props, idx) => (
            <FeatureCard key={idx} {...props} count={OtherFeatureItems.length}/>
          ))}
        </div>

      </div>
    </section>
  );
}
