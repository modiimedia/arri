import fs from 'node:fs';

import unpluginTypia from '@ryoppippi/unplugin-typia/esbuild';
import { build } from 'esbuild';

const bundleSizeCases = [
    'arktype',
    'arri',
    'arri-modular-imports',
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
        plugins: [unpluginTypia({})],
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
    for (const result of results) {
        console.info(`${result.name}: ${result.fileSizeKb.toLocaleString()}kb`);
    }
}

main();
