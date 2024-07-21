import { SchemaFormType } from "@arrirpc/codegen-utils";

import { CodegenContext, TsProperty } from "./common";

export function tsStringFromSchema(
    schema: SchemaFormType,
    _context: CodegenContext,
): TsProperty {
    const typeName = schema.nullable ? "string | null" : "string";
    const defaultValue = schema.nullable ? "null" : '""';
    return {
        typeName,
        defaultValue,
        fromJsonTemplate(input, target) {
            return `if (typeof ${input} === 'string') {
                ${target} = ${input};
            } else {
                ${target} = ${defaultValue};
            }`;
        },
        toJsonTemplate(input, target) {
            if (schema.nullable) {
                return `if (typeof ${input} === 'string') {
                    ${target} += serializeString(${input});
                } else {
                    ${target} += 'null'; 
                }`;
            }
            return `${target} += serializeString(${input});`;
        },
        toQueryStringTemplate(input, target, key) {
            return `${target}.push(\`${key}=\${${input}}\`);`;
        },
        content: "",
    };
}

export function tsBooleanFromSchema(
    schema: SchemaFormType,
    _context: CodegenContext,
): TsProperty {
    const typeName = schema.nullable ? `boolean | null` : "boolean";
    const defaultValue = schema.nullable ? `null` : "false";
    return {
        typeName,
        defaultValue,
        fromJsonTemplate(input, target) {
            return `if (typeof ${input} === 'boolean') {
                ${target} = ${input};
            } else {
                ${target} = ${defaultValue}; 
            }`;
        },
        toJsonTemplate(input, target) {
            if (schema.nullable) {
                return `if (typeof ${input} === 'boolean') {
                    ${target} += ${input}.toString();
                } else {
                    ${target} += 'null'; 
                }`;
            }
            return `${target} += ${input}.toString()`;
        },
        toQueryStringTemplate(input, target, key) {
            return `${target}.push(\`${key}=\${${input}}\`)`;
        },
        content: "",
    };
}

export function tsDateFromSchema(
    schema: SchemaFormType,
    _context: CodegenContext,
): TsProperty {
    const typeName = schema.nullable ? `Date | null` : "Date";
    const defaultValue = schema.nullable ? `null` : "new Date()";
    return {
        typeName,
        defaultValue,
        fromJsonTemplate(input, target) {
            return `if (typeof ${input} === 'string') {
                ${target} = new Date(${input});
            } else if (${input} instanceof Date) {
                ${target} = ${input}; 
            } else {
                ${target} = ${defaultValue} 
            }`;
        },
        toJsonTemplate(input, target) {
            if (schema.nullable) {
                return `if (${input} instanceof Date) {
                    ${target} += \`"\${${input}.toISOString()}"\`
                } else {
                    ${target} += 'null'; 
                }`;
            }
            return `${target} += \`"\${${input}.toISOString()}"\``;
        },
        toQueryStringTemplate(input, target, key) {
            if (schema.nullable) {
                return `${target}.push(\`${key}=\${${input}?.toISOString()}\`)`;
            }
            return `${target}.push(\`${key}=\${${input}.toISOString()}\`)`;
        },
        content: "",
    };
}

export function tsFloatFromSchema(
    schema: SchemaFormType,
    _context: CodegenContext,
): TsProperty {
    const typeName = schema.nullable ? "number | null" : "number";
    const defaultValue = schema.nullable ? "null" : "0";
    return {
        typeName,
        defaultValue,
        fromJsonTemplate(input, target) {
            return `if (typeof ${input} === 'number') {
                ${target} = ${input};
            } else {
                ${target} = ${defaultValue}; 
            }`;
        },
        toJsonTemplate(input, target) {
            if (schema.nullable) {
                return `if (typeof ${input} === 'number') {
                    ${target} += ${input}.toString();
                } else {
                    ${target} += 'null'; 
                }`;
            }
            return `${target} += ${input}.toString()`;
        },
        toQueryStringTemplate(input, target, key) {
            return `${target}.push(\`${key}=\${${input}}\`)`;
        },
        content: "",
    };
}

export function tsIntFromSchema(
    schema: SchemaFormType,
    intType: "int8" | "uint8" | "int16" | "uint16" | "int32" | "uint32",
    _context: CodegenContext,
): TsProperty {
    const typeName = schema.nullable ? "number | null" : "number";
    const defaultValue = schema.nullable ? "null" : "0";
    let min: string;
    let max: string;
    switch (intType) {
        case "int8":
            min = "INT8_MIN";
            max = "INT8_MAX";
            break;
        case "uint8":
            min = "0";
            max = "UINT8_MAX";
            break;
        case "int16":
            min = "INT16_MIN";
            max = "INT16_MAX";
            break;
        case "uint16":
            min = "0";
            max = "UINT16_MAX";
            break;
        case "int32":
            min = "INT32_MIN";
            max = "INT32_MAX";
            break;
        case "uint32":
            min = "0";
            max = "UINT32_MAX";
            break;
        default:
            intType satisfies never;
            break;
    }
    return {
        typeName,
        defaultValue,
        fromJsonTemplate(input, target) {
            return `if (
                typeof ${input} === 'number' &&
                Number.isInteger(${input}) &&
                ${input} >= ${min} &&
                ${input} <= ${max}
            ) {
                ${target} = ${input};    
            } else {
                ${target} = ${defaultValue}; 
            }`;
        },
        toJsonTemplate(input, target) {
            return `${target} += \`\${${input}}\``;
        },
        toQueryStringTemplate(input, target, key) {
            return `${target}.push(\`${key}=\${${input}}\`)`;
        },
        content: "",
    };
}

export function tsBigIntFromSchema(
    schema: SchemaFormType,
    isUnsigned: boolean,
    _context: CodegenContext,
): TsProperty {
    const typeName = schema.nullable ? `bigint | null` : `bigint`;
    const defaultValue = schema.nullable ? `null` : "BigInt(0)";
    return {
        typeName,
        defaultValue,
        fromJsonTemplate(input, target) {
            if (isUnsigned) {
                return `if (typeof ${input} === 'string' && BigInt(${input}) >= BigInt(0)) {
                    ${target} = BigInt(${input});
                } else if (typeof ${input} === 'bigint' && ${input} >= BigInt(0)) {
                    ${target} = ${input}; 
                } else {
                    ${target} = ${defaultValue}; 
                }`;
            }
            return `if (typeof ${input} === 'string') {
                ${target} = BigInt(${input});
            } else if (typeof ${input} === 'bigint') {
                ${target} = ${input}; 
            } else {
                ${target} = ${defaultValue}; 
            }`;
        },
        toJsonTemplate(input, target) {
            if (schema.nullable) {
                return `if (typeof ${input} === 'bigint') {
                    ${target} += \`"\${${input}.toString()}"\`
                } else {
                    ${target} += 'null'; 
                }`;
            }
            return `${target} += \`"\${${input}.toString()}"\``;
        },
        toQueryStringTemplate(input, target, key) {
            if (schema.nullable) {
                return `${target}.push(\`${key}=\${${input}?.toString()}\`)`;
            }
            return `${target}.push(\`${key}=\${${input}.toString()}\`)`;
        },
        content: "",
    };
}
