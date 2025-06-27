import fs from 'node:fs';

import path from 'pathe';
import { defineBuildConfig } from 'unbuild';

const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './package.json'), {
        encoding: 'utf-8',
    }),
);

const deps = Object.keys(
    packageJson.dependencies as Record<string, string>,
).map((key) => key);

export default defineBuildConfig({
    rootDir: __dirname,
    entries: [
        { input: './src/_index.ts', name: 'index' },
        { input: './src/reexports/http.ts', name: 'http' },
        {
            input: './src/reexports/ws.ts',
            name: 'ws',
        },
    ],
    rollup: {
        emitCJS: true,
        dts: {
            respectExternal: true,
        },
    },
    outDir: 'dist',
    clean: true,
    declaration: true,
    failOnWarn: true,
    externals: deps,
});
