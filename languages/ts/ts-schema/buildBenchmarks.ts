import { rmSync } from 'node:fs';

// import UnpluginTypia from '@ryoppippi/unplugin-typia/esbuild';
import { build } from 'esbuild';
import path from 'pathe';

try {
    rmSync(path.resolve(__dirname, 'benchmarks/dist'));
} catch (_) {
    /* empty */
}

build({
    entryPoints: ['benchmark/src/_index.ts'],
    outfile: 'benchmark/dist/_index.cjs',
    target: 'node20',
    platform: 'node',
    bundle: true,
    // plugins: [UnpluginTypia()],
});
