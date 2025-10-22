import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Fresh',
  tagline: 'Friendly Research Resources Hub',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://fresh.research.jason-young.me',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Yangs-AI', // Usually your GitHub org/user name.
  projectName: 'Fresh', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: false,
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'memo',
        path: 'memo',
        editUrl: 'https://github.com/Yangs-AI/Fresh/tree/main/FreshDocs',
        sidebarPath: './sidebarsMemo.ts',
        routeBasePath: 'memo',
        disableVersioning: false,
      }
    ],
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'news',
        path: 'news',
        editUrl: 'https://github.com/Yangs-AI/Fresh/tree/main/FreshDocs',
        blogTitle: 'News',
        routeBasePath: 'news',
        showReadingTime: true,
        blogDescription: 'Information about Research Team of Yangs-AI',
        blogSidebarTitle: 'All News',
        feedOptions: {
          type: ['rss', 'atom'],
          xslt: true,
          title: 'Fresh News',
          description: 'Information about Research Team of Yangs-AI',
        },
        onInlineTags: 'warn',
        onInlineAuthors: 'warn',
        onUntruncatedBlogPosts: 'warn',
      }
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Fresh',
      logo: {
        alt: 'Friendly Research Resources Hub',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'memoSidebar',
          docsPluginId: 'memo',
          position: 'left',
          label: 'Memo',
        },
        {
          to: '/news',
          label: 'News',
          position: 'left'
        },
        {
          href: 'https://github.com/Yangs-AI/Fresh',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Memo',
              to: '/memo',
            },
          ],
        },
        {
          title: 'Interests',
          items: [
            {
              label: 'News',
              to: '/news',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/Yangs-AI/News',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussion',
              href: 'https://github.com/Yangs-AI/Fresh/discussions',
            },
          ],
        },
        {
          title: 'Related Sites',
          items: [
            {
              label: 'Jason Young',
              href: 'https://jason-young.me',
            },
            {
              label: 'Yangs AI',
              href: 'https://yangs.ai',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://yangs.ai" class="glass-button">Yangs AI</a>. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.oceanicNext,
      darkTheme: prismThemes.duotoneDark,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
