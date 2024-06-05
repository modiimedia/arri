import { a } from "@arrirpc/schema";
import { defineCommand } from "citty";
import consola from "consola";
import { readFile, writeFile } from "fs/promises";
import { ofetch } from "ofetch";
import path from "pathe";

import { getArriPackageMetadata } from "../common";

export default defineCommand({
    meta: {
        name: "use",
        description: "Use a specific arri version",
    },
    args: {
        version: {
            type: "positional",
            required: true,
            description:
                'The version you want to use. You can also specify a tag such as "latest".',
        },
    },
    async run({ args }) {
        const arriInfo = await getArriPackageMetadata();
        const version = arriInfo["dist-tags"][args.version] ?? args.version;
        if (!arriInfo.versions[version]) {
            throw new Error(
                `Version ${args.version} doesn't exist. Run "arri list" to see available versions.`,
            );
        }
        const globby = (await import("globby")).globby;
        // UPDATE TS DEPENDENCIES
        consola.info(`Checking for TS/JS dependencies`);
        const fileMap: Record<string, string> = {};

        const pkgJsonFiles = await globby(
            [
                "package.json",
                "**/package.json",
                "package.jsonc",
                "**/package.jsonc",
            ],
            {
                ignore: ["node_modules", "**/node_modules", "**/dist", "dist"],
            },
        );
        const jkgJsonFileTasks: Promise<any>[] = [];
        for (const file of pkgJsonFiles) {
            jkgJsonFileTasks.push(
                readFile(path.resolve(file), "utf8").then((content) => {
                    const result = updatePackageJson(content, version);
                    if (result.updated) {
                        fileMap[file] = result.content;
                    }
                }),
            );
        }

        await Promise.all(jkgJsonFileTasks);

        // UPDATE DART DEPENDENCIES
        consola.info(`Checking for dart dependencies`);
        const pubspecFiles = await globby(["pubspec.yaml", "**/pubspec.yaml"]);
        const pubspecFileTasks: Promise<any>[] = [];
        if (pubspecFiles.length) {
            const dartPackage = await getDartPackageMeta();
            let hasVersion = false;
            for (const item of dartPackage.versions) {
                if (item.version == version) {
                    hasVersion = true;
                    break;
                }
            }
            if (!hasVersion) {
                throw new Error(
                    `Version ${version} does not have Dart support`,
                );
            }
        }
        for (const file of pubspecFiles) {
            pubspecFileTasks.push(
                readFile(path.resolve(file), "utf8").then((content) => {
                    const result = updatePubspecYaml(content, version);
                    if (result.updated) {
                        fileMap[file] = result.content;
                    }
                }),
            );
        }
        await Promise.all(pubspecFileTasks);

        const updateTasks: Promise<any>[] = [];
        for (const key of Object.keys(fileMap)) {
            updateTasks.push(
                writeFile(path.resolve(key), fileMap[key]!, "utf8").then(() =>
                    consola.success(`Updated ${key}`),
                ),
            );
        }
        await Promise.all(updateTasks);
        consola.success(
            `Updated to ${version}. Rerun your install commands to update your dependencies.`,
        );
    },
});

export function updatePackageJson(
    fileContent: string,
    targetVersion: string,
): { updated: boolean; content: string } {
    const lines = fileContent.split("\n");
    const output: string[] = [];
    let updated = false;
    for (const line of lines) {
        if (line.includes(`"arri"`)) {
            output.push(updateLine(line));
            updated = true;
            continue;
        }
        if (line.includes(`"@arrirpc/`)) {
            output.push(updateLine(line));
            updated = true;
            continue;
        }
        output.push(line);
    }
    function updateLine(line: string) {
        const parts = line.split('":');
        if (parts.length < 2) {
            return line;
        }
        const targetParts = parts[1]!.split('"');
        targetParts[1] = `^${targetVersion}`;
        parts[1] = targetParts.join('"');
        return parts.join('":');
    }
    return {
        updated,
        content: output.join("\n"),
    };
}

const PubPackageResponse = a.object({
    name: a.string(),
    versions: a.array(
        a.object({
            version: a.string(),
            pubspec: a.object({
                name: a.string(),
                description: a.string(),
                version: a.string(),
                repository: a.string(),
                environment: a.object({
                    sdk: a.string(),
                }),
                dependencies: a.record(a.string()),
                dev_dependencies: a.record(a.string()),
            }),
            archive_url: a.string(),
            archive_sha256: a.string(),
            published: a.string(),
        }),
    ),
});

export async function getDartPackageMeta() {
    const response = await ofetch("https://pub.dev/api/packages/arri_client");
    const data = a.parse(PubPackageResponse, response);
    return data;
}

export function updatePubspecYaml(
    fileContent: string,
    version: string,
): {
    updated: boolean;
    content: string;
} {
    const lines = fileContent.split("\n");
    const output: string[] = [];
    let updated = false;
    for (const line of lines) {
        if (line.includes("arri_client: ")) {
            const parts = line.split(": ");
            if (parts.length < 2) {
                output.push(line);
                continue;
            }
            const targetPart = parts[1];
            const subParts = targetPart!.split(" ");
            subParts[0] = `^${version}`;
            parts[1] = subParts.join(" ");
            output.push(parts.join(": "));
            updated = true;
            continue;
        }
        output.push(line);
    }
    return {
        updated,
        content: output.join("\n"),
    };
}
