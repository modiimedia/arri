import {
    getUnionFallbackKey,
    isRecursiveSchema,
    isSchemaFormProperties,
    isSchemaFormRef,
    Schema,
    SchemaFormProperties,
    SchemaFormUnion,
} from '@arrirpc/codegen-utils';

import {
    codeComments,
    GeneratorContext,
    getTypeName,
    isNullableType,
    SwiftProperty,
    validSwiftKey,
} from './_common';
import { swiftTypeFromSchema } from './_index';
import { swiftObjectFromSchema } from './object';

export function swiftUnionFromSchema(
    schema: SchemaFormUnion,
    context: GeneratorContext,
): SwiftProperty {
    if (schema.tagKey && !schema.valueKey) {
        for (const key of Object.keys(schema.union)) {
            if (!isSchemaFormProperties(schema.union[key])) {
                throw new Error(
                    `Error at ${context.schemaPath}/union/${key}: All union variants must be an object when tagKey is specified without a valueKey`,
                );
            }
        }
        return swiftInternallyTaggedEnum(
            schema,
            schema.tagKey,
            schema.union as Record<string, SchemaFormProperties>,
            'union',
            context,
        );
    }
    return swiftWrappedUnionFromSchema(schema, context);
}

/**
 * Returns the key of the variant used by `init()` and when the input can't be decoded.
 * Swift initializes this variant eagerly so we error out if every variant is recursive.
 */
function getFallbackKey(
    variants: Record<string, Schema>,
    context: GeneratorContext,
): string {
    const fallbackKey = getUnionFallbackKey(variants);
    if (!fallbackKey) {
        throw new Error(
            `Invalid schema at ${context.schemaPath}. Unions must have at least one variant.`,
        );
    }
    if (isRecursiveSchema(variants[fallbackKey]!)) {
        throw new Error(
            `Invalid schema at ${context.schemaPath}. All variants have a required recursive reference. This creates an infinite loop.`,
        );
    }
    return fallbackKey;
}

/**
 * Shared by the properties of every union / discriminator enum
 */
function unionEnumProperty(
    schema: Schema,
    context: GeneratorContext,
    typeName: string,
): SwiftProperty {
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const isNullable = isNullableType(schema, context);
    const defaultValue = isNullable ? `` : `${prefixedTypeName}()`;
    return {
        typeName: isNullable ? `${prefixedTypeName}?` : prefixedTypeName,
        isNullable,
        defaultValue,
        canBeQueryString: false,
        hasRequiredRef: !isNullable && isRecursiveSchema(schema),
        fromJsonTemplate(input, target, _) {
            if (context.isOptional) {
                return `        if ${input}.exists() {
                    ${target} = ${prefixedTypeName}(json: ${input})
                }`;
            }
            if (schema.isNullable) {
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
            if (schema.isNullable) {
                return `        if ${input} != nil {
                    ${target} += ${input}!.toJSONString()
                } else {
                    ${target} += "null"
                }`;
            }
            return `        ${target} += ${input}.toJSONString()`;
        },
        toQueryPartTemplate(_, __, ___) {
            return `        print("[WARNING] nested unions cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        cloneTemplate(input, _) {
            return {
                fieldContent: `${input}${isNullable ? '?' : ''}.clone()`,
                bodyContent: '',
            };
        },
        content: '',
    };
}

const jsonStringInitializers = `    public init(JSONData: Data) {
        do {
            let json = try JSON(data: JSONData)
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \\(error)")
            self.init()
        }
    }
    public init(JSONString: String) {
        do {
            let json = try JSON(data: JSONString.data(using: .utf8) ?? Data())
            self.init(json: json)
        } catch {
            print("[WARNING] Error parsing JSON: \\(error)")
            self.init()
        }
    }`;

type InternallyTaggedPart = {
    tagValue: string;
    caseName: string;
    typeName: string;
    content: string;
};

/**
 * Shared by discriminator schemas and internally tagged union schemas.
 * Each variant becomes a struct that injects the tag into its JSON output.
 */
export function swiftInternallyTaggedEnum(
    schema: Schema,
    tagKey: string,
    variants: Record<string, SchemaFormProperties>,
    variantsSchemaKey: string,
    context: GeneratorContext,
): SwiftProperty {
    const typeName = getTypeName(schema, context);
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const result = unionEnumProperty(schema, context, typeName);
    if (context.generatedTypes.includes(typeName)) {
        return result;
    }
    const parts: InternallyTaggedPart[] = [];
    for (const key of Object.keys(variants)) {
        const subSchema = variants[key]!;
        const subType = swiftObjectFromSchema(subSchema, {
            clientVersion: context.clientVersion,
            clientName: context.clientName,
            typePrefix: context.typePrefix,
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/${variantsSchemaKey}/${key}`,
            generatedTypes: context.generatedTypes,
            discriminatorKey: tagKey,
            discriminatorParent: typeName,
            discriminatorValue: key,
            containsRequiredRef: context.containsRequiredRef,
        });
        parts.push({
            tagValue: key,
            caseName: validSwiftKey(key),
            typeName: subType.typeName.replace('?', ''),
            content: subType.content,
        });
    }
    const fallbackKey = getFallbackKey(variants, context);
    const fallbackPart = parts.find((part) => part.tagValue === fallbackKey)!;
    result.content = `${codeComments(schema)}public enum ${prefixedTypeName}: ArriClientModel {
${parts.map((part) => `${codeComments(variants[part.tagValue]!, '    ')}    case ${part.caseName}(${part.typeName})`).join('\n')}
    public init() {
        self = .${fallbackPart.caseName}(${fallbackPart.typeName}())
    }
    public init(json: JSON) {
        let __tag = json["${tagKey}"].string ?? ""
        switch (__tag) {
${parts
    .map(
        (part) => `            case "${part.tagValue}":
                self = .${part.caseName}(${part.typeName}(json: json))
                break`,
    )
    .join('\n')}
            default:
                self = .${fallbackPart.caseName}(${fallbackPart.typeName}())
                break
        }
    }
${jsonStringInitializers}
    public func toJSONString() -> String {
        switch(self) {
${parts
    .map(
        (part) => `            case .${part.caseName}(let __innerVal):
                return __innerVal.toJSONString()`,
    )
    .join('\n')}
        }
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        switch(self) {
${parts
    .map(
        (part) => `            case .${part.caseName}(let __innerVal):
                return __innerVal.toURLQueryParts()`,
    )
    .join('\n')}
        }
    }
    public func clone() -> ${prefixedTypeName} {
        switch(self) {
${parts
    .map(
        (part) => `            case .${part.caseName}(let __innerVal):
                return .${part.caseName}(__innerVal.clone())`,
    )
    .join('\n')}
        }
    }
}

${parts.map((part) => part.content).join('\n')}`;
    context.generatedTypes.push(typeName);
    return result;
}

type WrappedPart = {
    key: string;
    caseName: string;
    valueType: SwiftProperty;
};

/**
 * Externally tagged unions (no tagKey) and adjacently tagged unions (tagKey + valueKey).
 * Both wrap the variant value in an object, so each variant becomes an enum case with an associated value.
 */
function swiftWrappedUnionFromSchema(
    schema: SchemaFormUnion,
    context: GeneratorContext,
): SwiftProperty {
    const typeName = getTypeName(schema, context);
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const result = unionEnumProperty(schema, context, typeName);
    if (context.generatedTypes.includes(typeName)) {
        return result;
    }
    const tagKey = schema.tagKey;
    const valueKey = schema.valueKey;
    const parts: WrappedPart[] = [];
    const subContent: string[] = [];
    let isIndirect = false;
    for (const key of Object.keys(schema.union)) {
        const subSchema = schema.union[key]!;
        if (isSchemaFormRef(subSchema)) isIndirect = true;
        const valueType = swiftTypeFromSchema(subSchema, {
            clientVersion: context.clientVersion,
            clientName: context.clientName,
            typePrefix: context.typePrefix,
            instancePath: `/${typeName}/${key}`,
            schemaPath: `${context.schemaPath}/union/${key}`,
            generatedTypes: context.generatedTypes,
            containsRequiredRef: context.containsRequiredRef,
        });
        if (valueType.content) subContent.push(valueType.content);
        parts.push({ key, caseName: validSwiftKey(key), valueType });
    }
    const fallbackKey = getFallbackKey(schema.union, context);
    const fallbackPart = parts.find((part) => part.key === fallbackKey)!;
    const fallbackValue = `.${fallbackPart.caseName}(${fallbackPart.valueType.defaultValue || 'nil'})`;
    // externally tagged unions use the variant key as the JSON key for the value
    const jsonValueKey = (part: WrappedPart) =>
        tagKey && valueKey ? valueKey : part.key;
    const fromJsonCase = (
        part: WrappedPart,
    ) => `                var __variantValue: ${part.valueType.typeName}
        ${part.valueType.fromJsonTemplate(`json["${jsonValueKey(part)}"]`, '__variantValue', 'variantValue')}
                self = .${part.caseName}(__variantValue)`;
    let fromJsonBody: string;
    if (tagKey) {
        fromJsonBody = `        let __tag = json["${tagKey}"].string ?? ""
        switch (__tag) {
${parts
    .map(
        (part) => `            case "${part.key}":
${fromJsonCase(part)}
                break`,
    )
    .join('\n')}
            default:
                self = ${fallbackValue}
                break
        }`;
    } else {
        fromJsonBody = `${parts
            .map(
                (
                    part,
                    index,
                ) => `        ${index > 0 ? '} else ' : ''}if json["${part.key}"].exists() {
${fromJsonCase(part)}`,
            )
            .join('\n')}
        } else {
            self = ${fallbackValue}
        }`;
    }
    const toJsonPrefix = (part: WrappedPart) =>
        tagKey && valueKey
            ? `\\"${tagKey}\\":\\"${part.key}\\",\\"${valueKey}\\":`
            : `\\"${part.key}\\":`;
    result.content = `${codeComments(schema)}public ${isIndirect ? 'indirect ' : ''}enum ${prefixedTypeName}: ArriClientModel {
${parts.map((part) => `${codeComments(schema.union[part.key]!, '    ')}    case ${part.caseName}(${part.valueType.typeName})`).join('\n')}
    public init() {
        self = ${fallbackValue}
    }
    public init(json: JSON) {
${fromJsonBody}
    }
${jsonStringInitializers}
    public func toJSONString() -> String {
        var __json = "{"
        switch(self) {
${parts
    .map(
        (part) => `            case .${part.caseName}(let __variantValue):
                __json += "${toJsonPrefix(part)}"
        ${part.valueType.toJsonTemplate('__variantValue', '__json')}
                break`,
    )
    .join('\n')}
        }
        __json += "}"
        return __json
    }
    public func toURLQueryParts() -> [URLQueryItem] {
        print("[WARNING] unions cannot be serialized to query params. Skipping ${prefixedTypeName}.")
        return []
    }
    public func clone() -> ${prefixedTypeName} {
        switch(self) {
${parts
    .map((part) => {
        const cloneResult = part.valueType.cloneTemplate?.(
            '__variantValue',
            'variantValue',
        );
        return `            case .${part.caseName}(let __variantValue):
                ${cloneResult?.bodyContent ?? ''}
                return .${part.caseName}(${cloneResult?.fieldContent || '__variantValue'})`;
    })
    .join('\n')}
        }
    }
}

${subContent.join('\n')}`;
    context.generatedTypes.push(typeName);
    return result;
}
