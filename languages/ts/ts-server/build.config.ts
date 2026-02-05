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
        {
            input: './src/reexports/ws_adapters_bun.ts',
            name: 'ws_adapters_bun',
        },
        {
            input: './src/reexports/ws_adapters_cloudflare.ts',
            name: 'ws_adapters_cloudflare',
        },
        {
            input: './src/reexports/ws_adapters_deno.ts',
            name: 'ws_adapters_deno',
        },
        {
            input: './src/reexports/ws_adapters_node.ts',
            name: 'ws_adapters_node',
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
