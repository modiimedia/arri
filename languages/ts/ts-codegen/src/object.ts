import { camelCase, SchemaFormProperties } from "@arrirpc/codegen-utils";

import { tsTypeFromSchema } from ".";
import {
    CodegenContext,
    getJsDocComment,
    getTsTypeName,
    TsProperty,
    validVarName,
} from "./common";

export function tsObjectFromSchema(
    schema: SchemaFormProperties,
    context: CodegenContext,
): TsProperty {
    const typeName = getTsTypeName(schema, context);
    const defaultValue = schema.nullable ? "null" : `$$${typeName}.new()`;
    const result: TsProperty = {
        typeName: schema.nullable
            ? `${context.typePrefix}${typeName} | null`
            : `${context.typePrefix}${typeName}`,
        defaultValue,
        validationTemplate(input) {
            if (schema.nullable) {
                return `($$${typeName}.validate(${input}) || ${input} === null)`;
            }
            return `$$${typeName}.validate(${input})`;
        },
        fromJsonTemplate(input, target) {
            return `if (isObject(${input})) {
                ${target} = $$${context.typePrefix}${typeName}.fromJson(${input});
            } else {
                ${target} = ${defaultValue}; 
            }`;
        },
        toJsonTemplate(input, target) {
            if (schema.nullable) {
                return `if (${input} == null) {
                    ${target} += 'null';
                } else {
                    ${target} += $$${context.typePrefix}${typeName}.toJsonString(${input}); 
                }`;
            }
            return `${target} += $$${context.typePrefix}${typeName}.toJsonString(${input});`;
        },
        toQueryStringTemplate(_input, _target) {
            return `console.warn("[WARNING] Nested objects cannot be serialized to query string. Skipping property at ${context.instancePath}.")`;
        },
        content: "",
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
    const validationParts: string[] = ["isObject(input)"];
    const subContentParts: string[] = [];
    let hasKey = false;
    if (
        context.discriminatorParent &&
        context.discriminatorValue &&
        context.discriminatorKey
    ) {
        hasKey = true;
        const key = validVarName(camelCase(context.discriminatorKey));
        fieldParts.push(`${key}: "${context.discriminatorValue}",`);
        fromJsonParts.push(`let _${key} = "${context.discriminatorValue}"`);
        toJsonParts.push(
            `json += \`"${key}":"${context.discriminatorValue}"\``,
        );
        toQueryParts.push(
            `queryParts.push(\`${context.discriminatorKey}=${context.discriminatorValue}\`);`,
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
            discriminatorParent: "",
            discriminatorKey: "",
            discriminatorValue: "",
            versionNumber: context.versionNumber,
            hasSseProcedure: context.hasSseProcedure,
            hasWsProcedure: context.hasWsProcedure,
        });
        if (prop.content) subContentParts.push(prop.content);
        const fieldName = validVarName(camelCase(key));
        fieldParts.push(`${fieldName}: ${prop.typeName},`);
        newParts.push(`${fieldName}: ${prop.defaultValue},`);
        const tempKey = `_${validVarName(key)}`;
        fromJsonParts.push(`let ${tempKey}: ${prop.typeName};`);
        fromJsonParts.push(prop.fromJsonTemplate(`input.${key}`, tempKey));
        if (hasKey) {
            toJsonParts.push(`json += ',"${key}":';`);
        } else {
            toJsonParts.push(`json += '"${key}":';`);
        }
        toJsonParts.push(prop.toJsonTemplate(`input.${fieldName}`, "json"));
        toQueryParts.push(
            prop.toQueryStringTemplate(`input.${fieldName}`, "queryParts", key),
        );
        const validationPart = prop.validationTemplate(`input.${fieldName}`);
        if (validationPart) validationParts.push(validationPart);
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
            discriminatorParent: "",
            discriminatorKey: "",
            discriminatorValue: "",
            versionNumber: context.versionNumber,
            hasSseProcedure: context.hasSseProcedure,
            hasWsProcedure: context.hasWsProcedure,
        });
        if (prop.content) subContentParts.push(prop.content);
        const fieldName = validVarName(camelCase(key));
        fieldParts.push(`${fieldName}?: ${prop.typeName},`);
        const tempKey = `_${validVarName(key)}`;
        fromJsonParts.push(`let ${tempKey}: ${prop.typeName} | undefined;`);
        fromJsonParts.push(`if (typeof input.${key} !== 'undefined') {
            ${prop.fromJsonTemplate(`input.${key}`, tempKey)}
        }`);
        toJsonParts.push(`if (typeof input.${key} !== 'undefined') {
            if (_hasKey) json += ',';
            json += \`"${key}":\`;
            ${prop.toJsonTemplate(`input.${key}`, "json")}
            _hasKey = true;
        }`);
        toQueryParts.push(`if (typeof input.${fieldName} !== 'undefined') {
            ${prop.toQueryStringTemplate(`input.${fieldName}`, "queryParts", key)}    
        }`);
        const validationPart = prop.validationTemplate(`input.${fieldName}`);
        if (validationPart) {
            validationParts.push(
                `(typeof input.${fieldName} === 'undefined' || ${validationPart})`,
            );
        }
        constructionParts.push(`${fieldName}: ${tempKey},`);
    }
    const prefixedTypeName = `${context.typePrefix}${typeName}`;

    result.content = `${getJsDocComment(schema.metadata)}export interface ${prefixedTypeName} {
${fieldParts.map((part) => `    ${part}`).join("\n")}
}
export const $$${prefixedTypeName}: ArriModelValidator<${prefixedTypeName}> = {
    new(): ${prefixedTypeName} {
        return {
${newParts.map((part) => `            ${part}`).join("\n")}        
        };
    },
    validate(input): input is ${prefixedTypeName} {
        return (
${validationParts.map((part) => `            ${part}`).join("&& \n")}
        )
    },
    fromJson(input): ${prefixedTypeName} {
${fromJsonParts.map((part) => `        ${part}`).join("\n")}
        return {
${constructionParts.map((part) => `            ${part}`).join("\n")}
        }
    },
    fromJsonString(input): ${prefixedTypeName} {
        return $$${prefixedTypeName}.fromJson(JSON.parse(input));
    },
    toJsonString(input): string {
        let json = "{";
${toJsonParts.map((part) => `        ${part}`).join("\n")}
        json += "}";
        return json;
    },
    toUrlQueryString(input): string {
        const queryParts: string[] = [];
${toQueryParts.map((part) => `        ${part}`).join("\n")}
        return queryParts.join("&");
    }
}
    
${subContentParts.join("\n")}`;
    context.generatedTypes.push(typeName);
    return result;
}
