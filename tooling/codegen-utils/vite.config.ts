import { defineConfig } from 'vitest/config';

export default defineConfig({
    cacheDir: '../../node_modules/.vite/@arrirpc/codegen-utils',

    // plugins: [
    //     viteTsConfigPaths({
    //         root: "../../",
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
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: true,
            },
        },
        reporters: ['default'],
        globals: true,
        environment: 'node',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
});
