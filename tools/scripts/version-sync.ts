import { readFileSync, writeFileSync } from "fs";

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
}

void main();
