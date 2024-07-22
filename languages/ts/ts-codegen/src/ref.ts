import { pascalCase, SchemaFormRef } from "@arrirpc/codegen-utils";

import { CodegenContext, TsProperty, validVarName } from "./common";

export function tsRefFromSchema(
    schema: SchemaFormRef,
    context: CodegenContext,
): TsProperty {
    const typeName = pascalCase(validVarName(schema.ref), { normalize: true });
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const defaultValue = schema.nullable ? "null" : `${prefixedTypeName}.new()`;
    return {
        typeName: schema.nullable
            ? `${prefixedTypeName} | null`
            : prefixedTypeName,
        defaultValue,
        validationTemplate(input) {
            if (schema.nullable) {
                return `($$${prefixedTypeName}.validate(${input}) || ${input} === null)`;
            }
            return `$$${prefixedTypeName}.validate(${input})`;
        },
        fromJsonTemplate(input, target) {
            return `if (isObject(${input})) {
                    ${target} = $$${prefixedTypeName}.fromJson(${input});
                } else {
                    ${target} = ${defaultValue}; 
                }`;
        },
        toJsonTemplate(input, target, _key) {
            if (schema.nullable) {
                return `if (${input} !== null) {
                    ${target} += $$${prefixedTypeName}.toJsonString(${input});
                } else {
                    ${target} += 'null';
                }`;
            }
            return `${target} += $$${prefixedTypeName}.toJsonString(${input});`;
        },
        toQueryStringTemplate(_, __, ___) {
            return `console.warn("[WARNING] Nested objects cannot be serialized to query params. Ignoring property at ${context.instancePath}.");`;
        },
        content: "",
    };
}
