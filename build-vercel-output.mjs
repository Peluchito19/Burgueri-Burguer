import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const rootDir = process.cwd();
const outputDir = join(rootDir, '.vercel', 'output');
const staticDir = join(outputDir, 'static');

const staticFiles = [
  'index.html',
  'app.js',
  'poster-layout.js',
  'styles-cartilla-completa.css',
];

await rm(outputDir, { recursive: true, force: true });
await mkdir(staticDir, { recursive: true });

for (const file of staticFiles) {
  await cp(join(rootDir, file), join(staticDir, file));
}

await cp(join(rootDir, 'public'), join(staticDir, 'public'), { recursive: true });

await writeFile(
  join(outputDir, 'config.json'),
  `${JSON.stringify({ version: 3 }, null, 2)}\n`
);