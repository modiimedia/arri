import { readFileSync } from 'node:fs';
import path from 'node:path';

import { defineBuildConfig } from 'unbuild';

const packageJson = JSON.parse(
    readFileSync(path.resolve(__dirname, './package.json'), {
        encoding: 'utf-8',
    }),
);

const deps = Object.keys(packageJson.dependencies as Record<string, string>);

export default defineBuildConfig({
    entries: ['./src/index.ts'],
    rollup: {
        emitCJS: true,
        dts: {
            respectExternal: true,
        },
    },
    outDir: 'dist',
    clean: true,
    declaration: true,
    failOnWarn: false,
    externals: deps,
});
