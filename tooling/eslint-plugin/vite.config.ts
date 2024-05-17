import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    cacheDir: "../../node_modules/.vite/eslint-plugin",

    plugins: [
        viteTsConfigPaths({
            root: "../../",
        }),
    ],

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
        reporters: ["default"],
        pool: "threads",
        // pollOptions: {
        //     threads: {
        //         singleThread: true,
        //     },
        // },
        cache: {
            dir: "../../node_modules/.vitest",
        },
        environment: "node",
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
});
