import { Schema } from '@arrirpc/codegen-utils';

import { GeneratorContext, isNullableType, SwiftProperty } from './_common';

export function swiftAnyFromSchema(
    schema: Schema,
    context: GeneratorContext,
): SwiftProperty {
    const isNullable = isNullableType(schema, context);
    let defaultValue = 'JSON()';
    if (schema.isNullable) {
        defaultValue = 'JSON(parseJSON: "null")';
    } else if (context.isOptional) {
        defaultValue = '';
    }
    return {
        typeName: context.isOptional ? 'JSON?' : 'JSON',
        defaultValue: defaultValue,
        isNullable,
        canBeQueryString: false,
        hasRequiredRef: false,
        fromJsonTemplate(input, target) {
            if (isNullable) {
                return `        if ${input}.exists() {
            ${target} = ${input}
        }`;
            }
            return `        ${target} = ${input}`;
        },
        toJsonTemplate(input, target) {
            if (context.isOptional) {
                return `        ${target} += serializeAny(input: ${input}!)`;
            }
            return `        ${target} += serializeAny(input: ${input})`;
        },
        toQueryPartTemplate(_, __, ___) {
            return `        print("[WARNING] any's cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: '',
    };
}
