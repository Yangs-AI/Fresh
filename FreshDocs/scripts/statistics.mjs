import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const repoRoot = path.resolve(process.cwd());
const outputFile = path.join(repoRoot, 'static', 'statistics.json');

const paths = {
  mdxDirs: [
    'memo/visualization_recipes',
    'memo/table_recipes',
    // 'memo/references_recipes',
  ],
};

function getFilesInDir(dir) {
  const absDir = path.join(repoRoot, dir);
  if (!fs.existsSync(absDir)) return [];
  const files = fs.readdirSync(absDir, { withFileTypes: true });
  return files.filter((file) => file.isFile() && file.name.endsWith('.mdx')).map((file) => path.join(absDir, file.name));
}

function getFreshTypesFromFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(fileContent);
  return data.fresh_types || [];
}

function countFreshTypes(dirs) {
  const freshTypeCounts = {};

  dirs.forEach((dir) => {
    const files = getFilesInDir(dir);
    files.forEach((file) => {
      const freshTypes = getFreshTypesFromFile(file);
      freshTypes.forEach((freshType) => {
        freshTypeCounts[freshType] = (freshTypeCounts[freshType] || 0) + 1;
      });
    });
  });

  return freshTypeCounts;
}

function generateStatistics() {
  const stats = countFreshTypes(paths.mdxDirs);

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  fs.writeFileSync(outputFile, JSON.stringify(stats, null, 2));
  console.log('[statistics] Wrote', outputFile, stats);
}

generateStatistics();