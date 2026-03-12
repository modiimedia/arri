import { defineConfig } from 'vitest/config';

export default defineConfig({
    cacheDir: '../node_modules/.vite/internal/scripts',

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
        poolOptions: {
            threads: {
                singleThread: true,
            },
        },
        reporters: ['default'],
        environment: 'node',
        include: ['scripts/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
});
