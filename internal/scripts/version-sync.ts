import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { globby } from 'globby';
import { indexOf } from 'lodash';
import prettier from 'prettier';
import { updateCargoToml } from './version-sync-utils';

async function main() {
    const packageJson = JSON.parse(
        readFileSync('package.json', { encoding: 'utf-8' }),
    );
    const version =
        'version' in packageJson ? (packageJson.version as string) : undefined;
    if (!version) {
        throw Error('No version in package.json file');
    }
    // DART packages
    const pubspecParts = readFileSync(
        'languages/dart/dart-client/pubspec.yaml',
        { encoding: 'utf-8' },
    ).split('\n');
    for (let i = 0; i < pubspecParts.length; i++) {
        const line = pubspecParts[i]!;
        if (line.startsWith('version: ')) {
            pubspecParts[i] = `version: "${version}"`;
        }
    }
    writeFileSync(
        'languages/dart/dart-client/pubspec.yaml',
        pubspecParts.join('\n'),
    );
    const dartChangelog = readFileSync(
        'languages/dart/dart-client/CHANGELOG.md',
        'utf8',
    );
    writeFileSync(
        'languages/dart/dart-client/CHANGELOG.md',
        `## ${version}\n\n${dartChangelog}`,
    );
    // PACKAGE JSONS
    const childPackageJsons = await globby([
        'languages/**/package.json',
        'tooling/**/package.json',
        '!**/node_modules',
    ]);
    const tasks = childPackageJsons.map(async (jsonPath) => {
        const json = JSON.parse(
            await readFile(jsonPath, { encoding: 'utf-8' }),
        );
        json.version = packageJson.version;
        await writeFile(
            jsonPath,
            await prettier.format(JSON.stringify(json), {
                parser: 'json',
                tabWidth: 2,
                endOfLine: 'lf',
            }),
        );
    });
    await Promise.all(tasks);
    // sync test clients
    execSync('nx run-many -t pub -- get', {
        stdio: 'inherit',
    });

    // RUST Libs
    const childCargoTomls = await globby([
        'languages/**/Cargo.toml',
        'tooling/**/Cargo.toml',
        '!target',
        '!node_modules',
    ]);
    const cargoTomlTasks = childCargoTomls.map(async (file) => {
        const content = await readFile(file, { encoding: 'utf8' });
        const newContent = updateCargoToml(content, version);
        await writeFile(file, newContent, 'utf8');
    });
    await Promise.all(cargoTomlTasks);
    execSync(`nx run-many -t cargo -- check`, {
        stdio: 'inherit',
    });
}

void main();
