import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { globby } from "globby";
import prettier from "prettier";

async function main() {
    const packageJson = JSON.parse(
        readFileSync("package.json", { encoding: "utf-8" }),
    );
    const version =
        "version" in packageJson ? (packageJson.version as string) : undefined;
    if (!version) {
        throw Error("No version in package.json file");
    }
    const pubspecParts = readFileSync(
        "packages/arri-client-dart/pubspec.yaml",
        { encoding: "utf-8" },
    ).split("\n");
    for (let i = 0; i < pubspecParts.length; i++) {
        const line = pubspecParts[i];
        if (line.startsWith("version: ")) {
            pubspecParts[i] = `version: "${version}"`;
        }
    }
    writeFileSync(
        "packages/arri-client-dart/pubspec.yaml",
        pubspecParts.join("\n"),
    );
    const childPackageJsons = await globby([
        "packages/**/package.json",
        "!**/node_modules",
    ]);
    const tasks = childPackageJsons.map(async (jsonPath) => {
        const json = JSON.parse(
            await readFile(jsonPath, { encoding: "utf-8" }),
        );
        json.version = packageJson.version;
        await writeFile(
            jsonPath,
            await prettier.format(JSON.stringify(json), {
                parser: "json",
                tabWidth: 2,
                endOfLine: "lf",
            }),
        );
    });
    await Promise.all(tasks);

    // sync test clients
    execSync("nx pub-get test-client-dart");
}

void main();
