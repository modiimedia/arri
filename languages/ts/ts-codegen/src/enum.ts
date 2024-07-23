import { SchemaFormEnum } from "@arrirpc/codegen-utils";

import {
    CodegenContext,
    getJsDocComment,
    getTsTypeName,
    TsProperty,
} from "./common";

export function tsEnumFromSchema(
    schema: SchemaFormEnum,
    context: CodegenContext,
): TsProperty {
    if (schema.enum.length === 0)
        throw new Error(
            `Error at ${context.schemaPath}. Enum schemas must have at least one enum value.`,
        );
    const enumName = getTsTypeName(schema, context);
    const prefixedEnumName = `${context.typePrefix}${enumName}`;
    const typeName = schema.nullable
        ? `${prefixedEnumName} | null`
        : prefixedEnumName;
    const defaultValue = schema.nullable
        ? "null"
        : `$$${prefixedEnumName}.new()`;
    const result: TsProperty = {
        typeName,
        defaultValue,
        validationTemplate(input) {
            if (schema.nullable) {
                return `($$${prefixedEnumName}.validate(${input}) || ${input} === null)`;
            }
            return `$$${prefixedEnumName}.validate(${input})`;
        },
        fromJsonTemplate(input, target) {
            return `if (typeof ${input} === 'string') {
                ${target} = $$${prefixedEnumName}.fromSerialValue(${input});
            } else {
                ${target} = ${defaultValue}; 
            }`;
        },
        toJsonTemplate(input, target) {
            if (schema.nullable) {
                return `if (typeof ${input} === 'string') {
                    ${target} += \`"\${${input}}"\`;
                } else {
                    ${target} += 'null'; 
                }`;
            }
            return `${target} += \`"\${${input}}"\``;
        },
        toQueryStringTemplate(input, target, key) {
            return `${target}.push(\`${key}=\${${input}}\`)`;
        },
        content: "",
    };
    if (context.generatedTypes.includes(enumName)) {
        return result;
    }
    const name = `${context.typePrefix}${enumName}`;
    const valuesName = `$$${name}Values`;
    result.content = `${getJsDocComment(schema.metadata)}export type ${name} = (typeof ${valuesName})[number];
const ${valuesName} = [${schema.enum.map((val) => `"${val}"`).join(", ")}] as const;
export const $$${name}: ArriEnumValidator<${name}> = {
    new(): ${name} {
        return ${valuesName}[0];
    },
    validate(input): input is ${enumName} {
        return (
            typeof input === 'string' &&
            ${valuesName}.includes(input as any)
        );
    },
    values: ${valuesName},
    fromSerialValue(input): ${name} {
        if (${valuesName}.includes(input as any)) {
            return input as ${name};
        }
        if (${valuesName}.includes(input.toLowerCase() as any)) {
            return input.toLowerCase() as ${name};
        }
        if (${valuesName}.includes(input.toUpperCase() as any)) {
            return input.toUpperCase() as ${name};
        }
        return "${schema.enum[0]}";
    }
}    
`;
    context.generatedTypes.push(enumName);
    return result;
}
