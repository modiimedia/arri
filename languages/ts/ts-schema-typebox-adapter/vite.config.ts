import { defineConfig } from "vitest/config";

export default defineConfig({
    cacheDir:
        "../../../node_modules/.vite/languages-ts-ts-schema-typebox-adapter",

    // plugins: [
    //     viteTsConfigPaths({
    //         root: "../../",
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
        pool: "threads",
        poolOptions: {
            threads: {
                singleThread: true,
            },
        },
        globals: true,
        reporters: ["default"],
        environment: "node",
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
});
