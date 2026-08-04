import { SchemaFormDiscriminator } from '@arrirpc/codegen-utils';

import {
    CodegenContext,
    getJsDocComment,
    getTsTypeName,
    TsProperty,
} from './common';
import { tsObjectFromSchema } from './object';

export function tsTaggedUnionFromSchema(
    schema: SchemaFormDiscriminator,
    context: CodegenContext,
): TsProperty {
    const typeName = getTsTypeName(schema, context);
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const defaultValue = schema.isNullable
        ? 'null'
        : `${prefixedTypeName}New()`;

    const result: TsProperty = {
        typeName: schema.isNullable
            ? `${prefixedTypeName} | null`
            : prefixedTypeName,
        defaultValue,
        validationTemplate(input: string): string {
            const mainPart = `${prefixedTypeName}Validate(${input})`;
            if (schema.isNullable) {
                return `(${mainPart} || ${input} === null)`;
            }
            return mainPart;
        },
        cloneTemplate(input, target) {
            if (schema.isNullable) {
                return `if (${input} !== null) {
                    ${target} = ${prefixedTypeName}Clone(${input});
                } else {
                    ${target} = null;    
                }`;
            }
            return `${target} = ${prefixedTypeName}Clone(${input});`;
        },
        fromJsonTemplate(input: string, target: string): string {
            return `if (isObject(${input})) {
                ${target} = ${prefixedTypeName}FromJson(${input});
            } else {
                ${target} = ${defaultValue}; 
            }`;
        },
        toJsonTemplate(input: string, target: string, _key: string): string {
            if (schema.isNullable) {
                return `if (${input} != null) {
                    ${target} += ${prefixedTypeName}ToJsonString(${input});
                } else {
                    ${target} += 'null'; 
                }`;
            }
            return `${target} += ${prefixedTypeName}ToJsonString(${input});`;
        },
        setSearchParamTemplate(_: string, __: string, ___: string): string {
            return `console.warn('[WARNING] Cannot serialize nested objects to query string. Skipping property at ${context.instancePath}.');`;
        },
        content: '',
    };
    if (context.generatedTypes.includes(typeName)) return result;
    const subTypes: { value: string; data: TsProperty }[] = [];
    const discriminatorKey = schema.discriminator;
    for (const key of Object.keys(schema.mapping)) {
        const subSchema = schema.mapping[key]!;
        const subType = tsObjectFromSchema(subSchema, {
            clientName: context.clientName,
            typePrefix: context.typePrefix,
            generatedTypes: context.generatedTypes,
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/mapping/${key}`,
            discriminatorParent: typeName,
            discriminatorKey: discriminatorKey,
            discriminatorValue: key,
            versionNumber: context.versionNumber,
            useRpcTypes: context.useRpcTypes,
            rpcGenerators: context.rpcGenerators,
            features: context.features,
        });
        subTypes.push({ value: key, data: subType });
    }
    result.content = `${getJsDocComment(schema.metadata)}export type ${prefixedTypeName} = ${subTypes.map((type) => type.data.typeName).join(' |')};`;
    result.content += `
export function ${prefixedTypeName}New(): ${prefixedTypeName} {
    return ${subTypes[0]!.data.typeName}New();
}`;
    if (context.features.validateFn) {
        result.content += `
export function ${prefixedTypeName}Validate(input: unknown): input is ${prefixedTypeName} {
    if (!isObject(input)) {
        return false;
    }
    if (typeof input.${discriminatorKey} !== 'string') {
        return false;
    }
    switch (input.${discriminatorKey}) {
${subTypes
    .map(
        (type) => `       case "${type.value}":
            return ${type.data.typeName}Validate(input);`,
    )
    .join('\n')}
        default:
            return false;
    }
}`;
    }

    if (context.features.cloneFn) {
        result.content += `
export function ${prefixedTypeName}Clone(input: ${prefixedTypeName}): ${prefixedTypeName} {
    switch (input.${discriminatorKey}) {
${subTypes
    .map(
        (type) => `        case "${type.value}":
            return ${type.data.typeName}Clone(input);`,
    )
    .join('\n')}
        default:
            throw new Error('Unimplemented');
    }
}`;
    }

    result.content += `
export function ${prefixedTypeName}FromJson(input: Record<string, unknown>): ${prefixedTypeName} {
    switch (input.${discriminatorKey}) {
${subTypes
    .map(
        (type) => `        case "${type.value}":
            return ${type.data.typeName}FromJson(input);`,
    )
    .join('\n')}
        default:
            return ${subTypes[0]!.data.typeName}New();
    }
}`;

    result.content += `
export function ${prefixedTypeName}FromJsonString(input: string): ${prefixedTypeName} {
    return ${prefixedTypeName}FromJson(JSON.parse(input));
}`;
    result.content += `
export function ${prefixedTypeName}ToJsonString(input: ${prefixedTypeName}): string {
    switch (input.${discriminatorKey}) {
${subTypes
    .map(
        (type) => `        case "${type.value}":
            return ${type.data.typeName}ToJsonString(input);`,
    )
    .join('\n')}
        default:
            throw new Error(\`Unhandled case "\${(input as any).${discriminatorKey}}"\`);
    }
}`;
    result.content += `
export function ${prefixedTypeName}ToUrlSearchParams(input: ${prefixedTypeName}): URLSearchParams {
    switch (input.${discriminatorKey}) {
${subTypes
    .map(
        (type) => `        case "${type.value}":
            return ${type.data.typeName}ToUrlSearchParams(input);`,
    )
    .join('\n')}
        default:
            throw new Error('Unhandled case');
    }
}`;
    result.content += `
export function ${prefixedTypeName}ToUrlSearchParamsString(input: ${prefixedTypeName}): string {
    return ${prefixedTypeName}ToUrlSearchParams(input).toString();
}`;
    if (context.features.validatorObj) {
        result.content += `
export const $$${prefixedTypeName}: ${context.clientName}Validator<${prefixedTypeName}> = {
    new: ${prefixedTypeName}New,
    ${context.features.validateFn ? `validate: ${prefixedTypeName}Validate,` : ''}
    ${context.features.cloneFn ? `clone: ${prefixedTypeName}Clone,` : ''}
    fromJson: ${prefixedTypeName}FromJson,
    fromJsonString: ${prefixedTypeName}FromJsonString,
    toJsonString: ${prefixedTypeName}ToJsonString,
    toUrlSearchParams: ${prefixedTypeName}ToUrlSearchParams,
    toUrlSearchParamsString: ${prefixedTypeName}ToUrlSearchParamsString,
}`;
    }
    result.content += `
${subTypes.map((type) => type.data.content).join('\n')}
`;
    context.generatedTypes.push(typeName);
    return result;
}
