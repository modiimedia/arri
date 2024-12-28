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
    const defaultValue = schema.nullable
        ? 'null'
        : `$$${prefixedTypeName}.new()`;
    const result: TsProperty = {
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
        toJsonTemplate(input, target) {
            if (schema.nullable) {
                return `if (${input} !== null) {
                    ${target} += $$${prefixedTypeName}.toJsonString(${input}); 
                } else {
                    ${target} += 'null';
                }`;
            }
            return `${target} += $$${prefixedTypeName}.toJsonString(${input});`;
        },
        toQueryStringTemplate(_input, _target) {
            return `console.warn("[WARNING] Cannot serialize nested objects to query string. Skipping property at ${context.instancePath}.")`;
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
    const toQueryParts: string[] = [];
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
        toQueryParts.push(
            `queryParts.push('${context.discriminatorKey}=${context.discriminatorValue}');`,
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
            usedFeatures: context.usedFeatures,
            rpcGenerators: context.rpcGenerators,
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
        toQueryParts.push(
            prop.toQueryStringTemplate(`input.${fieldName}`, 'queryParts', key),
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
            usedFeatures: context.usedFeatures,
            rpcGenerators: context.rpcGenerators,
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
        toQueryParts.push(`if (typeof input.${fieldName} !== 'undefined') {
            ${prop.toQueryStringTemplate(`input.${fieldName}`, 'queryParts', key)}    
        }`);
        const validationPart = prop.validationTemplate(`input.${fieldName}`);
        validationParts.push(
            `((${validationPart}) || typeof input.${fieldName} === 'undefined')`,
        );
        constructionParts.push(`${fieldName}: ${tempKey},`);
    }

    result.content = `${getJsDocComment(schema.metadata)}export interface ${prefixedTypeName} {
${fieldParts.map((part) => `    ${part}`).join('\n')}
}
${context.discriminatorParent && context.discriminatorValue ? '' : 'export '}const $$${prefixedTypeName}: ArriModelValidator<${prefixedTypeName}> = {
    new(): ${prefixedTypeName} {
        return {
${newParts.map((part) => `            ${part}`).join('\n')}        
        };
    },
    validate(input): input is ${prefixedTypeName} {
        return (
${validationParts.map((part) => `            ${part}`).join('&& \n')}
        )
    },
    fromJson(input): ${prefixedTypeName} {
${fromJsonParts.map((part) => `        ${part}`).join('\n')}
        return {
${constructionParts.map((part) => `            ${part}`).join('\n')}
        }
    },
    fromJsonString(input): ${prefixedTypeName} {
        return $$${prefixedTypeName}.fromJson(JSON.parse(input));
    },
    toJsonString(input): string {
        let json = "{";
${toJsonParts.map((part) => `        ${part}`).join('\n')}
        json += "}";
        return json;
    },
    toUrlQueryString(input): string {
        const queryParts: string[] = [];
${toQueryParts.map((part) => `        ${part}`).join('\n')}
        return queryParts.join("&");
    }
}
    
${subContentParts.join('\n')}`;
    context.generatedTypes.push(typeName);
    return result;
}
