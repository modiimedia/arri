import fs from 'node:fs';
import path from 'node:path';

import prettier from 'prettier';

import { a } from './src/_index';

const BenchmarkResult = a.object({
    name: a.string(),
    date: a.timestamp(),
    version: a.any(),
    results: a.array(
        a.object({
            name: a.string(),
            ops: a.float64(),
            margin: a.float64(),
            percentSlower: a.float64(),
        }),
    ),
    fastest: a.object({
        name: a.string(),
        index: a.uint32(),
    }),
    slowest: a.object({
        name: a.string(),
        index: a.uint32(),
    }),
});
type BenchmarkResult = a.infer<typeof BenchmarkResult>;
const $$BenchmarkResult = a.compile(BenchmarkResult);

function handleLibResult(result: BenchmarkResult) {
    result.results.sort((a, b) => {
        if (a.ops > b.ops) return -1;
        if (a.ops === b.ops) {
            if (a.name < b.name) return -1;
            return 1;
        }
        return 1;
    });
    const parts: string[] = [
        `#### ${result.name}`,
        '',
        `| Library | op/s |`,
        `| --- | --- |`,
    ];
    for (const lib of result.results) {
        let titlePart = lib.name;
        if (lib.name.startsWith('Arri')) {
            titlePart = `**${lib.name}**`;
        }
        parts.push(`| ${titlePart} | ${lib.ops.toLocaleString()}`);
    }
    return parts.join('\n');
}

function handleResultFiles(files: string[], target: string[]) {
    for (const file of files) {
        const result = $$BenchmarkResult.parseUnsafe(
            fs.readFileSync(
                path.resolve(__dirname, 'benchmark/dist', file),
                'utf8',
            ),
        );
        target.push(handleLibResult(result));
    }
}

async function main() {
    const benchParts: string[] = [
        '### Objects',
        `The following type was used in these benchmarks. Equivalent schemas were created in each of the mentioned libraries.`,
        `\`\`\`ts
interface TestUser {
    id: number; // integer,
    role: 'standard' | 'admin' | 'moderator';
    name: string;
    email: string | null;
    createdAt: number; // integer
    updatedAt: number; // integer
    settings:
        | {
              preferredTheme: 'light' | 'dark' | 'system';
              allowNotifications: boolean;
          }
        | undefined;
    recentNotifications: Array<
        | {
              type: 'POST_LIKE';
              userId: string;
              postId: string;
          }
        | {
              type: 'POST_COMMENT';
              userId: string;
              postId: string;
              commentText: string;
          }
    >;
}
\`\`\``,
    ];
    handleResultFiles(
        [
            'objects-validation-good-input.json',
            'objects-validation-bad-input.json',
            'objects-parsing-good-input.json',
            'objects-parsing-bad-input.json',
            'objects-serialization.json',
            'objects-coercion.json',
        ],
        benchParts,
    );
    benchParts.push(
        '### Integers',
        'The following benchmarks measure how quickly each library operates on a single integer value.',
    );
    handleResultFiles(
        [
            'int-validation-good-input.json',
            'int-validation-bad-input.json',
            'int-parsing-good-input.json',
            'int-parsing-bad-input.json',
            'int-serialization.json',
            'int-coercion-good-input.json',
            'int-coercion-bad-input.json',
        ],
        benchParts,
    );

    const readmePath = path.resolve(__dirname, 'README.md');
    const readmeLines = fs.readFileSync(readmePath, 'utf8').split('\n');

    const newReadmeLines: string[] = [];
    let isSkipping = false;
    for (const line of readmeLines) {
        if (line.includes('<!-- BENCHMARK_START -->')) {
            isSkipping = true;
            newReadmeLines.push(line);
            newReadmeLines.push(benchParts.join('\n\n'));
            continue;
        }
        if (line.includes('<!-- BENCHMARK_END -->')) {
            isSkipping = false;
            newReadmeLines.push(line);
            continue;
        }
        if (isSkipping) {
            continue;
        }
        if (line.startsWith('_Last Updated:')) {
            newReadmeLines.push(`_Last Updated: ${new Date().toISOString()}_`);
        }
        newReadmeLines.push(line);
    }
    const prettierConfig = JSON.parse(
        fs.readFileSync(
            path.resolve(__dirname, '../../../.prettierrc'),
            'utf8',
        ),
    );
    fs.writeFileSync(
        readmePath,
        await prettier.format(newReadmeLines.join('\n'), {
            ...prettierConfig,
            parser: 'markdown',
        }),
    );
}

main();
