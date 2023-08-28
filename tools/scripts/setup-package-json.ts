import { readFile, writeFile, ensureDir } from "fs-extra";
import { defineCommand, runMain } from "citty";
import path from "pathe";
import depcheck from "depcheck";
// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error, @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as prettier from "prettier";

const main = defineCommand({
    args: {
        "project-dir": {
            type: "string",
            required: true,
        },
        "root-dir": {
            type: "string",
            default: ".",
        },
        "out-dir": {
            type: "string",
            required: true,
        },
    },
    async run({ args }) {
        await prepPackageJson(
            args["project-dir"],
            args["root-dir"],
            args["out-dir"],
        );
    },
});

async function prepPackageJson(
    projectDir: string,
    rootDir: string,
    outDir: string,
) {
    const fileFile = await readFile(
        path.resolve(projectDir, "package.json"),
        "utf8",
    );
    const rootPackageJson = JSON.parse(
        await readFile(path.resolve(rootDir, "package.json"), "utf8"),
    );
    const projectPackageJson = JSON.parse(fileFile) as {
        version: string;
        dependencies: Record<string, string>;
        devDependencies: Record<string, string>;
        repository?: Record<string, string>;
        license?: string;
    };
    projectPackageJson.license = rootPackageJson.license;
    projectPackageJson.dependencies = {};
    const rootDeps = rootPackageJson.dependencies as Record<string, string>;
    projectPackageJson.version = rootPackageJson.version;
    if (!projectPackageJson.repository) {
        projectPackageJson.repository = rootPackageJson.repository;
    }
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
    const deps = await depcheck(path.resolve(projectDir), options);
    const usedDeps = Object.keys(deps.using);
    for (const dep of usedDeps) {
        if (rootDeps[dep]) {
            projectPackageJson.dependencies[dep] = rootDeps[dep];
        }
    }
    await ensureDir(path.resolve(outDir));
    await writeFile(
        path.resolve(outDir, "package.json"),
        await prettier.format(JSON.stringify(projectPackageJson), {
            parser: "json",
            tabWidth: 4,
        }),
    );
}

try {
    void runMain(main);
} catch (err) {
    console.log(process.argv);
    console.log(err);
}
