import { build } from 'esbuild';
import { readFileSync, rmdirSync, rmSync } from 'fs';
import path from 'path';
import { test } from 'vitest';

const outDir = path.resolve(import.meta.dirname, '../.tmp/bundles');

beforeAll(() => {
    rmSync(outDir, {
        recursive: true,
        force: true,
    });
});

test('unused fn get removed by bundlers', async () => {
    await build({
        entryPoints: [path.resolve(import.meta.dirname, 'bundleService.ts')],
        outdir: outDir,
        bundle: true,
    });
    await build({
        entryPoints: [path.resolve(import.meta.dirname, 'bundleUtils.ts')],
        outdir: outDir,
        bundle: true,
    });

    const bundledService = readFileSync(
        path.resolve(outDir, 'bundleService.js'),
        'utf8',
    );
    const bundledUtils = readFileSync(
        path.resolve(outDir, 'bundleUtils.js'),
        'utf8',
    );

    expect(
        bundledService.length > bundledUtils.length,
        'service should be larger than utils',
    ).toBe(true);

    expect(bundledService.includes('BookParams')).toBe(true);
    expect(bundledService.includes('BookParamsToUrlSearchParams')).toBe(true);
    expect(bundledService.includes('BookFromJson')).toBe(true);
    expect(bundledService.includes('BookToJsonString')).toBe(true);
    expect(bundledService.includes('BookValidate')).toBe(false); // validate is never used so it shouldn't be present
    expect(bundledService.includes('BookParamsFromJson')).toBe(false); // BookParams is used on a get request therefore FromJson should never be used
    expect(bundledService.includes('Discriminator')).toBe(false);
    expect(bundledService.includes('NestedObject')).toBe(false);

    expect(bundledUtils.includes('RecursiveObject')).toBe(true);
    expect(bundledUtils.includes('RecursiveObjectFromJsonString')).toBe(true);
    expect(bundledUtils.includes('RecursiveObjectValidate')).toBe(true);
    expect(bundledUtils.includes('RecursiveObjectToJson')).toBe(false);
    expect(bundledUtils.includes('RecursiveObjectToUrlSearchParams')).toBe(
        false,
    );
    expect(bundledUtils.includes('RecursiveObjectNew')).toBe(false);
    expect(bundledUtils.includes('Book')).toBe(false);
});
