import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureItems: FeatureItem[] = [
  {
    title: 'Plug-and-Play Components',
    Svg: require('@site/static/img/undraw_visualization.svg').default,
    description: (
      <>
        Includes data visualization code, LaTeX table source code, LaTeX algorithm pseudocode, etc. These elements can be directly copied or lightly modified for immediate use.
      </>
    )
  },
  {
    title: 'Quick Replication',
    Svg: require('@site/static/img/undraw_visualization.svg').default,
    description: (
      <>
        Each entry in the library comes with a minimal reproducibility example, input/output formats, and dependency descriptions, specifically designed for quick replication and secondary modification by newcomers.
      </>
    )
  },
  {
    title: 'Unified Reference',
    Svg: require('@site/static/img/undraw_visualization.svg').default,
    description: (
      <>
        Includes paper fields, titles, doi, and .bib source code supporting BibTeX/Bibier formats. These enable efficient retrieval and citation possibilities.
      </>
    )
  },
  {
    title: 'Easy Access',
    Svg: require('@site/static/img/undraw_visualization.svg').default,
    description: (
      <>
        Each entry is clearly named and can be quickly searched using any "recipes" like tags, keywords, and fields, for easy retrieval.
      </>
    )
  },
];

const OtherFeatureItems: FeatureItem[] = [
  {
    title: 'Tools and Scripts',
    Svg: require('@site/static/img/undraw_visualization.svg').default,
    description: (
      <>
        Provides quick insights for researchers. All scripts are standalone, easy to assemble, and come with dependency documentation. For instance, helping with statistical analysis for conferences like ICLR that are hosted on OpenReview.
      </>
    )
  },
  {
    title: 'Reusable Writing Assets',
    Svg: require('@site/static/img/undraw_visualization.svg').default,
    description: (
      <>
        Includes good sentences, word choices, figure captions, title templates, and style tips, compiled into reusable writing assets.
      </>
    )
  },
  {
    title: 'Fresh News',
    Svg: require('@site/static/img/undraw_visualization.svg').default,
    description: (
      <>
        Announces lab updates and Fresh repository revisions, including new "recipes," important updates, and research milestones in a clear and concise format.
      </>
    )
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomePageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureItems.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
