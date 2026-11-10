import { pascalCase, SchemaFormEnum } from '@arrirpc/codegen-utils';

import {
    CodegenContext,
    defaultCloneTemplate,
    getJsDocComment,
    getTsTypeName,
    TsProperty,
    validVarName,
} from './common';

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
    const typeName = schema.isNullable
        ? `${prefixedEnumName} | null`
        : prefixedEnumName;
    const defaultValue = schema.isNullable
        ? 'null'
        : `${prefixedEnumName}New()`;
    const result: TsProperty = {
        typeName,
        defaultValue,
        validationTemplate(input) {
            if (schema.isNullable) {
                return `(${prefixedEnumName}Validate(${input}) || ${input} === null)`;
            }
            return `${prefixedEnumName}Validate(${input})`;
        },
        cloneTemplate: defaultCloneTemplate,
        fromJsonTemplate(input, target) {
            return `if (typeof ${input} === 'string') {
                ${target} = ${prefixedEnumName}FromSerialValue(${input});
            } else {
                ${target} = ${defaultValue}; 
            }`;
        },
        toJsonTemplate(input, target) {
            if (schema.isNullable) {
                return `if (typeof ${input} === 'string') {
                    ${target} += \`"\${${input}}"\`;
                } else {
                    ${target} += 'null'; 
                }`;
            }
            return `${target} += \`"\${${input}}"\``;
        },
        setSearchParamTemplate(input, target, key) {
            if (schema.isNullable) {
                return `${target}.set('${key}', \`\${${input}}\`);`;
            }
            return `${target}.set('${key}', ${input})`;
        },
        content: '',
    };
    if (context.generatedTypes.includes(enumName)) {
        return result;
    }
    const name = `${context.typePrefix}${enumName}`;
    const valuesName = `${name}Values`;
    result.content = `${getJsDocComment(schema.metadata)}export type ${name} = ${schema.enum.map((val) => `'${val}'`).join(' | ')};
export const ${name} = {
${schema.enum
    .map((val) => {
        let str = '    ';
        str += `${pascalCase(validVarName(val), { normalize: true })}:`;
        str += ` '${val}',`;
        return str;
    })
    .join('\n')}
} as const;
export const ${valuesName} = [${schema.enum.map((val) => `'${val}'`).join(', ')}] as const;`;
    result.content += `
export function ${name}New(): ${name} {
    return ${valuesName}[0];
}`;
    if (context.features.validateFn) {
        result.content += `
export function ${name}Validate(input: unknown): input is ${name} {
    return typeof input === 'string' && ${valuesName}.includes(input as any);
}`;
    }
    result.content += `
export function ${name}FromSerialValue(input: string): ${name} {
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
}`;
    if (context.features.validatorObj) {
        result.content += `
export const $$${name}: ${context.clientName}EnumValidator<${name} > = {
    new: ${name}New,
    ${context.features.validateFn ? `validate: ${name}Validate,` : ''} 
    values: ${valuesName},
    fromSerialValue: ${name}FromSerialValue,
}`;
    }
    context.generatedTypes.push(enumName);
    return result;
}
