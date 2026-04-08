import {promises as fs} from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

type ContentRoot = 'memo' | 'news';

const contentRoots: ContentRoot[] = ['memo', 'news'];
const markdownExtensions = new Set(['.md', '.mdx']);

const alwaysIncludeRootFiles: Record<ContentRoot, string[]> = {
  memo: [],
  news: ['authors.yml', 'tags.yml'],
};

// --- Sync package.json to package-public.json ---
async function syncPackageJson() {
  const pkgPath = path.join(workspaceRoot, 'package.json');
  const pkgPublicPath = path.join(workspaceRoot, 'package-public.json');
  let pkg, pkgPublic;
  try {
    pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
  } catch (e) {
    console.warn('[prepare-public] Cannot read package.json:', e);
    return;
  }
  try {
    pkgPublic = JSON.parse(await fs.readFile(pkgPublicPath, 'utf-8'));
  } catch {
    pkgPublic = {};
  }
  // 字段同步列表
  const fields = ['dependencies', 'devDependencies', 'browserslist', 'engines'];
  for (const field of fields) {
    if (pkg[field]) {
      pkgPublic[field] = pkg[field];
    } else {
      delete pkgPublic[field];
    }
  }
  // 可选：同步 version
  if (pkg.version) pkgPublic.version = pkg.version;
  // 可选：同步 name
  if (pkgPublic.name && typeof pkgPublic.name === 'string') {
    // 保持 package-public.json 的 name 不变
  } else if (pkg.name) {
    pkgPublic.name = pkg.name + '-Public';
  }
  // 保持 private 字段
  if (typeof pkg.private !== 'undefined') pkgPublic.private = pkg.private;
  // 写回
  await fs.writeFile(pkgPublicPath, JSON.stringify(pkgPublic, null, 2) + '\n', 'utf-8');
  console.log('[prepare-public] Synced dependencies to package-public.json');
}

const workspaceRoot = process.cwd();
const outputRoot = path.join(workspaceRoot, '.public');

function isMarkdownFile(filePath: string): boolean {
  return markdownExtensions.has(path.extname(filePath).toLowerCase());
}

function normalizeLinkTarget(rawTarget: string): string {
  const cleaned = rawTarget.trim().replace(/^<|>$/g, '');
  return cleaned.split('#')[0].split('?')[0];
}

function isExternalOrAliasTarget(target: string): boolean {
  return (
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('mailto:') ||
    target.startsWith('#') ||
    target.startsWith('/') ||
    target.startsWith('@site/') ||
    target.startsWith('@theme/') ||
    target === ''
  );
}

function getVisibility(data: Record<string, unknown>): 'public' | 'secret' {
  const visibility = typeof data.visibility === 'string' ? data.visibility.trim().toLowerCase() : undefined;

  if (Array.isArray(data.access) && data.access.length > 0) {
    return 'secret';
  }

  if (visibility === 'public') {
    return 'public';
  }

  if (visibility === 'secret') {
    return 'secret';
  }

  return 'secret';
}

async function walkFiles(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, {withFileTypes: true});
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

function extractLocalTargets(markdownContent: string): string[] {
  const targets: string[] = [];
  const markdownLinkRegex = /!?\[[^\]]*]\(([^)]+)\)/g;
  const htmlAttrRegex = /(src|href)=['"]([^'"]+)['"]/g;
  const mdxImportRegex = /import\s+[^'";]+['"]([^'"]+)['"]/g;

  for (const regex of [markdownLinkRegex, htmlAttrRegex, mdxImportRegex]) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(markdownContent)) !== null) {
      const rawTarget = match[1] ?? match[2];
      if (!rawTarget) {
        continue;
      }
      const target = normalizeLinkTarget(rawTarget);
      if (!isExternalOrAliasTarget(target)) {
        targets.push(target);
      }
    }
  }

  return targets;
}

async function copyWithParents(sourceFilePath: string, sourceRootPath: string, destinationRootPath: string): Promise<void> {
  const relativePath = path.relative(sourceRootPath, sourceFilePath);
  const destinationPath = path.join(destinationRootPath, relativePath);
  await fs.mkdir(path.dirname(destinationPath), {recursive: true});
  await fs.copyFile(sourceFilePath, destinationPath);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function prepareRoot(rootName: ContentRoot): Promise<void> {
  const sourceRootPath = path.join(workspaceRoot, rootName);
  const destinationRootPath = path.join(outputRoot, rootName);

  if (!(await fileExists(sourceRootPath))) {
    console.warn(`[prepare-public] Skip missing root: ${rootName}`);
    return;
  }

  const allFiles = await walkFiles(sourceRootPath);
  const markdownFiles = allFiles.filter(isMarkdownFile);

  const includedMarkdownFiles = new Set<string>();
  const includedDirectories = new Set<string>();
  const markdownContentByPath = new Map<string, string>();

  for (const markdownFile of markdownFiles) {
    const raw = await fs.readFile(markdownFile, 'utf-8');
    const {data, content} = matter(raw);
    markdownContentByPath.set(markdownFile, content);

    if (getVisibility(data as Record<string, unknown>) === 'public') {
      includedMarkdownFiles.add(markdownFile);

      let current = path.dirname(markdownFile);
      while (current.startsWith(sourceRootPath)) {
        includedDirectories.add(current);
        if (current === sourceRootPath) {
          break;
        }
        current = path.dirname(current);
      }
    }
  }

  const includedAssetFiles = new Set<string>();
  const linkWarnings: string[] = [];

  for (const markdownFile of includedMarkdownFiles) {
    const markdownContent = markdownContentByPath.get(markdownFile) ?? '';
    const localTargets = extractLocalTargets(markdownContent);

    for (const target of localTargets) {
      const resolvedTargetPath = path.resolve(path.dirname(markdownFile), target);
      if (!(await fileExists(resolvedTargetPath))) {
        continue;
      }

      const stat = await fs.stat(resolvedTargetPath);
      if (stat.isDirectory()) {
        continue;
      }

      if (isMarkdownFile(resolvedTargetPath)) {
        if (!includedMarkdownFiles.has(resolvedTargetPath)) {
          linkWarnings.push(
            `[prepare-public] Public doc links non-public doc: ${path.relative(workspaceRoot, markdownFile)} -> ${target}`,
          );
        }
        continue;
      }

      includedAssetFiles.add(resolvedTargetPath);
    }
  }

  for (const markdownFile of includedMarkdownFiles) {
    await copyWithParents(markdownFile, sourceRootPath, destinationRootPath);
  }

  for (const assetFile of includedAssetFiles) {
    await copyWithParents(assetFile, sourceRootPath, destinationRootPath);
  }

  for (const directoryPath of includedDirectories) {
    const categoryFilePath = path.join(directoryPath, '_category_.json');
    if (await fileExists(categoryFilePath)) {
      await copyWithParents(categoryFilePath, sourceRootPath, destinationRootPath);
    }
  }

  for (const fileName of alwaysIncludeRootFiles[rootName]) {
    const alwaysIncludeFilePath = path.join(sourceRootPath, fileName);
    if (await fileExists(alwaysIncludeFilePath)) {
      await copyWithParents(alwaysIncludeFilePath, sourceRootPath, destinationRootPath);
    }
  }

  console.log(
    `[prepare-public] ${rootName}: ${includedMarkdownFiles.size} public docs, ${includedAssetFiles.size} referenced assets`,
  );

  for (const warning of linkWarnings) {
    console.warn(warning);
  }
}

async function run(): Promise<void> {
  await syncPackageJson();
  await fs.rm(outputRoot, {recursive: true, force: true});
  await fs.mkdir(outputRoot, {recursive: true});

  for (const rootName of contentRoots) {
    await prepareRoot(rootName);
  }

  console.log(`[prepare-public] Output ready: ${path.relative(workspaceRoot, outputRoot)}`);
}

run().catch((error: unknown) => {
  console.error('[prepare-public] Failed:', error);
  process.exit(1);
});
