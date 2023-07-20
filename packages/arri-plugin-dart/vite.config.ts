/// <reference types="vitest" />
import { defineConfig } from "vite";

import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    cacheDir: "../../node_modules/.vite/arri-plugin-dart",

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
        cache: {
            dir: "../../node_modules/.vitest",
        },
        environment: "node",
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
});
