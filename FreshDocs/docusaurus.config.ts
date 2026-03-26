import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import {createAdvancedSchemaPlugin} from './scripts/advancedSchemaPlugin';

const publicRepoUrl = process.env.PUBLIC_REPO_URL ?? 'https://github.com/Yangs-AI/Fresh';
const publicEditUrl = process.env.PUBLIC_EDIT_URL ?? `${publicRepoUrl}/tree/main/FreshDocs`;
const siteUrl = 'https://public.fresh.research.jason-young.me';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Fresh',
  url: siteUrl,
  description: 'Friendly Research Resources Hub',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Yangs AI Research Group',
    url: 'https://yangs.ai',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Yangs AI Research Group',
  url: 'https://yangs.ai',
  logo: `${siteUrl}/img/logo.svg`,
  sameAs: [publicRepoUrl, 'https://yangs.ai', 'https://jason-young.me'],
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Fresh Home',
  url: `${siteUrl}/`,
  description: 'Friendly Research Resources Hub',
  inLanguage: 'en',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Fresh',
    url: siteUrl,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Yangs AI Research Group',
    url: 'https://yangs.ai',
  },
};

const config: Config = {
  title: 'Fresh',
  tagline: 'Friendly Research Resources Hub',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: siteUrl,
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

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css',
      type: 'text/css',
    },
  ],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: false,
        blog: false,
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          filename: 'sitemap.xml',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    function robotsTxtPlugin() {
      return {
        name: 'robots-txt-plugin',
        postBuild({outDir}: {outDir: string}) {
          const robotsTxt = [
            'User-agent: *',
            'Allow: /',
            `Sitemap: ${siteUrl}/sitemap.xml`,
          ].join('\n');

          writeFileSync(join(outDir, 'robots.txt'), `${robotsTxt}\n`, 'utf-8');
        },
      };
    },
    function htmlAssetPlugin() {
      return {
        name: 'html-asset-plugin',
        configureWebpack() {
          return {
            resolve: {
              alias: {
                'vscode-languageserver-types/lib/umd/main.js':
                  'vscode-languageserver-types/lib/esm/main.js',
              },
            },
            ignoreWarnings: [
              {
                module: /vscode-languageserver-types[\\/]lib[\\/]umd[\\/]main\.js$/,
                message:
                  /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
              },
            ],
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
    createAdvancedSchemaPlugin({
      siteUrl,
      siteName: 'Fresh',
      publisherName: 'Yangs AI Research Group',
      publisherUrl: 'https://yangs.ai',
    }),
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'memo',
        path: 'memo',
        editUrl: publicEditUrl,
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
        sidebarPath: './sidebarsMemo.ts',
        routeBasePath: 'memo',
        disableVersioning: false,
        showLastUpdateTime: true,
      },
    ],
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'news',
        path: 'news',
        editUrl: publicEditUrl,
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
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
        href: 'https://fresh.research.jason-young.me',
        target: '_self',
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
    metadata: [
      {name: 'description', content: 'Friendly Research Resources Hub'},
      {name: 'keywords', content: 'research, docs, memo, knowledge base, yangs-ai'},
      {property: 'og:type', content: 'website'},
      {property: 'og:site_name', content: 'Fresh'},
      {property: 'og:title', content: 'Fresh - Friendly Research Resources Hub'},
      {property: 'og:description', content: 'Friendly Research Resources Hub'},
      {property: 'og:url', content: siteUrl},
      {property: 'og:image', content: `${siteUrl}/img/fresh-social-card.jpg`},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:title', content: 'Fresh - Friendly Research Resources Hub'},
      {name: 'twitter:description', content: 'Friendly Research Resources Hub'},
      {name: 'twitter:image', content: `${siteUrl}/img/fresh-social-card.jpg`},
    ],
  } satisfies Preset.ThemeConfig,
  headTags: [
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify(websiteSchema),
    },
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify(organizationSchema),
    },
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify(webPageSchema),
    },
  ],
};

export default config;
