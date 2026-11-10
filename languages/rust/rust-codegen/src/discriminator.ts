import { SchemaFormDiscriminator } from '@arrirpc/codegen-utils';

import { GeneratorContext, RustProperty } from './_common';
import { rustInternallyTaggedEnumFromSchema } from './union';

/**
 * @deprecated discriminator schemas have been replaced by internally tagged unions
 */
export function rustTaggedUnionFromSchema(
    schema: SchemaFormDiscriminator,
    context: GeneratorContext,
): RustProperty {
    return rustInternallyTaggedEnumFromSchema(
        schema,
        schema.discriminator,
        schema.mapping,
        'mapping',
        context,
    );
}
