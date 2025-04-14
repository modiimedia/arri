import { SchemaFormRef } from '@arrirpc/codegen-utils';

import {
    GeneratorContext,
    isNullableType,
    SwiftProperty,
    validTypeName,
} from './_common';

export function swiftRefFromSchema(
    schema: SchemaFormRef,
    context: GeneratorContext,
): SwiftProperty {
    const typeName = validTypeName(schema.ref);
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const isNullable = isNullableType(schema, context);
    const defaultValue = isNullable ? `` : `${prefixedTypeName}()`;
    return {
        typeName: isNullable ? `${prefixedTypeName}?` : prefixedTypeName,
        isNullable,
        defaultValue,
        canBeQueryString: false,
        hasRequiredRef: !isNullable,
        fromJsonTemplate(input, target, _key) {
            if (context.isOptional) {
                return `if ${input}.exists() {
                    ${target} = ${prefixedTypeName}(json: ${input})
                }`;
            }
            if (schema.isNullable) {
                return `if ${input}.dictionary != nil {
                    ${target} = ${prefixedTypeName}(json: ${input})
                }`;
            }
            return `${target} = ${prefixedTypeName}(json: ${input})`;
        },
        toJsonTemplate(input, target) {
            const mainContent = `${target} += ${input}${isNullable ? '!' : ''}.toJSONString()`;
            if (schema.isNullable) {
                return `if ${input} != nil {
                    ${mainContent}
                } else {
                    ${target} += "null"
                }`;
            }
            return mainContent;
        },
        toQueryPartTemplate(_, __, ___) {
            return `print("[WARNING] nested objects cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        cloneTemplate(input, _) {
            return {
                bodyContent: '',
                fieldContent: `${input}${isNullable ? '?' : ''}.clone()`,
            };
        },
        content: '',
    };
}
