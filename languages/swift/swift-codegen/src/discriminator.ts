import { SchemaFormDiscriminator } from '@arrirpc/codegen-utils';

import { GeneratorContext, SwiftProperty } from './_common';
import { swiftInternallyTaggedEnum } from './union';

/**
 * @deprecated discriminator schemas are output the same way as internally tagged unions
 */
export function swiftTaggedUnionFromSchema(
    schema: SchemaFormDiscriminator,
    context: GeneratorContext,
): SwiftProperty {
    return swiftInternallyTaggedEnum(
        schema,
        schema.discriminator,
        schema.mapping,
        'mapping',
        context,
    );
}
