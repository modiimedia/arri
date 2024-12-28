import { a } from '@arrirpc/schema';
import { defineCommand } from 'citty';
import consola from 'consola';
import { readFile, writeFile } from 'fs/promises';
import { ofetch } from 'ofetch';
import path from 'pathe';

import { getArriPackageMetadata } from '../common';

export default defineCommand({
    meta: {
        name: 'use',
        description: 'Use a specific arri version',
    },
    args: {
        version: {
            type: 'positional',
            required: true,
            description:
                'The version you want to use. You can also specify a tag such as "latest".',
        },
    },
    async run({ args }) {
        const arriInfo = await getArriPackageMetadata();
        const version = arriInfo['dist-tags'][args.version] ?? args.version;
        if (!arriInfo.versions[version]) {
            throw new Error(
                `Version ${args.version} doesn't exist. Run "arri list" to see available versions.`,
            );
        }
        const globby = (await import('globby')).globby;

        // UPDATE TS DEPENDENCIES
        consola.info(`Checking for TS/JS dependencies`);
        const fileMap: Record<string, string> = {};
        const pkgJsonFiles = await globby(
            [
                'package.json',
                '**/package.json',
                'package.jsonc',
                '**/package.jsonc',
            ],
            {
                ignore: ['node_modules', '**/node_modules', '**/dist', 'dist'],
            },
        );
        const jkgJsonFileTasks: Promise<any>[] = [];
        for (const file of pkgJsonFiles) {
            jkgJsonFileTasks.push(
                readFile(path.resolve(file), 'utf8').then((content) => {
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
        const pubspecFiles = await globby(['pubspec.yaml', '**/pubspec.yaml']);
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
                readFile(path.resolve(file), 'utf8').then((content) => {
                    const result = updatePubspecYaml(content, version);
                    if (result.updated) {
                        fileMap[file] = result.content;
                    }
                }),
            );
        }
        await Promise.all(pubspecFileTasks);

        // RUST DEPENDENCIES
        consola.info('Checking for rust dependencies');
        const cargoTomlFiles = await globby([
            'cargo.toml',
            'Cargo.toml',
            '**/cargo.toml',
            '**/Cargo.toml',
        ]);
        const cargoTomlTasks: Promise<any>[] = [];
        for (const file of cargoTomlFiles) {
            cargoTomlTasks.push(
                readFile(path.resolve(file), 'utf8').then((content) => {
                    const result = updateCargoToml(content, version);
                    if (result.updated) {
                        fileMap[file] = result.content;
                    }
                }),
            );
        }
        await Promise.all(cargoTomlTasks);

        // GO DEPENDENCIES
        consola.info('Checking for go dependencies');
        const goModFiles = await globby(['go.mod', '**/go.mod']);
        const goModFileTasks: Promise<any>[] = [];
        for (const file of goModFiles) {
            goModFileTasks.push(
                readFile(path.resolve(file), 'utf8').then((content) => {
                    const result = updateGoMod(content, version);
                    if (result.updated) {
                        fileMap[file] = result.content;
                    }
                }),
            );
        }
        await Promise.all(goModFileTasks);

        // Update all affected files
        const updateTasks: Promise<any>[] = [];
        for (const key of Object.keys(fileMap)) {
            updateTasks.push(
                writeFile(path.resolve(key), fileMap[key]!, 'utf8').then(() =>
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
    const lines = fileContent.split('\n');
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
        content: output.join('\n'),
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
    const response = await ofetch('https://pub.dev/api/packages/arri_client');
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
    const lines = fileContent.split('\n');
    const output: string[] = [];
    let updated = false;
    for (const line of lines) {
        if (line.includes('arri_client: ')) {
            const parts = line.split(': ');
            if (parts.length < 2) {
                output.push(line);
                continue;
            }
            const targetPart = parts[1];
            const subParts = targetPart!.split(' ');
            subParts[0] = `^${version}`;
            parts[1] = subParts.join(' ');
            output.push(parts.join(': '));
            updated = true;
            continue;
        }
        output.push(line);
    }
    return {
        updated,
        content: output.join('\n'),
    };
}

const CratesIoPackageResponse = a.object('CratesIoPackageResponse', {
    categories: a.array(a.any()),
    crate: a.object('CratesIoCrate', {
        badges: a.array(a.any()),
        categories: a.array(a.string()),
        created_at: a.string(),
        description: a.string(),
        documentation: a.any(),
        downloads: a.uint32(),
        exact_match: a.boolean(),
        homepage: a.string(),
        id: a.string(),
        keywords: a.array(a.string()),
        links: a.object({
            owner_team: a.string(),
            owner_user: a.string(),
            owners: a.string(),
            reverse_dependencies: a.string(),
            version_downloads: a.string(),
            versions: a.nullable(a.any()),
        }),
        max_stable_version: a.string(),
        max_version: a.string(),
        name: a.string(),
        newest_version: a.string(),
        recent_downloads: a.uint32(),
        repository: a.string(),
        updated_at: a.string(),
        version: a.array(a.uint32()),
    }),
    keywords: a.array(
        a.object({
            crates_cnt: a.uint32(),
            created_at: a.string(),
            id: a.string(),
            keyword: a.string(),
        }),
    ),
    versions: a.array(
        a.object({
            audit_actions: a.array(a.any()),
            bin_names: a.array(a.any()),
            checksum: a.string(),
            crate: a.string(),
            crate_size: a.uint32(),
            created_at: a.string(),
            dl_path: a.string(),
            downloads: a.uint32(),
            features: a.any(),
            has_lib: a.boolean(),
            id: a.uint32(),
            lib_links: a.nullable(a.any()),
            license: a.string(),
            links: a.object({
                authors: a.string(),
                dependencies: a.string(),
                version_downloads: a.string(),
            }),
            num: a.string(),
            published_by: a.object({
                avatar: a.string(),
                id: a.uint32(),
                login: a.string(),
                name: a.string(),
                url: a.string(),
            }),
            readme_path: a.string(),
            rust_version: a.nullable(a.string()),
            updated_at: a.string(),
            yanked: a.boolean(),
        }),
    ),
});

type CratesIoPackageResponse = a.infer<typeof CratesIoPackageResponse>;

export async function getRustPackageMeta() {
    const response = await ofetch(
        `https://crates.io/api/v1/crates/arri_client`,
    );
    const meta = a.parse(CratesIoPackageResponse, response);
    return meta;
}

export function updateCargoToml(
    fileContent: string,
    version: string,
): { updated: boolean; content: string } {
    const lines = fileContent.split('\n');
    let updated = false;
    const newLines: string[] = [];
    for (const line of lines) {
        if (line.trim().startsWith('arri_client')) {
            let newLine = '';
            let insertChar = true;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];
                if (
                    !updated &&
                    (char === '"' || char === "'") &&
                    nextChar &&
                    Number.isInteger(Number(nextChar))
                ) {
                    newLine += char;
                    newLine += version;
                    insertChar = false;
                    updated = true;
                    continue;
                }
                if (!insertChar) {
                    if (
                        nextChar &&
                        Number.isInteger(Number(char)) &&
                        (nextChar === "'" || nextChar === '"')
                    ) {
                        insertChar = true;
                    }
                    continue;
                }
                newLine += char;
            }
            newLines.push(newLine);
            continue;
        }
        newLines.push(line);
    }
    return { updated, content: newLines.join('\n') };
}

export function updateGoMod(
    fileContent: string,
    version: string,
): { updated: boolean; content: string } {
    const lines = fileContent.split('\n');
    const newLines: string[] = [];
    let updated = false;
    for (const line of lines) {
        if (!line.includes('github.com/modiimedia/arri')) {
            newLines.push(line);
            continue;
        }
        updated = true;
        const lineParts = line.split(' ');
        const updatedLineParts: string[] = [];
        for (const part of lineParts) {
            if (part.startsWith('v') && isNumberChar(part[1] ?? '')) {
                updatedLineParts.push(`v${version}`);
                continue;
            }
            updatedLineParts.push(part);
        }
        newLines.push(updatedLineParts.join(' '));
    }
    return {
        updated,
        content: newLines.join('\n'),
    };
}

function isNumberChar(char: string) {
    return !Number.isNaN(Number(char));
}
