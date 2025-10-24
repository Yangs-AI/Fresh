import type {ReactNode} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import FreshBackground from '@site/src/theme/fresh_background';


function Header() {
  const {siteConfig} = useDocusaurusContext();
  return (
      <FreshBackground>
    <header className={clsx('needFreshBackground', styles.heroWrapper, styles.heroBanner, styles.heroGlass)}>
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.glassPanel}>
          <h1 className={clsx('hero__title', styles.fadeUp)} data-animate="fade-up" style={{ animationDelay: '0.15s' }}>
            {siteConfig.title}
          </h1>
          <p className={clsx('hero__subtitle', styles.fadeUp)} data-animate="fade-up" style={{ animationDelay: '0.30s' }}>{siteConfig.tagline}</p>
          <div className={styles.ctaRow}>
            <Link className={clsx('button button--lg', 'glass-button', styles.buttonPrimary)} to="/memo">
              Start from Memo
            </Link>
            <Link className={clsx('button button--lg', 'glass-button', styles.buttonGhost)} to="/news">
              Explore News
            </Link>
          </div>
        </div>
      </div>
    </header>
      </FreshBackground>
  );
}

export default function HomePageHeader(): ReactNode {
    return (
      <Header />
    );
}