import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    cacheDir: "../../../node_modules/.vite/languages/rust/rust-codegen",

    plugins: [
        viteTsConfigPaths({
            root: "../../../",
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
        reporters: ["default", "html"],
        outputFile: "./.temp/reports/index.html",
        environment: "node",
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
});
