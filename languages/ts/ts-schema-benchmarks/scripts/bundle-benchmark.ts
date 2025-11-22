import fs from 'node:fs';

// import unpluginTypia from '@ryoppippi/unplugin-typia/esbuild';
import { build } from 'esbuild';
import prettier from 'prettier';

import { getPrettierConfig } from './_common';

const bundleSizeCases = [
    'arktype',
    'arri',
    'arri (modular imports)',
    'typebox',
    'typia',
    'valibot',
    'zod',
];

async function main() {
    await build({
        entryPoints: [
            ...bundleSizeCases.map((val) => `src/bundle-size/${val}.ts`),
        ],
        outdir: 'dist/bundle-size',
        bundle: true,
        // plugins: [unpluginTypia({})],
    });

    const files = bundleSizeCases.map(
        (val) => [val, `dist/bundle-size/${val}.js`] as const,
    );

    const results: { name: string; fileSizeKb: number }[] = [];
    for (const [name, file] of files) {
        const stats = fs.statSync(file);
        results.push({ name, fileSizeKb: stats.size * 0.001 });
    }
    results.sort((a, b) => (a.fileSizeKb <= b.fileSizeKb ? -1 : 1));

    const readmeLines = fs.readFileSync('README.md', 'utf8').split('\n');
    const newContentLines: string[] = [
        '| name | size (kb) |',
        '| ---- | --------- |',
    ];
    for (const result of results) {
        let name = result.name;
        if (result.name.startsWith('arri')) {
            name = `**${name}**`;
        }
        newContentLines.push(
            `| ${name} | ${result.fileSizeKb.toLocaleString()} kb |`,
        );
        console.info(`${result.name}: ${result.fileSizeKb.toLocaleString()}kb`);
    }
    newContentLines.push('');
    const newContent = newContentLines.join('\n');
    const newLines: string[] = [];
    let isSkipping = false;
    for (const line of readmeLines) {
        if (line.includes('BUNDLE_SIZE_START')) {
            isSkipping = true;
            newLines.push(line);
            newLines.push(newContent);
            continue;
        }
        if (line.includes('BUNDLE_SIZE_END')) {
            isSkipping = false;
            newLines.push(line);
            continue;
        }
        if (isSkipping) continue;
        newLines.push(line);
    }
    fs.writeFileSync(
        'README.md',
        await prettier.format(newLines.join('\n'), {
            ...getPrettierConfig(),
            parser: 'markdown',
        }),
    );
}

main();
