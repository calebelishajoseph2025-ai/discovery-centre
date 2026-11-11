/**
 * Script to build the production service worker from public/sw.template.js.
 * Injects __BUILD_ID__ from VERCEL_GIT_COMMIT_SHA or local timestamp.
 */

import fs from 'node:fs';
import path from 'node:path';

const templatePath = path.resolve(process.cwd(), 'public/sw.template.js');
const outputPath = path.resolve(process.cwd(), 'public/sw.js');

const buildId =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.BUILD_ID ||
  `v2-${Date.now()}`;

console.log(`[build-sw] Building service worker with BUILD_ID: ${buildId}`);

if (!fs.existsSync(templatePath)) {
  console.error(`[build-sw] Template not found at ${templatePath}`);
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf-8');
const generated = template.replace(/__BUILD_ID__/g, buildId);

fs.writeFileSync(outputPath, generated, 'utf-8');
console.log(`[build-sw] Successfully wrote ${outputPath}`);
