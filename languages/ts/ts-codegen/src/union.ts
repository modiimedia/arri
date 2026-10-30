import {
    camelCase,
    getUnionFallbackKey,
    Schema,
    SchemaFormUnion,
} from '@arrirpc/codegen-utils';

import { tsTypeFromSchema } from './_index';
import {
    CodegenContext,
    getJsDocComment,
    getTsTypeName,
    jsonKeyAccessor,
    TsProperty,
    validVarName,
} from './common';

type UnionVariant = { data: TsProperty; key: string };

export function tsTaggedUnionFromSchema(
    schema: SchemaFormUnion,
    context: CodegenContext,
): TsProperty {
    if (schema.tagKey && !schema.valueKey) {
        return tsInternallyTaggedUnionFromSchema(
            schema,
            schema.tagKey,
            schema.union,
            'union',
            context,
        );
    }
    const typeName = getTsTypeName(schema, context);
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const result = tsUnionProperty(schema, prefixedTypeName, context);
    if (context.generatedTypes.includes(typeName)) return result;
    const { subTypes, fallback } = tsUnionVariants(
        schema.union,
        typeName,
        undefined,
        'union',
        context,
    );
    if (schema.tagKey && schema.valueKey) {
        result.content = _internallyTaggedWithValueKeyContent(
            typeName,
            prefixedTypeName,
            subTypes,
            fallback,
            schema,
            context,
        );
    } else {
        result.content = _externallyTaggedContent(
            typeName,
            prefixedTypeName,
            subTypes,
            fallback,
            schema,
            context,
        );
    }
    return result;
}

/**
 * Shared by internally tagged union schemas and legacy discriminator schemas.
 * Each variant is an object type that has the tag injected into it.
 *
 * @param variantsSchemaKey The schema key that holds the variants. Used for error paths. ("mapping" for legacy discriminators)
 */
export function tsInternallyTaggedUnionFromSchema(
    schema: Schema,
    tagKey: string,
    variants: Record<string, Schema>,
    variantsSchemaKey: string,
    context: CodegenContext,
): TsProperty {
    const typeName = getTsTypeName(schema, context);
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const result = tsUnionProperty(schema, prefixedTypeName, context);
    if (context.generatedTypes.includes(typeName)) return result;
    const { subTypes, fallback } = tsUnionVariants(
        variants,
        typeName,
        tagKey,
        variantsSchemaKey,
        context,
    );
    result.content = _internallyTaggedContent(
        typeName,
        prefixedTypeName,
        subTypes,
        fallback,
        tagKey,
        schema,
        context,
    );
    return result;
}

function tsUnionProperty(
    schema: Schema,
    prefixedTypeName: string,
    context: CodegenContext,
): TsProperty {
    const defaultValue = schema.isNullable
        ? 'null'
        : `${prefixedTypeName}New()`;
    return {
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
}

/**
 * @param injectedTagKey When set, each variant is generated as an object with this tag injected into it (internally tagged unions)
 */
function tsUnionVariants(
    variants: Record<string, Schema>,
    typeName: string,
    injectedTagKey: string | undefined,
    variantsSchemaKey: string,
    context: CodegenContext,
): { subTypes: UnionVariant[]; fallback: UnionVariant } {
    const subTypes: UnionVariant[] = [];
    for (const key of Object.keys(variants)) {
        const subSchema = variants[key]!;
        const subType = tsTypeFromSchema(subSchema, {
            clientName: context.clientName,
            typePrefix: context.typePrefix,
            generatedTypes: context.generatedTypes,
            instancePath: `${context.instancePath}/${key}`,
            schemaPath: `${context.schemaPath}/${variantsSchemaKey}/${key}`,
            discriminatorParent: injectedTagKey ? typeName : '',
            discriminatorKey: injectedTagKey ?? '',
            discriminatorValue: injectedTagKey ? key : '',
            versionNumber: context.versionNumber,
            useRpcTypes: context.useRpcTypes,
            rpcGenerators: context.rpcGenerators,
            features: context.features,
        });
        subTypes.push({ data: subType, key: key });
    }
    const fallbackKey = getUnionFallbackKey(variants);
    const fallback = subTypes.find((type) => type.key === fallbackKey);
    if (!fallback) {
        throw new Error(
            `Error at ${context.schemaPath}: Union schemas must have at least one variant`,
        );
    }
    return { subTypes, fallback };
}

function _externallyTaggedContent(
    typeName: string,
    prefixedTypeName: string,
    subTypes: UnionVariant[],
    fallback: UnionVariant,
    schema: SchemaFormUnion,
    context: CodegenContext,
): string {
    let content = `${getJsDocComment(schema.metadata)}export type ${prefixedTypeName} = ${subTypes.map((type) => `{ type: \`${type.key}\`; value: ${type.data.typeName} }`).join(' |')};`;
    content += `
export function ${prefixedTypeName}New(): ${prefixedTypeName} {
    return {
        type: \`${fallback.key}\`,
        value: ${fallback.data.defaultValue},
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
    subTypes: UnionVariant[],
    fallback: UnionVariant,
    tagKey: string,
    schema: Schema,
    context: CodegenContext,
): string {
    const tagField = tsFieldName(tagKey);
    let content = `${getJsDocComment(schema.metadata)}export type ${prefixedTypeName} = ${subTypes.map((type) => type.data.typeName).join(' |')};`;
    content += `
export function ${prefixedTypeName}New(): ${prefixedTypeName} {
    return ${fallback.data.typeName}New();
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
    switch (input.${tagField}) {
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
            throw new Error(\`Unknown union variant: \${(input as any).${tagField}}\`);
        }
   }
}`;
    }

    content += `
export function ${prefixedTypeName}FromJson(input: Record<string, unknown>): ${prefixedTypeName} {
    switch (${jsonKeyAccessor('input', tagKey)}) {
${subTypes
    .map(
        (sub) => `       case \`${sub.key}\`: {
            return ${sub.data.typeName}FromJson(input);
        }`,
    )
    .join('\n')}
        default: {
            return ${fallback.data.typeName}New();
        }
    }
}`;

    content += `
export function ${prefixedTypeName}FromJsonString(input: string): ${prefixedTypeName} {
    return ${prefixedTypeName}FromJson(JSON.parse(input));
}`;
    content += `
export function ${prefixedTypeName}ToJsonString(input: ${prefixedTypeName}): string {
    switch (input.${tagField}) {
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
            throw new Error(\`Unknown variant type: \${(input as any).${tagField}}\`);
        }
    }
}`;
    content += `
export function ${prefixedTypeName}ToUrlSearchParams(input: ${prefixedTypeName}): URLSearchParams {
    switch (input.${tagField}) {
        ${subTypes
            .map(
                (sub) => `case \`${sub.key}\`: {
            return ${sub.data.typeName}ToUrlSearchParams(input);
        }`,
            )
            .join('\n')}
        default: {
            input satisfies never;
            throw new Error(\`Unknown variant type: \${(input as any).${tagField}}\`);
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
    subTypes: UnionVariant[],
    fallback: UnionVariant,
    schema: SchemaFormUnion,
    context: CodegenContext,
): string {
    const tagField = tsFieldName(schema.tagKey!);
    const valueField = tsFieldName(schema.valueKey!);
    let content = `${getJsDocComment(schema.metadata)}export type ${prefixedTypeName} = ${subTypes.map((type) => `{ ${tagField}: \`${type.key}\`; ${valueField}: ${type.data.typeName} }`).join(' |')};`;
    content += `
export function ${prefixedTypeName}New(): ${prefixedTypeName} {
    return {
        ${tagField}: \`${fallback.key}\`,
        ${valueField}: ${fallback.data.defaultValue},
    };
}`;
    if (context.features.validateFn) {
        content += `
export function ${prefixedTypeName}Validate(input: unknown): input is ${prefixedTypeName} {
    if (!isObject(input)) {
        return false;
    }
    if (!('${tagField}' in input) || !('${valueField}' in input)) {
        return false;
    }
    switch (input.${tagField}) {
${subTypes
    .map(
        (sub) => `
        case \`${sub.key}\`:
            return ${sub.data.validationTemplate(`input.${valueField}`)};
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
    switch (input.${tagField}) {
${subTypes
    .map(
        (sub) => `
        case \`${sub.key}\`: {
            let __value__: ${sub.data.typeName};
            ${sub.data.cloneTemplate(`input.${valueField}`, `__value__`)}
            return {
                ${tagField}: \`${sub.key}\`,
                ${valueField}: __value__,
            };
        }`,
    )
    .join('\n')}
        default: {
            input satisfies never;
            throw new Error(\`Unknown union variant: \${(input as any).${tagField}}\`);
        }
   }
}`;
    }

    content += `
export function ${prefixedTypeName}FromJson(input: Record<string, unknown>): ${prefixedTypeName} {
    if (typeof ${jsonKeyAccessor('input', schema.tagKey!)} !== 'string') {
        return ${prefixedTypeName}New();
    }
    switch (${jsonKeyAccessor('input', schema.tagKey!)}) {
${subTypes
    .map(
        (sub) => `       case \`${sub.key}\`: {
            let __value__: ${sub.data.typeName};
            ${sub.data.fromJsonTemplate(jsonKeyAccessor('input', schema.valueKey!), '__value__')};
            return {
                ${tagField}: \`${sub.key}\`,
                ${valueField}: __value__,
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
    switch (input.${tagField}) {
${subTypes
    .map(
        (sub) => `
        case \`${sub.key}\`: {
            let json = '{';
            json += '"${schema.tagKey}":"${sub.key}"';
            json += ',"${schema.valueKey}":';
            ${sub.data.toJsonTemplate(`input.${valueField}`, 'json', '')}
            json += '}';
            return json;
        }
        `,
    )
    .join('\n')}
        default: {
            input satisfies never;
            throw new Error(\`Unknown variant type: \${(input as any).${tagField}}\`);
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

/**
 * Unions with a tagKey/valueKey use camelCase field names in TS but keep the original key in JSON
 */
function tsFieldName(key: string): string {
    return validVarName(camelCase(key, { normalize: true }));
}
