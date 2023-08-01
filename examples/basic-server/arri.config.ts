import { defineArriConfig } from "arri";

export default defineArriConfig({
    tsConfig: "tsconfig.json",
    routes: [
        {
            filePatterns: ["src/**/*.route.ts"],
        },
    ],
});
