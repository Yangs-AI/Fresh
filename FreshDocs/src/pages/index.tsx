import type {ReactNode} from 'react';

import Layout from '@theme/Layout';

import HomePageHeader from '@site/src/components/HomePage/Header';
import HomePageFeatures from '@site/src/components/HomePage/Features';


export default function Home(): ReactNode {
  return (
    <Layout
      title={`Friendly Research Resources Hub`}
      description="Making research resources easy to find, reuse, and share - documenting assets for reproducible research.">
      <HomePageHeader />
      <main>
        <HomePageFeatures />
      </main>
    </Layout>
  );
}
