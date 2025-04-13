import { SchemaFormValues } from '@arrirpc/codegen-utils';

import {
    GeneratorContext,
    isNullableType,
    SwiftProperty,
    validSwiftKey,
} from './_common';
import { swiftTypeFromSchema } from './_index';

export function swiftDictionaryFromSchema(
    schema: SchemaFormValues,
    context: GeneratorContext,
): SwiftProperty {
    const subType = swiftTypeFromSchema(schema.values, {
        clientVersion: context.clientVersion,
        clientName: context.clientName,
        typePrefix: context.typePrefix,
        instancePath: `${context.instancePath}/[value]`,
        schemaPath: `${context.schemaPath}/values`,
        generatedTypes: context.generatedTypes,
        containsRequiredRef: context.containsRequiredRef,
    });
    const isNullable = isNullableType(schema, context);
    const typeName = isNullable
        ? `Dictionary<String, ${subType.typeName}>?`
        : `Dictionary<String, ${subType.typeName}>`;
    const defaultValue = isNullable ? `` : `Dictionary()`;
    return {
        typeName,
        isNullable,
        defaultValue,
        canBeQueryString: false,
        hasRequiredRef: false,
        fromJsonTemplate(input, target, _) {
            const mainContent = `        ${target} = Dictionary()
            for (__key, __value) in ${input}.dictionary ?? Dictionary() {
                var __parsedValue: ${subType.typeName}
                ${subType.fromJsonTemplate(`__value`, `__parsedValue`, `__parsedValue`)}
                ${target}${isNullable ? '!' : ''}[__key] = __parsedValue            
            }`;
            if (context.isOptional) {
                return `        if ${input}.exists() {
${mainContent}
                }`;
            }
            if (schema.isNullable) {
                return `        if ${input}.dictionary != nil {
${mainContent}
                }`;
            }
            return mainContent;
        },
        toJsonTemplate(input, target) {
            const mainContent = `        ${target} += "{"
            for (__index, (__key, __value)) in ${input}${isNullable ? '!' : ''}.enumerated() {
                if __index > 0 {
                    ${target} += ","
                }
                ${target} += "\\(serializeString(input: __key)):"
                ${subType.toJsonTemplate('__value', target)}
            }
            ${target} += "}"`;
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
            return `        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        cloneTemplate(input, key) {
            const innerKey = validSwiftKey(key);
            const subTypeClonedResult = subType.cloneTemplate?.(
                `__${innerKey}Value`,
                `__${innerKey}Value`,
            );
            if (isNullable) {
                return {
                    bodyContent: `var __${innerKey}Cloned: ${typeName}
                    if ${input} != nil {
                        __${innerKey}Cloned = Dictionary()
                        for (__${innerKey}Key, __${innerKey}Value) in ${input}! {
                            ${subTypeClonedResult?.bodyContent ?? ''}
                            __${innerKey}Cloned![__${innerKey}Key] = ${subTypeClonedResult?.fieldContent ?? `__${innerKey}Value`}
                        }          
                    }`,
                    fieldContent: `__${innerKey}Cloned`,
                };
            }
            return {
                bodyContent: `var __${innerKey}Cloned: ${typeName} = Dictionary()
                    for (__${innerKey}Key, __${innerKey}Value) in ${input} {
                        ${subTypeClonedResult?.bodyContent ?? ''}
                        __${innerKey}Cloned[__${innerKey}Key] = ${subTypeClonedResult?.fieldContent ?? `__${innerKey}Value`}
                    }`,
                fieldContent: `__${innerKey}Cloned`,
            };
        },
        content: subType.content,
    };
}
