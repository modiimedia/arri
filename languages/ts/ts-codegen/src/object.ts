import { camelCase, SchemaFormProperties } from '@arrirpc/codegen-utils';

import { tsTypeFromSchema } from './_index';
import {
    CodegenContext,
    getJsDocComment,
    getTsTypeName,
    TsProperty,
    validVarName,
} from './common';

export function tsObjectFromSchema(
    schema: SchemaFormProperties,
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
        toJsonTemplate(input, target) {
            if (schema.isNullable) {
                return `if (${input} !== null) {
                    ${target} += ${prefixedTypeName}ToJsonString(${input}); 
                } else {
                    ${target} += 'null';
                }`;
            }
            return `${target} += ${prefixedTypeName}ToJsonString(${input});`;
        },
        setSearchParamTemplate(_input, _target) {
            return `console.warn('[WARNING] Cannot serialize nested objects to query string. Skipping property at ${context.instancePath}.')`;
        },
        content: '',
    };
    if (context.generatedTypes.includes(typeName)) {
        return result;
    }
    const newParts: string[] = [];
    const fieldParts: string[] = [];
    const fromJsonParts: string[] = [];
    const constructionParts: string[] = [];
    const toJsonParts: string[] = [];
    const setSearchParamParts: string[] = [];
    const validationParts: string[] = ['isObject(input)'];
    const subContentParts: string[] = [];
    let hasKey = false;
    if (
        context.discriminatorParent &&
        context.discriminatorValue &&
        context.discriminatorKey
    ) {
        hasKey = true;
        const key = validVarName(
            camelCase(context.discriminatorKey, { normalize: true }),
        );
        fieldParts.push(`${key}: "${context.discriminatorValue}",`);
        fromJsonParts.push(`const _${key} = "${context.discriminatorValue}"`);
        toJsonParts.push(`json += '"${key}":"${context.discriminatorValue}"'`);
        setSearchParamParts.push(
            `params.set('${context.discriminatorKey}', '${context.discriminatorValue}');`,
        );
        validationParts.push(
            `input.${key} === '${context.discriminatorValue}'`,
        );
        newParts.push(`${key}: "${context.discriminatorValue}",`);
        constructionParts.push(`${key}: _${key},`);
    }
    for (const key of Object.keys(schema.properties)) {
        const subSchema = schema.properties[key]!;
        const prop = tsTypeFromSchema(subSchema, {
            clientName: context.clientName,
            typePrefix: context.typePrefix,
            generatedTypes: context.generatedTypes,
            instancePath: `/${typeName}/${key}`,
            schemaPath: `/${typeName}/properties/${key}`,
            discriminatorParent: '',
            discriminatorKey: '',
            discriminatorValue: '',
            versionNumber: context.versionNumber,
            useRpcTypes: context.useRpcTypes,
            rpcGenerators: context.rpcGenerators,
            features: context.features,
        });
        if (prop.content) subContentParts.push(prop.content);
        const fieldName = validVarName(camelCase(key, { normalize: true }));
        fieldParts.push(
            `${getJsDocComment(subSchema.metadata)}${fieldName}: ${prop.typeName},`,
        );
        newParts.push(`${fieldName}: ${prop.defaultValue},`);
        const tempKey = `_${validVarName(key)}`;
        fromJsonParts.push(`let ${tempKey}: ${prop.typeName};`);
        fromJsonParts.push(prop.fromJsonTemplate(`input.${key}`, tempKey));
        if (hasKey) {
            toJsonParts.push(`json += ',"${key}":';`);
        } else {
            toJsonParts.push(`json += '"${key}":';`);
        }
        toJsonParts.push(
            prop.toJsonTemplate(`input.${fieldName}`, 'json', key),
        );
        setSearchParamParts.push(
            prop.setSearchParamTemplate(`input.${fieldName}`, 'params', key),
        );
        const validationPart = prop.validationTemplate(`input.${fieldName}`);
        validationParts.push(validationPart);
        constructionParts.push(`${fieldName}: ${tempKey},`);
        hasKey = true;
    }
    if (!hasKey) {
        toJsonParts.push(`let _hasKey = false;`);
    }
    for (const key of Object.keys(schema.optionalProperties ?? {})) {
        const subSchema = schema.optionalProperties![key]!;
        const prop = tsTypeFromSchema(subSchema, {
            clientName: context.clientName,
            typePrefix: context.typePrefix,
            generatedTypes: context.generatedTypes,
            instancePath: `/${typeName}/${key}`,
            schemaPath: `/${typeName}/optionalProperties/${key}`,
            discriminatorParent: '',
            discriminatorKey: '',
            discriminatorValue: '',
            versionNumber: context.versionNumber,
            useRpcTypes: context.useRpcTypes,
            rpcGenerators: context.rpcGenerators,
            features: context.features,
        });
        if (prop.content) subContentParts.push(prop.content);
        const fieldName = validVarName(camelCase(key, { normalize: true }));
        fieldParts.push(
            `${getJsDocComment(subSchema.metadata)}${fieldName}?: ${prop.typeName},`,
        );
        const tempKey = `_${validVarName(key)}`;
        fromJsonParts.push(`let ${tempKey}: ${prop.typeName} | undefined;`);
        fromJsonParts.push(`if (typeof input.${key} !== 'undefined') {
            ${prop.fromJsonTemplate(`input.${key}`, tempKey)}
        }`);
        if (hasKey) {
            toJsonParts.push(`if (typeof input.${fieldName} !== 'undefined') {
                json += \`,"${key}":\`;
                ${prop.toJsonTemplate(`input.${fieldName}`, 'json', key)}
            }`);
        } else {
            toJsonParts.push(`if (typeof input.${fieldName} !== 'undefined') {
            if (_hasKey) json += ',';
            json += '"${key}":';
            ${prop.toJsonTemplate(`input.${fieldName}`, 'json', key)}
            _hasKey = true;
        }`);
        }
        setSearchParamParts.push(`if (typeof input.${fieldName} !== 'undefined') {
            ${prop.setSearchParamTemplate(`input.${fieldName}`, 'params', key)}    
        }`);
        const validationPart = prop.validationTemplate(`input.${fieldName}`);
        validationParts.push(
            `((${validationPart}) || typeof input.${fieldName} === 'undefined')`,
        );
        constructionParts.push(`${fieldName}: ${tempKey},`);
    }

    result.content = `${getJsDocComment(schema.metadata)}export interface ${prefixedTypeName} {
${fieldParts.map((part) => `    ${part}`).join('\n')}
}`;
    result.content += `
export function ${prefixedTypeName}New(): ${prefixedTypeName} {
    return {
${newParts.map((part) => `        ${part}`).join('\n')}        
    };
}`;
    if (context.features.validateFn) {
        result.content += `
export function ${prefixedTypeName}Validate(input: unknown): input is ${prefixedTypeName} {
    return (
${validationParts.map((part) => `        ${part}`).join('&& \n')}
    )
}`;
    }
    result.content += `
export function ${prefixedTypeName}FromJson(input: Record<string, unknown>): ${prefixedTypeName} {
${fromJsonParts.map((part) => `    ${part}`).join('\n')}
    return {
${constructionParts.map((part) => `        ${part}`).join('\n')}
    }
}`;
    result.content += `
export function ${prefixedTypeName}FromJsonString(input: string): ${prefixedTypeName} {
    return ${prefixedTypeName}FromJson(JSON.parse(input));
}`;
    result.content += `
export function ${prefixedTypeName}ToJsonString(input: ${prefixedTypeName}): string {
    let json = "{";
${toJsonParts.map((part) => `    ${part}`).join('\n')}
    json += "}";
    return json;
}`;
    result.content += `
export function ${prefixedTypeName}ToUrlSearchParams(input: ${prefixedTypeName}): URLSearchParams {
    const params = new URLSearchParams();
    ${setSearchParamParts.map((part) => `        ${part}`).join('\n')}
    return params;
}`;
    result.content += `
export function ${prefixedTypeName}ToUrlSearchParamsString(input: ${prefixedTypeName}): string {
    return ${prefixedTypeName}ToUrlSearchParams(input).toString();
}
`;
    if (context.features.validatorObj) {
        result.content += `
${context.discriminatorParent && context.discriminatorValue ? '' : 'export '}const $$${prefixedTypeName}: ${context.clientName}Validator<${prefixedTypeName}> = {
    new: ${prefixedTypeName}New,
    ${context.features.validateFn && `validate: ${prefixedTypeName}Validate,`} 
    fromJson: ${prefixedTypeName}FromJson,
    fromJsonString: ${prefixedTypeName}FromJsonString,
    toJsonString: ${prefixedTypeName}ToJsonString,
    toUrlSearchParams: ${prefixedTypeName}ToUrlSearchParams,
    toUrlSearchParamsString: ${prefixedTypeName}ToUrlSearchParamsString,
}`;
    }

    result.content += `  
${subContentParts.join('\n')}`;
    context.generatedTypes.push(typeName);
    return result;
}
