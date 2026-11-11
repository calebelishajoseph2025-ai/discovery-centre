import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const destDir = path.join(root, 'public', 'fonts');
fs.mkdirSync(destDir, { recursive: true });

const files = [
  [
    path.join(
      root,
      'node_modules',
      '@fontsource-variable',
      'fraunces',
      'files',
      'fraunces-latin-standard-normal.woff2'
    ),
    path.join(destDir, 'fraunces-latin-standard-normal.woff2'),
  ],
  [
    path.join(
      root,
      'node_modules',
      '@fontsource-variable',
      'hanken-grotesk',
      'files',
      'hanken-grotesk-latin-wght-normal.woff2'
    ),
    path.join(destDir, 'hanken-grotesk-latin-wght-normal.woff2'),
  ],
];

for (const [from, to] of files) {
  fs.copyFileSync(from, to);
  console.log('copied', path.basename(to));
}
