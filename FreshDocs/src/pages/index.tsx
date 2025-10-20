import type {ReactNode} from 'react';

import Layout from '@theme/Layout';

import HomePageHeader from '@site/src/components/HomePage/Header';
import HomePageFeatures from '@site/src/components/HomePage/Features';


export default function Home(): ReactNode {
  return (
    <Layout
      title={`Friendly Research Resources Hub`}
      description="Description will go into a meta tag in <head />">
      <HomePageHeader />
      <main>
        <HomePageFeatures />
      </main>
    </Layout>
  );
}
