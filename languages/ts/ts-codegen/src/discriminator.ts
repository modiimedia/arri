import { SchemaFormDiscriminator } from '@arrirpc/codegen-utils';

import { CodegenContext, TsProperty } from './common';
import { tsInternallyTaggedUnionFromSchema } from './union';

/**
 * @deprecated discriminator schemas have been replaced by internally tagged unions
 */
export function tsDiscriminatorFromSchema(
    schema: SchemaFormDiscriminator,
    context: CodegenContext,
): TsProperty {
    return tsInternallyTaggedUnionFromSchema(
        schema,
        schema.discriminator,
        schema.mapping,
        'mapping',
        context,
    );
}
