import { a } from '@arrirpc/schema';
import { ValidationException } from '@arrirpc/schema-interface';
import { createConsola } from 'consola';
import { ofetch } from 'ofetch';
import path from 'pathe';

export const logger = createConsola().withTag('arri');

export function isInsideDir(dir: string, parentDir: string) {
    if (path.resolve(dir).startsWith(path.resolve(parentDir))) {
        return true;
    }
    return false;
}

export async function getArriPackageMetadata() {
    const npmPackageResponse = await ofetch('https://registry.npmjs.com/arri');
    const arriInfo = a.parse(NpmRegistryPackage, npmPackageResponse);
    if (!arriInfo.success) {
        const errors = a.errors(NpmRegistryPackage, npmPackageResponse);
        throw new ValidationException({
            message: 'Error parsing response from registry',
            errors,
        });
    }
    return arriInfo.value;
}
const NpmPackageVersion = a.partial(
    a.object({
        name: a.string(),
        version: a.string(),
        _id: a.string(),
        maintainers: a.array(
            a.object({
                name: a.string(),
                email: a.string(),
            }),
        ),
        bin: a.record(a.string()),
        dist: a.any(),
        main: a.string(),
        type: a.string(),
        types: a.string(),
        module: a.string(),
        gitHead: a.string(),
        _npmUser: a.object({
            name: a.string(),
            email: a.string(),
        }),
        description: a.string(),
        directories: a.record(a.any()),
        _nodeVersion: a.string(),
        dependencies: a.record(a.string()),
        _hasShrinkWrap: a.boolean(),
        _npmOperationalInternal: a.any(),
    }),
);

const NpmRegistryPackage = a.object({
    _id: a.string(),
    _rev: a.string(),
    name: a.string(),
    description: a.string(),
    'dist-tags': a.record(a.string()),
    versions: a.record(NpmPackageVersion),
    time: a.record(a.string()),
    maintainers: a.array(
        a.object({
            name: a.string(),
            email: a.string(),
        }),
    ),
    author: a.object({
        name: a.string(),
        url: a.string(),
    }),
    repository: a.optional(
        a.partial(
            a.object({
                type: a.string(),
                url: a.string(),
                directory: a.string(),
            }),
        ),
    ),
    license: a.optional(a.string()),
    homepage: a.optional(a.string()),
    bugs: a.optional(
        a.partial(
            a.object({
                url: a.string(),
            }),
        ),
    ),
    readme: a.optional(a.string()),
    readmeFilename: a.optional(a.string()),
});
