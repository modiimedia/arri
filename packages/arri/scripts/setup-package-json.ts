import {} from "pathe";
import { readFile, writeFile, ensureDir } from "fs-extra";
import depcheck from "depcheck";
import prettier from "prettier";

async function main() {
    const projectPackageJson = JSON.parse(
        await readFile("./packages/arri/package.json", "utf8")
    ) as {
        version: string;
        dependencies: Record<string, string>;
        devDependencies: Record<string, string>;
    };
    projectPackageJson.dependencies = {};
    const rootPackageJson = JSON.parse(await readFile("package.json", "utf8"));
    const rootDeps = rootPackageJson.dependencies as Record<string, string>;
    projectPackageJson.version = rootPackageJson.version;
    const options: depcheck.Options = {
        skipMissing: true,
        ignorePatterns: [
            "**/*.js",
            "**/*.test.ts",
            "**/*.spec.ts",
            "**/dist",
            "**/scripts/*",
            "**/node_modules",
            "**/*.config.*",
            "**/*.json",
            "**/*.route.ts",
        ],
        detectors: [
            depcheck.detector.importDeclaration,
            depcheck.detector.typescriptImportType,
        ],
        package: {
            ...rootPackageJson,
        },
    };
    const deps = await depcheck("./packages/arri", options);
    const usedDeps = Object.keys(deps.using);
    for (const dep of usedDeps) {
        if (rootDeps[dep]) {
            projectPackageJson.dependencies[dep] = rootDeps[dep];
        }
    }
    await ensureDir("./dist/packages/arri");
    await writeFile(
        "./dist/packages/arri/package.json",
        prettier.format(JSON.stringify(projectPackageJson), {
            parser: "json",
            tabWidth: 4,
        })
    );
}

void main();
