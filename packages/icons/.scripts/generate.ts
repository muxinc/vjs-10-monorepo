import { existsSync, statSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url)),
  rootDir = path.resolve(__dirname, '../'),
  srcDir = path.resolve(__dirname, '../src'),
  outDir = path.resolve(srcDir, 'icons'),
  iconsDir = path.resolve(__dirname, '../svg');

async function generate() {
  if (existsSync(outDir)) await rm(outDir, { recursive: true });
  await mkdir(outDir);

  const icons: Record<string, string> = {};
  const files = await readdir(iconsDir);

  let lastModified = 0;

  for (const file of files) {
    if (!file.endsWith('.svg')) continue;

    const fileName = path.basename(file, path.extname(file)),
      filePath = path.resolve(iconsDir, file);

    const content = (await readFile(filePath, 'utf8'))
      .replace(/<svg(.*?)>/, '')
      .replace('</svg>', '')
      .replace(/[\n\r\s\t]+/g, ' ')
      .trim();

    icons[fileName] = content;

    const lastModifiedMs = statSync(path.resolve(iconsDir, file)).mtimeMs;
    if (lastModifiedMs > lastModified) lastModified = lastModifiedMs;

    await writeFile(path.resolve(outDir, `${fileName}.ts`), `export default /* #__PURE__*/ \`${content}\` as string;`);
  }

  await writeFile(
    path.resolve(outDir, 'index.ts'),
    [
      Object.keys(icons)
        .map((name, i) => `import ${toIconName(name)} from "./${name}.js";`)
        .join('\n'),
      `export { ${Object.keys(icons)
        .map((name, i) => toIconName(name))
        .join(',\n')} }`,
      `export const paths: Record<string, string> = /* #__PURE__*/ {\n${Object.keys(icons)
        .map((name, i) => `"${name}": ${toIconName(name)}`)
        .join(',\n')}\n};`,
      `export type IconType = ${Object.keys(icons)
        .map((icon) => `"${icon}"`)
        .join('|')};`,
    ].join('\n\n')
  );

  await writeFile(
    path.resolve(outDir, 'lazy.ts'),
    [
      `export const lazyPaths: Record<string, (() => Promise<{default: string}>)> = /* #__PURE__*/ { ${Object.keys(
        icons
      )
        .map((name) => `"${name}": () => import("./${name}.js")`)
        .join(',\n')} };`,
    ].join('\n\n')
  );

  // https://github.com/unplugin/unplugin-icons?tab=readme-ov-file#use-custom-external-collection-packages
  await writeFile(
    path.resolve(rootDir, 'icons.json'),
    JSON.stringify(
      {
        prefix: 'vjs',
        icons: Object.keys(icons).reduce((prev, icon) => ({ ...prev, [icon]: { body: icons[icon] } }), {}),
        width: 32,
        height: 32,
        lastModified: Number(lastModified.toFixed(0)),
      },
      null,
      2
    )
  );
}

function toIconName(word: string) {
  return kebabToCamelCase(word) + 'Paths';
}

function kebabToCamelCase(word: string) {
  return word.replace(/-./g, (x) => x[1].toUpperCase());
}

generate();
