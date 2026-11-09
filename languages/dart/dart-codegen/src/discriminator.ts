import { SchemaFormDiscriminator } from '@arrirpc/codegen-utils';

import { CodegenContext, DartProperty } from './_common';
import { dartInternallyTaggedSealedClass } from './union';

/**
 * @deprecated discriminator schemas have been replaced by internally tagged unions
 */
export function dartSealedClassFromSchema(
    schema: SchemaFormDiscriminator,
    context: CodegenContext,
): DartProperty {
    return dartInternallyTaggedSealedClass(
        schema,
        schema.discriminator,
        schema.mapping,
        'mapping',
        context,
    );
}
