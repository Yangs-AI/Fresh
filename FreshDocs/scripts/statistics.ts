import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type FreshStats = {
  memo: number;
  miss: number;
  viss: number;
  algs: number;
  tabs: number;
  bibs: number;
  news: number;
};

const zeroFreshStats: FreshStats = {
memo: 0,
miss: 0,
viss: 0,
algs: 0,
tabs: 0,
bibs: 0,
news: 0,
};

type FreshType = keyof FreshStats;
const FRESH_TYPE_WHITELIST: FreshType[] = [
'memo',
'miss',
'viss',
'algs',
'tabs',
'bibs',
'news',
];

const theRoot = path.resolve(process.cwd());
const outputFile = path.join(theRoot, 'static', 'statistics.json');

const paths = {
  mdxDirs: [
    'memo/miscellaneous_recipes',
    'memo/visualization_recipes',
    'memo/algorithm_recipes',
    'memo/table_recipes',
    'memo/references_recipes',
    'news'
  ],
};

function getFilesInDir(dir: string): string[] {
  const absDir = path.join(theRoot, dir);
  if (!fs.existsSync(absDir)) return [];
  const files = fs.readdirSync(absDir, { withFileTypes: true });
  return files.filter((file) => file.isFile() && file.name.endsWith('.mdx')).map((file) => path.join(absDir, file.name));
}

function getFreshTypesFromFile(filePath: string): FreshType[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(fileContent);
  return Array.isArray(data.fresh_types) ? data.fresh_types.filter((freshType): freshType is FreshType => FRESH_TYPE_WHITELIST.includes(freshType)) : [];
}

function countFreshTypes(dirs: string[]): FreshStats {
  const freshTypeCounts = new Map<FreshType, number>();

  dirs.forEach((dir) => {
    const files = getFilesInDir(dir);
    files.forEach((file) => {
      const freshTypes = getFreshTypesFromFile(file);
      freshTypes.forEach((freshType) => {
        freshTypeCounts.set(freshType, (freshTypeCounts.get(freshType) ?? 0) + 1);
      });
    });
  });

  return {
    memo: freshTypeCounts.get('memo') ?? 0,
    miss: freshTypeCounts.get('miss') ?? 0,
    viss: freshTypeCounts.get('viss') ?? 0,
    algs: freshTypeCounts.get('algs') ?? 0,
    tabs: freshTypeCounts.get('tabs') ?? 0,
    bibs: freshTypeCounts.get('bibs') ?? 0,
    news: freshTypeCounts.get('news') ?? 0,
  } satisfies FreshStats;
}

function generateStatistics(): void {
  let statistics = countFreshTypes(paths.mdxDirs);

  statistics = {...zeroFreshStats, ...statistics}
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(statistics, null, 2));
  console.log('[statistics] Wrote', outputFile, statistics);
}

generateStatistics();