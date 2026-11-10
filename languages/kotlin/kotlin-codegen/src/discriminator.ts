import { type SchemaFormDiscriminator } from '@arrirpc/codegen-utils';

import { type CodegenContext, type KotlinProperty } from './_common';
import { kotlinInternallyTaggedSealedInterface } from './union';

/**
 * @deprecated discriminator schemas have been replaced by internally tagged unions
 */
export function kotlinDiscriminatorFromSchema(
    schema: SchemaFormDiscriminator,
    context: CodegenContext,
): KotlinProperty {
    return kotlinInternallyTaggedSealedInterface(
        schema,
        schema.discriminator,
        schema.mapping,
        'mapping',
        context,
    );
}
