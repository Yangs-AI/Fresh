import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const publicRepoUrl = process.env.PUBLIC_REPO_URL ?? 'https://github.com/Yangs-AI/Fresh';
const publicEditUrl = process.env.PUBLIC_EDIT_URL ?? `${publicRepoUrl}/tree/main/FreshDocs`;

const config: Config = {
  title: 'Fresh',
  tagline: 'Friendly Research Resources Hub',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://public.fresh.research.jason-young.me',
  baseUrl: '/',

  organizationName: 'Yangs-AI',
  projectName: 'Fresh',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: ['@docusaurus/theme-mermaid'],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
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
    function htmlAssetPlugin() {
      return {
        name: 'html-asset-plugin',
        configureWebpack() {
          return {
            module: {
              rules: [
                {
                  test: /\.html$/i,
                  type: 'asset/resource',
                },
              ],
            },
          };
        },
      };
    },
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'memo',
        path: 'memo',
        editUrl: publicEditUrl,
        sidebarPath: './sidebarsMemo.ts',
        routeBasePath: 'memo',
        disableVersioning: false,
        showLastUpdateTime: true,
        showLastUpdateAuthor: true,
      },
    ],
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'news',
        path: 'news',
        editUrl: publicEditUrl,
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
      },
    ],
  ],

  themeConfig: {
    image: 'img/fresh-social-card.jpg',
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
          position: 'left',
        },
        {
          href: publicRepoUrl,
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
              href: publicRepoUrl,
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussion',
              href: `${publicRepoUrl}/discussions`,
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
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://yangs.ai" class="copyright-link">Yangs AI</a>.<br/>Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.oceanicNext,
      darkTheme: prismThemes.duotoneDark,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
