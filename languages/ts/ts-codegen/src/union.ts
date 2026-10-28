import { Schema, SchemaFormUnion } from '@arrirpc/codegen-utils';

import { tsTypeFromSchema } from './_index';
import {
    CodegenContext,
    getJsDocComment,
    getTsTypeName,
    TsProperty,
} from './common';

export function tsTaggedUnionFromSchema(
    schema: SchemaFormUnion,
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
            return `console.warn('[WARNING] Cannot serialize nested unions to query string. Skipping property at ${context.instancePath}.');`;
        },
        content: '',
    };
    if (context.generatedTypes.includes(typeName)) return result;
    const needsInjectedTagField =
        (schema.tagKey?.length ?? 0) > 0 &&
        (schema.valueKey?.length ?? 0) === 0;
    const subTypes: { data: TsProperty; key: string }[] = [];
    for (const key of Object.keys(schema.union)) {
        const subSchema = schema.union[key]!;
        const subType = tsTypeFromSchema(subSchema, {
            clientName: context.clientName,
            typePrefix: context.typePrefix,
            generatedTypes: context.generatedTypes,
            instancePath: `${context.instancePath}/${key}`,
            schemaPath: `${context.schemaPath}/union/${key}`,
            discriminatorParent: needsInjectedTagField ? typeName : '',
            discriminatorKey: needsInjectedTagField
                ? (schema.tagKey ?? '')
                : '',
            discriminatorValue: needsInjectedTagField ? key : '',
            versionNumber: context.versionNumber,
            useRpcTypes: context.useRpcTypes,
            rpcGenerators: context.rpcGenerators,
            features: context.features,
        });
        subTypes.push({ data: subType, key: key });
    }
    if (schema.tagKey && schema.valueKey) {
        result.content = _internallyTaggedWithValueKeyContent(
            typeName,
            prefixedTypeName,
            subTypes,
            schema,
            context,
        );
    } else if (schema.tagKey) {
        result.content = _internallyTaggedContent(
            typeName,
            prefixedTypeName,
            subTypes,

            schema,
            context,
        );
    } else {
        result.content = _externallyTaggedContent(
            typeName,
            prefixedTypeName,
            subTypes,
            schema,
            context,
        );
    }
    return result;
}

function _externallyTaggedContent(
    typeName: string,
    prefixedTypeName: string,
    subTypes: { data: TsProperty; key: string }[],
    schema: SchemaFormUnion,
    context: CodegenContext,
): string {
    let content = `${getJsDocComment(schema.metadata)}export type ${prefixedTypeName} = ${subTypes.map((type) => `{ type: \`${type.key}\`; value: ${type.data.typeName} }`).join(' |')};`;
    content += `
export function ${prefixedTypeName}New(): ${prefixedTypeName} {
    return {
        type: \`${subTypes[0]?.key}\`,
        value: ${subTypes[0]?.data.defaultValue},
    };
}`;
    if (context.features.validateFn) {
        content += `
export function ${prefixedTypeName}Validate(input: unknown): input is ${prefixedTypeName} {
    if (!isObject(input)) {
        return false;
    }
    if (!('type' in input) || !('value' in input)) {
        return false;
    }
    switch (input.type) {
${subTypes
    .map(
        (sub) => `
        case \`${sub.key}\`:
            return ${sub.data.validationTemplate(`input.value`)};
    `,
    )
    .join('\n')}
        default:
            return false;
    }
}`;
    }

    if (context.features.cloneFn) {
        content += `
export function ${prefixedTypeName}Clone(input: ${prefixedTypeName}): ${prefixedTypeName} {
    switch (input.type) {
${subTypes
    .map(
        (sub) => `
        case \`${sub.key}\`: {
            let __value__: ${sub.data.typeName};
            ${sub.data.cloneTemplate('input.value', `__value__`)}
            return {
                type: \`${sub.key}\`,
                value: __value__,
            };
        }`,
    )
    .join('\n')}
        default:
            input satisfies never;
            throw new Error(\`Unknown union variant: \${(input as any).type}\`);
   }
}`;
    }

    content += `
export function ${prefixedTypeName}FromJson(input: Record<string, unknown>): ${prefixedTypeName} {
${subTypes
    .map(
        (sub) => `
    if (\`${sub.key}\` in input) {
        let __value__: ${sub.data.typeName};
        ${sub.data.fromJsonTemplate(`input[\`${sub.key}\`]`, '__value__')}
        return {
            type: \`${sub.key}\`,
            value: __value__,
        }
    }`,
    )
    .join('\n')}
    return ${prefixedTypeName}New();
}`;

    content += `
export function ${prefixedTypeName}FromJsonString(input: string): ${prefixedTypeName} {
    return ${prefixedTypeName}FromJson(JSON.parse(input));
}`;
    content += `
export function ${prefixedTypeName}ToJsonString(input: ${prefixedTypeName}): string {
    switch (input.type) {
${subTypes
    .map(
        (sub) => `
        case \`${sub.key}\`: {
            let json = '{';
            json += serializeString(input.type);
            json += ':';
            ${sub.data.toJsonTemplate('input.value', 'json', '')}
            json += '}';
            return json;
        }
        `,
    )
    .join('\n')}
        default: {
            input satisfies never;
            throw new Error(\`Unknown variant type: \${(input as any).type}\`);
        }
    }
}`;
    content += `
export function ${prefixedTypeName}ToUrlSearchParams(input: ${prefixedTypeName}): URLSearchParams {
    const params = new URLSearchParams();
    console.warn('[WARNING] Cannot serialize unions to query string.');
    return params;
}`;
    content += `
export function ${prefixedTypeName}ToUrlSearchParamsString(input: ${prefixedTypeName}): string {
    return ${prefixedTypeName}ToUrlSearchParams(input).toString();
}`;
    if (context.features.validatorObj) {
        content += `
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
    content += `
${subTypes.map((type) => type.data.content).join('\n')}
`;
    context.generatedTypes.push(typeName);
    return content;
}

function _internallyTaggedContent(
    typeName: string,
    prefixedTypeName: string,
    subTypes: { data: TsProperty; key: string }[],
    schema: SchemaFormUnion,
    context: CodegenContext,
): string {
    let content = `${getJsDocComment(schema.metadata)}export type ${prefixedTypeName} = ${subTypes.map((type) => type.data.typeName).join(' |')};`;
    content += `
export function ${prefixedTypeName}New(): ${prefixedTypeName} {
    return ${subTypes[0]?.data.typeName}New();
}`;
    if (context.features.validateFn) {
        content += `
export function ${prefixedTypeName}Validate(input: unknown): input is ${prefixedTypeName} {
    return (
        ${subTypes.map((value) => `${value.data.typeName}Validate(input)`).join(' || ')}
    );
}`;
    }

    if (context.features.cloneFn) {
        content += `
export function ${prefixedTypeName}Clone(input: ${prefixedTypeName}): ${prefixedTypeName} {
    switch (input.${schema.tagKey}) {
${subTypes
    .map(
        (sub) => `
        case \`${sub.key}\`: {
            let __value__: ${sub.data.typeName};
            ${sub.data.cloneTemplate('input', '__value__')};
            return __value__;
        }`,
    )
    .join('\n')}
        default: {
            input satisfies never;
            throw new Error(\`Unknown union variant: \${(input as any).${schema.tagKey}}\`);
        }
   }
}`;
    }

    content += `
export function ${prefixedTypeName}FromJson(input: Record<string, unknown>): ${prefixedTypeName} {
    switch (input[\`${schema.tagKey}\`]) {
${subTypes
    .map(
        (sub) => `       case \`${sub.key}\`: {
            return ${sub.data.typeName}FromJson(input);
        }`,
    )
    .join('\n')}
        default: {
            return ${subTypes[0]?.data.typeName}New();
        }
    }
}`;

    content += `
export function ${prefixedTypeName}FromJsonString(input: string): ${prefixedTypeName} {
    return ${prefixedTypeName}FromJson(JSON.parse(input));
}`;
    content += `
export function ${prefixedTypeName}ToJsonString(input: ${prefixedTypeName}): string {
    switch (input[\`${schema.tagKey}\`]) {
${subTypes
    .map(
        (sub) => `
        case \`${sub.key}\`: {
            return ${sub.data.typeName}ToJsonString(input);
        }
        `,
    )
    .join('\n')}
        default: {
            input satisfies never;
            throw new Error(\`Unknown variant type: \${(input as any).type}\`);
        }
    }
}`;
    content += `
export function ${prefixedTypeName}ToUrlSearchParams(input: ${prefixedTypeName}): URLSearchParams {
    switch (input[\`${schema.tagKey}\`]) {
        ${subTypes
            .map(
                (sub) => `case \`${sub.key}\`: {
            return ${sub.data.typeName}ToUrlSearchParams(input);
        }`,
            )
            .join('\n')}
        default: {
            input satisfies never;
            throw new Error(\`Unknown variant type: \${(input as any).${schema.tagKey}}\`);
        }
    }
}`;
    content += `
export function ${prefixedTypeName}ToUrlSearchParamsString(input: ${prefixedTypeName}): string {
    return ${prefixedTypeName}ToUrlSearchParams(input).toString();
}`;
    if (context.features.validatorObj) {
        content += `
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
    content += `
${subTypes.map((type) => type.data.content).join('\n')}
`;
    context.generatedTypes.push(typeName);
    return content;
}

function _internallyTaggedWithValueKeyContent(
    typeName: string,
    prefixedTypeName: string,
    subTypes: { data: TsProperty; key: string }[],
    schema: SchemaFormUnion,
    context: CodegenContext,
): string {
    let content = `${getJsDocComment(schema.metadata)}export type ${prefixedTypeName} = ${subTypes.map((type) => `{ ${schema.tagKey}: \`${type.key}\`; ${schema.valueKey}: ${type.data.typeName} }`).join(' |')};`;
    content += `
export function ${prefixedTypeName}New(): ${prefixedTypeName} {
    return {
        ${schema.tagKey}: \`${subTypes[0]?.key}\`,
        ${schema.valueKey}: ${subTypes[0]?.data.defaultValue},
    };
}`;
    if (context.features.validateFn) {
        content += `
export function ${prefixedTypeName}Validate(input: unknown): input is ${prefixedTypeName} {
    if (!isObject(input)) {
        return false;
    }
    if (!('${schema.tagKey}' in input) || !('${schema.valueKey}' in input)) {
        return false;
    }
    switch (input.${schema.tagKey}) {
${subTypes
    .map(
        (sub) => `
        case \`${sub.key}\`:
            return ${sub.data.validationTemplate(`input.${schema.valueKey}`)};
    `,
    )
    .join('\n')}
        default:
            return false;
    }
}`;
    }

    if (context.features.cloneFn) {
        content += `
export function ${prefixedTypeName}Clone(input: ${prefixedTypeName}): ${prefixedTypeName} {
    switch (input.${schema.tagKey}) {
${subTypes
    .map(
        (sub) => `
        case \`${sub.key}\`: {
            let __value__: ${sub.data.typeName};
            ${sub.data.cloneTemplate(`input.${schema.valueKey}`, `__value__`)}
            return {
                ${schema.tagKey}: \`${sub.key}\`,
                ${schema.valueKey}: __value__,
            };
        }`,
    )
    .join('\n')}
        default: {
            input satisfies never;
            throw new Error(\`Unknown union variant: \${(input as any).${schema.tagKey}}\`);
        }
   }
}`;
    }

    content += `
export function ${prefixedTypeName}FromJson(input: Record<string, unknown>): ${prefixedTypeName} {
    if (typeof input.${schema.tagKey} !== 'string') {
        return ${prefixedTypeName}New();
    }
    switch (input.${schema.tagKey}) {
${subTypes
    .map(
        (sub) => `       case \`${sub.key}\`: {
            let __value__: ${sub.data.typeName};
            ${sub.data.fromJsonTemplate(`input.${schema.valueKey}`, '__value__')};
            return {
                ${schema.tagKey}: \`${sub.key}\`,
                ${schema.valueKey}: __value__,
            };
        }`,
    )
    .join('\n')}
        default: {
            return ${prefixedTypeName}New();
        }
    }
}`;

    content += `
export function ${prefixedTypeName}FromJsonString(input: string): ${prefixedTypeName} {
    return ${prefixedTypeName}FromJson(JSON.parse(input));
}`;
    content += `
export function ${prefixedTypeName}ToJsonString(input: ${prefixedTypeName}): string {
    switch (input.${schema.tagKey}) {
${subTypes
    .map(
        (sub) => `
        case \`${sub.key}\`: {
            let json = '{';
            json += '"${schema.tagKey}":"${sub.key}"';
            json += '"${schema.valueKey}":';
            ${sub.data.toJsonTemplate(`input.${schema.valueKey}`, 'json', '')}
            json += '}';
            return json;
        }
        `,
    )
    .join('\n')}
        default: {
            input satisfies never;
            throw new Error(\`Unknown variant type: \${(input as any).${schema.tagKey}}\`);
        }
    }
}`;
    content += `
export function ${prefixedTypeName}ToUrlSearchParams(input: ${prefixedTypeName}): URLSearchParams {
    const params = new URLSearchParams();
    console.warn('[WARNING] Cannot serialize unions to query string.');
    return params;
}`;
    content += `
export function ${prefixedTypeName}ToUrlSearchParamsString(input: ${prefixedTypeName}): string {
    return ${prefixedTypeName}ToUrlSearchParams(input).toString();
}`;
    if (context.features.validatorObj) {
        content += `
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
    content += `
${subTypes.map((type) => type.data.content).join('\n')}
`;
    context.generatedTypes.push(typeName);
    return content;
}
