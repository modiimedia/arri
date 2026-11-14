import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { globby } from 'globby';
import prettier from 'prettier';

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

    // RUST crates
    const cargoTomls = [
        'languages/rust/rust-client/Cargo.toml',
        'languages/rust/rust-core/Cargo.toml',
        'languages/rust/rust-derive/Cargo.toml',
    ];
    for (const cargoToml of cargoTomls) {
        const lines = readFileSync(cargoToml, { encoding: 'utf-8' }).split(
            '\n',
        );
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]!;
            // the package's own version
            if (line.startsWith('version = ')) {
                lines[i] = `version = "${version}"`;
                continue;
            }
            // dependencies on other crates in this repo
            // e.g. `arri_derive = { path = "../rust-derive", version = "0.1.0", optional = true }`
            if (line.includes('path = "../rust-')) {
                lines[i] = line.replace(
                    /version = "[^"]*"/,
                    `version = "${version}"`,
                );
            }
        }
        writeFileSync(cargoToml, lines.join('\n'));
    }
    // updates Cargo.lock
    execSync(`nx run-many -t cargo -- check`, {
        stdio: 'inherit',
    });
}

void main();
