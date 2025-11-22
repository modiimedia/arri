import { defineConfig } from 'vitest/config';

export default defineConfig({
    cacheDir: '../../../node_modules/.vite/languages/ts/ts-server',

    // plugins: [
    //     viteTsConfigPaths({
    //         root: "../../../",
    //     }),
    // ],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [
    //    viteTsConfigPaths({
    //      root: '../../',
    //    }),
    //  ],
    // },

    test: {
        globals: true,
        pool: 'threads',
        reporters: ['default'],
        environment: 'node',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
});
