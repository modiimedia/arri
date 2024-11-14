import { defineConfig } from "vitest/config";

export default defineConfig({
    cacheDir: "../../../node_modules/.vite/test-client-ts",

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
        pool: "threads",
        poolOptions: {
            threads: {
                singleThread: true,
            },
        },
        globals: true,
        reporters: ["default"],
        // cache: {
        //     dir: "../../../node_modules/.vitest",
        // },
        environment: "node",
        include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
});
