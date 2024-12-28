import { defineConfig } from 'vitest/config';

export default defineConfig({
    cacheDir: '../../../node_modules/.vite/languages-ts-eslint-plugin',

    plugins: [],

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
        reporters: ['default'],
        pool: 'threads',
        // pollOptions: {
        //     threads: {
        //         singleThread: true,
        //     },
        // },
        environment: 'node',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
});
