import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    cacheDir: "../../node_modules/.vite/arri-codegen-kotlin",

    plugins: [
        viteTsConfigPaths({
            root: "../../",
        }) as any,
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
        pool: "threads",
        poolOptions: {
            threads: {
                singleThread: true,
            },
        },
        globals: true,
        reporters: ["default", "html"],
        cache: {
            dir: "../../../node_modules/.vitest",
        },
        environment: "node",
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        outputFile: ".temp/test-results/index.html",
    },
});
