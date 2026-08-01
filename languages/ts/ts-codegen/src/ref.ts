import { pascalCase, SchemaFormRef } from '@arrirpc/codegen-utils';

import { CodegenContext, TsProperty, validVarName } from './common';

export function tsRefFromSchema(
    schema: SchemaFormRef,
    context: CodegenContext,
): TsProperty {
    const typeName = pascalCase(validVarName(schema.ref), { normalize: true });
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const defaultValue = schema.isNullable
        ? 'null'
        : `${prefixedTypeName}New()`;
    return {
        typeName: schema.isNullable
            ? `${prefixedTypeName} | null`
            : prefixedTypeName,
        defaultValue,
        validationTemplate(input) {
            if (schema.isNullable) {
                return `(${prefixedTypeName}Validate(${input}) || ${input} === null)`;
            }
            return `${prefixedTypeName}Validate(${input})`;
        },
        fromJsonTemplate(input, target) {
            return `if (isObject(${input})) {
                    ${target} = ${prefixedTypeName}FromJson(${input});
                } else {
                    ${target} = ${defaultValue}; 
                }`;
        },
        toJsonTemplate(input, target, _key) {
            if (schema.isNullable) {
                return `if (${input} !== null) {
                    ${target} += ${prefixedTypeName}ToJsonString(${input});
                } else {
                    ${target} += 'null';
                }`;
            }
            return `${target} += ${prefixedTypeName}ToJsonString(${input});`;
        },
        setSearchParamTemplate(_, __, ___) {
            return `console.warn('[WARNING] Nested objects cannot be serialized to query string. Ignoring property at ${context.instancePath}.');`;
        },
        content: '',
    };
}
