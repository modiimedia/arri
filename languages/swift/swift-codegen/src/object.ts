import { isSchemaFormRef, SchemaFormProperties } from '@arrirpc/codegen-utils';

import {
    codeComments,
    GeneratorContext,
    getTypeName,
    isNullableType,
    SwiftProperty,
    validSwiftKey,
} from './_common';
import { swiftTypeFromSchema } from './_index';

export function swiftObjectFromSchema(
    schema: SchemaFormProperties,
    context: GeneratorContext,
): SwiftProperty {
    const typeName = getTypeName(schema, context);
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const isNullable = isNullableType(schema, context);
    const defaultValue = isNullable ? '' : `${prefixedTypeName}()`;
    const result: SwiftProperty = {
        typeName: isNullable ? `${prefixedTypeName}?` : prefixedTypeName,
        defaultValue,
        isNullable,
        canBeQueryString: false,
        hasRequiredRef: context.containsRequiredRef[typeName] ?? false,
        fromJsonTemplate(input, target) {
            if (context.isOptional) {
                return `         if ${input}.exists() {
                    ${target} = ${prefixedTypeName}(json: ${input})
                }`;
            }
            if (schema.nullable) {
                return `        if ${input}.dictionary != nil {
                    ${target} = ${prefixedTypeName}(json: ${input})
                }`;
            }
            return `        ${target} = ${prefixedTypeName}(json: ${input})`;
        },
        toJsonTemplate(input, target) {
            if (context.isOptional) {
                return `        ${target} += ${input}!.toJSONString()`;
            }
            if (schema.nullable) {
                return `        if ${input} != nil {
                    ${target} += ${input}!.toJSONString()
                } else {
                    ${target} += "null" 
                }`;
            }
            return `        ${target} += ${input}.toJSONString()`;
        },
        toQueryPartTemplate(_, __, ___) {
            return `        print("[WARNING] nested objects cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        cloneTemplate(input, _key) {
            let fieldContent = `${input}.clone()`;
            if (isNullable) {
                fieldContent = `${input}?.clone()`;
            }
            return {
                tempKey: '',
                bodyContent: '',
                fieldContent,
            };
        },
        content: '',
    };
    if (context.generatedTypes.includes(typeName)) {
        return result;
    }
    const fieldNames: string[] = [];
    const fieldNameParts: string[] = [];
    const initArgParts: string[] = [];
    const initBodyParts: string[] = [];
    const initFromJsonParts: string[] = [];
    const toJsonParts: string[] = [];
    const toQueryStringParts: string[] = [];
    const cloneBodyParts: string[] = [];
    const cloneFieldParts: string[] = [];
    const subContent: string[] = [];
    let numKeys = 0;
    let canBeQueryString = false;
    let hasRecursiveSubType = false;
    if (context.discriminatorKey && context.discriminatorValue) {
        numKeys++;
        canBeQueryString = true;
        const discriminatorKey = validSwiftKey(context.discriminatorKey);
        fieldNames.push(discriminatorKey);
        fieldNameParts.push(
            `    let ${discriminatorKey}: String = "${context.discriminatorValue}"`,
        );
        toJsonParts.push(
            `        __json += "\\"${context.discriminatorKey}\\":\\"${context.discriminatorValue}\\""`,
        );
        toQueryStringParts.push(
            `        __queryParts.append(URLQueryItem(name: "${context.discriminatorKey}", value: "${context.discriminatorValue}"))`,
        );
    }
    for (const key of Object.keys(schema.properties)) {
        const subSchema = schema.properties[key]!;
        const subType = swiftTypeFromSchema(subSchema, {
            clientVersion: context.clientVersion,
            clientName: context.clientName,
            typePrefix: context.typePrefix,
            instancePath: `/${typeName}/${key}`,
            schemaPath: `${context.schemaPath}/properties/${key}`,
            generatedTypes: context.generatedTypes,
            containsRequiredRef: context.containsRequiredRef,
        });
        if (subType.content) subContent.push(subType.content);
        if (subType.hasRequiredRef && !subType.isNullable) {
            context.containsRequiredRef[typeName] = true;
            result.hasRequiredRef = true;
        }
        if (isSchemaFormRef(subSchema)) {
            hasRecursiveSubType = true;
        }
        if (subType.canBeQueryString) canBeQueryString = true;
        const fieldName = validSwiftKey(key);
        fieldNames.push(fieldName);
        if (subType.defaultValue) {
            fieldNameParts.push(
                `${codeComments(subSchema, '    ')}    public var ${fieldName}: ${subType.typeName} = ${subType.defaultValue}`,
            );
        } else {
            fieldNameParts.push(
                `${codeComments(subSchema, '    ')}    public var ${fieldName}: ${subType.typeName}`,
            );
        }
        initArgParts.push(`        ${fieldName}: ${subType.typeName}`);
        initBodyParts.push(`            self.${fieldName} = ${fieldName}`);
        initFromJsonParts.push(
            subType.fromJsonTemplate(
                `json["${key}"]`,
                `self.${fieldName}`,
                key,
            ),
        );
        if (numKeys > 0) {
            toJsonParts.push(`        __json += ",\\"${key}\\":"`);
        } else {
            toJsonParts.push(`        __json += "\\"${key}\\":"`);
        }
        toJsonParts.push(subType.toJsonTemplate(`self.${fieldName}`, `__json`));
        if (subType.canBeQueryString) canBeQueryString = true;
        toQueryStringParts.push(
            subType.toQueryPartTemplate(
                `self.${fieldName}`,
                `__queryParts`,
                key,
            ),
        );
        const cloneResult = subType.cloneTemplate?.(
            `self.${fieldName}`,
            fieldName,
        );
        if (cloneResult) {
            cloneBodyParts.push(cloneResult.bodyContent);
            cloneFieldParts.push(
                `            ${fieldName}: ${cloneResult.fieldContent}`,
            );
        } else {
            cloneFieldParts.push(
                `            ${fieldName.split('`').join('')}: self.${fieldName}`,
            );
        }
        numKeys++;
    }
    let numOptionalKeys = 0;
    for (const key of Object.keys(schema.optionalProperties ?? {})) {
        const subSchema = schema.optionalProperties![key]!;
        const subType = swiftTypeFromSchema(subSchema, {
            clientVersion: context.clientVersion,
            clientName: context.clientName,
            typePrefix: context.typePrefix,
            instancePath: `/${typeName}/${key}`,
            schemaPath: `${context.schemaPath}/optionalProperties/${key}`,
            generatedTypes: context.generatedTypes,
            isOptional: true,
            containsRequiredRef: context.containsRequiredRef,
        });
        if (subType.content) subContent.push(subType.content);
        if (isSchemaFormRef(subSchema)) {
            hasRecursiveSubType = true;
        }
        if (subType.canBeQueryString) canBeQueryString = true;
        const fieldName = validSwiftKey(key);
        fieldNames.push(fieldName);
        fieldNameParts.push(
            `${codeComments(subSchema, '    ')}    public var ${fieldName}: ${subType.typeName}`,
        );
        initArgParts.push(`        ${fieldName}: ${subType.typeName}`);
        initBodyParts.push(`            self.${fieldName} = ${fieldName}`);
        initFromJsonParts.push(
            subType.fromJsonTemplate(
                `json["${key}"]`,
                `self.${fieldName}`,
                key,
            ),
        );
        let toJsonContent = ``;
        if (numKeys > 0) {
            toJsonContent += `        __json += ",\\"${key}\\":"\n`;
        } else {
            if (numOptionalKeys > 0) {
                toJsonContent += `            if __numKeys > 0 {
                    __json += ","
                }\n`;
            }
            toJsonContent += `            __json += "\\"${key}\\":"\n`;
        }
        toJsonContent += subType.toJsonTemplate(`self.${fieldName}`, `__json`);
        if (numKeys === 0) {
            toJsonContent += `            \n__numKeys += 1`;
        }
        toJsonParts.push(`        if self.${fieldName} != nil {
            ${toJsonContent}
        }`);
        if (subType.canBeQueryString) canBeQueryString = true;
        toQueryStringParts.push(
            subType.toQueryPartTemplate(
                `self.${fieldName}`,
                `__queryParts`,
                key,
            ),
        );
        const cloneResult = subType.cloneTemplate?.(
            `self.${fieldName}`,
            fieldName,
        );
        if (cloneResult) {
            cloneBodyParts.push(cloneResult.bodyContent);
            cloneFieldParts.push(
                `            ${fieldName}: ${cloneResult.fieldContent}`,
            );
        } else {
            cloneFieldParts.push(
                `            ${fieldName.split('`').join('')}: self.${fieldName}`,
            );
        }
        numOptionalKeys++;
    }
    const declaration = hasRecursiveSubType ? `final class` : 'struct';
    const initPrefix = hasRecursiveSubType ? `public required` : `public`;
    const initJsonStringPrefix = hasRecursiveSubType
        ? `public required convenience`
        : `public`;
    let equalsPart = '';
    if (hasRecursiveSubType) {
        equalsPart = `public static func == (lhs: ${prefixedTypeName}, rhs: ${prefixedTypeName}) -> Bool {
            return
${fieldNames.map((field) => `               lhs.${field} == rhs.${field}`).join(' &&\n')}
        }`;
    }
    const hasProperties = initArgParts.length > 0;
    result.content = `${codeComments(schema)}public ${declaration} ${prefixedTypeName}: ArriClientModel {
${fieldNameParts.join('\n')}
    ${initPrefix} init(
${initArgParts.join(',\n')}
    ) {
${initBodyParts.join('\n')}
    }
    ${hasProperties ? `${initPrefix} init() {}` : ''}
    ${initPrefix} init(json: JSON) {
${initFromJsonParts.join('\n')}
    }
    ${initJsonStringPrefix} init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \\(error)")
            self.init()
        }
    }
    ${initJsonStringPrefix} init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json) 
        } catch {
            print("[WARNING] Error parsing JSON: \\(error)")
            self.init()
        }
    }
    public func toJSONString() -> String {
        var __json = "{"
${numKeys === 0 ? `      var __numKeys = 0` : ''}
${toJsonParts.join('\n')}
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        ${canBeQueryString ? `var __queryParts: [URLQueryItem] = []` : ''}
${toQueryStringParts.join('\n')}
        ${canBeQueryString ? `return __queryParts` : `return []`}
    }
    public func clone() -> ${prefixedTypeName} {
${cloneBodyParts.join('\n')}
        return ${prefixedTypeName}(
${cloneFieldParts.join(',\n')}
        )
    }
    ${equalsPart}
}
    
${subContent.join('\n')}`;
    context.generatedTypes.push(typeName);
    return result;
}
