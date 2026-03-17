import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {join, relative} from 'node:path';

type AdvancedSchemaPluginOptions = {
  siteUrl: string;
  siteName: string;
  publisherName: string;
  publisherUrl: string;
  publisherLogoUrl?: string;
};

function toTitleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function humanizeSegment(segment: string): string {
  return toTitleCase(segment.replace(/[-_]+/g, ' '));
}

function routePathFromHtml(outDir: string, htmlPath: string): string {
  const rel = relative(outDir, htmlPath).replace(/\\/g, '/');
  if (rel === 'index.html') {
    return '/';
  }

  if (rel.endsWith('/index.html')) {
    return `/${rel.slice(0, -'/index.html'.length)}/`;
  }

  return `/${rel.replace(/\.html$/i, '')}`;
}

function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
}

function absoluteUrl(siteUrl: string, routePath: string): string {
  return new URL(routePath.replace(/^\//, ''), normalizeSiteUrl(siteUrl)).toString();
}

function walkHtmlFiles(rootDir: string): string[] {
  const htmlFiles: string[] = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    for (const entry of readdirSync(current)) {
      const fullPath = join(current, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (entry.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    }
  }

  return htmlFiles;
}

function buildBreadcrumbSchema(siteUrl: string, routePath: string) {
  const cleanRoute = routePath.replace(/^\//, '').replace(/\/$/, '');
  const segments = cleanRoute ? cleanRoute.split('/') : [];

  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: absoluteUrl(siteUrl, '/'),
    },
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    const pathWithSlash = isLast && !routePath.endsWith('/') ? currentPath : `${currentPath}/`;

    itemListElement.push({
      '@type': 'ListItem',
      position: index + 2,
      name: humanizeSegment(segment),
      item: absoluteUrl(siteUrl, pathWithSlash),
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

function extractTitle(html: string, fallback: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (!titleMatch?.[1]) {
    return fallback;
  }

  return titleMatch[1].replace(/\s*\|\s*Fresh\s*$/i, '').trim();
}

function extractMetaByAttribute(
  html: string,
  attribute: 'name' | 'property',
  metaValue: string,
): string | undefined {
  const escapedName = metaValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(
      `<meta[^>]*${attribute}=["']${escapedName}["'][^>]*content=["']([^"']+)["'][^>]*>`,
      'i',
    ),
    new RegExp(
      `<meta[^>]*content=["']([^"']+)["'][^>]*${attribute}=["']${escapedName}["'][^>]*>`,
      'i',
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

function extractMetaContent(html: string, metaName: string): string | undefined {
  return extractMetaByAttribute(html, 'name', metaName);
}

function extractMetaProperty(html: string, metaProperty: string): string | undefined {
  return extractMetaByAttribute(html, 'property', metaProperty);
}

function buildCollectionPageSchema(
  options: AdvancedSchemaPluginOptions,
  routePath: string,
  title: string,
  description: string,
) {
  const pageUrl = absoluteUrl(options.siteUrl, routePath);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection-page`,
    name: title,
    url: pageUrl,
    description,
    isPartOf: {
      '@type': 'WebSite',
      name: options.siteName,
      url: options.siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: options.publisherName,
      url: options.publisherUrl,
    },
  };
}

function buildTechArticleSchema(
  options: AdvancedSchemaPluginOptions,
  routePath: string,
  title: string,
  description: string,
  keywords?: string,
  dateModified?: string,
) {
  const pageUrl = absoluteUrl(options.siteUrl, routePath);
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${pageUrl}#tech-article`,
    headline: title,
    name: title,
    url: pageUrl,
    description,
    keywords,
    dateModified,
    inLanguage: 'en',
    author: {
      '@type': 'Organization',
      name: options.publisherName,
      url: options.publisherUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: options.publisherName,
      url: options.publisherUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  };
}

function cleanHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractArticleAuthorName(html: string): string | undefined {
  const authorNameMatch = html.match(/<span[^>]*class="[^"]*authorName[^"]*"[^>]*>([^<]+)<\/span>/i);
  if (authorNameMatch?.[1]) {
    return cleanHtmlEntities(authorNameMatch[1].trim());
  }

  const articleAuthorMeta = extractMetaContent(html, 'article:author');
  if (articleAuthorMeta) {
    return articleAuthorMeta;
  }

  return undefined;
}

function buildBlogPostingEnhancementSchema(
  options: AdvancedSchemaPluginOptions,
  routePath: string,
  title: string,
  description: string,
  imageUrl: string | undefined,
  keywords: string | undefined,
  datePublished: string | undefined,
  dateModified: string | undefined,
  authorName: string | undefined,
) {
  const pageUrl = absoluteUrl(options.siteUrl, routePath);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${pageUrl}#enhanced-post`,
    mainEntityOfPage: pageUrl,
    headline: title,
    name: title,
    description,
    url: pageUrl,
    image: imageUrl,
    keywords,
    datePublished,
    dateModified,
    inLanguage: 'en',
    about: [
      {
        '@type': 'Thing',
        name: 'Research Resources',
      },
      {
        '@type': 'Thing',
        name: 'AI Research',
      },
    ],
    author: {
      '@type': 'Person',
      name: authorName ?? options.publisherName,
    },
    publisher: {
      '@type': 'Organization',
      name: options.publisherName,
      url: options.publisherUrl,
      logo: options.publisherLogoUrl
        ? {
            '@type': 'ImageObject',
            url: options.publisherLogoUrl,
          }
        : undefined,
    },
    isPartOf: {
      '@type': 'Blog',
      name: 'News',
      url: absoluteUrl(options.siteUrl, '/news/'),
    },
  };
}

function extractListEntries(html: string): Array<{name: string; url: string}> {
  const entries: Array<{name: string; url: string}> = [];
  const seen = new Set<string>();

  const titleLinkRegex = /<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>\s*<\/h2>/gi;
  for (const match of html.matchAll(titleLinkRegex)) {
    const href = match[1];
    const name = cleanHtmlEntities(match[2].trim());
    if (!href || !name || seen.has(href)) {
      continue;
    }
    seen.add(href);
    entries.push({name, url: href});
  }

  const tagLinkRegex = /<a[^>]*class="[^"]*tagWithCount[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)<span>/gi;
  for (const match of html.matchAll(tagLinkRegex)) {
    const href = match[1];
    const name = cleanHtmlEntities(match[2].trim());
    if (!href || !name || seen.has(href)) {
      continue;
    }
    seen.add(href);
    entries.push({name, url: href});
  }

  return entries;
}

function buildItemListSchema(
  options: AdvancedSchemaPluginOptions,
  routePath: string,
  entries: Array<{name: string; url: string}>,
) {
  const pageUrl = absoluteUrl(options.siteUrl, routePath);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${pageUrl}#item-list`,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      url: absoluteUrl(options.siteUrl, entry.url.startsWith('/') ? entry.url : `/${entry.url}`),
    })),
  };
}

function shouldAddCollectionPage(html: string, routePath: string): boolean {
  if (html.includes('blog-post-page') || html.includes('docs-doc-page')) {
    return false;
  }

  if (routePath === '/') {
    return true;
  }

  return routePath.startsWith('/memo') || routePath.startsWith('/news');
}

function shouldAddTechArticle(html: string): boolean {
  return html.includes('docs-doc-page');
}

function shouldAddItemList(html: string): boolean {
  return (
    html.includes('blog-list-page') ||
    html.includes('blog-tags-list-page') ||
    html.includes('blog-tags-post-list-page') ||
    html.includes('docs-tags-list-page') ||
    html.includes('docs-tags-doc-list-page')
  );
}

function shouldAddEnhancedBlogPosting(html: string): boolean {
  return html.includes('blog-post-page');
}

export function createAdvancedSchemaPlugin(options: AdvancedSchemaPluginOptions) {
  return function advancedSchemaPlugin() {
    return {
      name: 'advanced-schema-plugin',
      postBuild({outDir}: {outDir: string}) {
        const htmlFiles = walkHtmlFiles(outDir);

        for (const htmlPath of htmlFiles) {
          const originalHtml = readFileSync(htmlPath, 'utf-8');
          if (originalHtml.includes('data-fresh-schema="advanced"')) {
            continue;
          }

          const routePath = routePathFromHtml(outDir, htmlPath);
          const title = extractTitle(originalHtml, options.siteName);
          const description =
            extractMetaContent(originalHtml, 'description') ?? 'Friendly Research Resources Hub';
          const keywords = extractMetaContent(originalHtml, 'keywords');
          const ogImage = extractMetaProperty(originalHtml, 'og:image');
          const articlePublished = extractMetaProperty(originalHtml, 'article:published_time');
          const dateModifiedMatch = originalHtml.match(/itemprop="dateModified"[^>]*datetime="([^"]+)"/i);
          const dateModified = dateModifiedMatch?.[1];
          const authorName = extractArticleAuthorName(originalHtml);

          const schemas: Array<Record<string, unknown>> = [
            buildBreadcrumbSchema(options.siteUrl, routePath),
          ];

          if (shouldAddCollectionPage(originalHtml, routePath)) {
            schemas.push(buildCollectionPageSchema(options, routePath, title, description));
          }

          if (shouldAddTechArticle(originalHtml)) {
            schemas.push(
              buildTechArticleSchema(
                options,
                routePath,
                title,
                description,
                keywords,
                dateModified,
              ),
            );
          }

          if (shouldAddEnhancedBlogPosting(originalHtml)) {
            schemas.push(
              buildBlogPostingEnhancementSchema(
                options,
                routePath,
                title,
                description,
                ogImage,
                keywords,
                articlePublished,
                dateModified,
                authorName,
              ),
            );
          }

          if (shouldAddItemList(originalHtml)) {
            const entries = extractListEntries(originalHtml);
            if (entries.length > 0) {
              schemas.push(buildItemListSchema(options, routePath, entries));
            }
          }

          const schemaScripts = schemas
            .map(
              (schema) =>
                `<script type="application/ld+json" data-fresh-schema="advanced">${JSON.stringify(schema)}</script>`,
            )
            .join('\n');

          const updatedHtml = originalHtml.replace('</head>', `${schemaScripts}\n</head>`);
          writeFileSync(htmlPath, updatedHtml, 'utf-8');
        }
      },
    };
  };
}