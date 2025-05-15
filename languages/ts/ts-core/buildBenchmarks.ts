import { rmSync } from 'node:fs';

import { build } from 'esbuild';
import path from 'pathe';

try {
    rmSync(path.resolve(__dirname, 'benchmark/dist'));
} catch (_) {
    /* empty */
}

build({
    entryPoints: ['benchmark/main.ts'],
    outfile: 'benchmark/dist/main.cjs',
    target: 'node22',
    platform: 'node',
    bundle: true,
    plugins: [],
});
