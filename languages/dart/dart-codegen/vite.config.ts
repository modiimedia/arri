import { defineConfig } from 'vitest/config';

export default defineConfig({
    cacheDir: '../../../node_modules/.vite/arri-codegen-dart',

    // plugins: [
    //     viteTsConfigPaths({
    //         root: "../../../",
    //     }) as any,
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
        poolOptions: {
            threads: {
                singleThread: true,
            },
        },
        reporters: ['default', 'html'],
        outputFile: '.temp/test-results/index.html',
        cache: {
            dir: '../../../node_modules/.vitest',
        },
        environment: 'node',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
});
