import { SchemaFormDiscriminator } from "@arrirpc/codegen-utils";

import {
    codeComments,
    GeneratorContext,
    getTypeName,
    isNullableType,
    SwiftProperty,
    validSwiftKey,
} from "./_common";
import { swiftObjectFromSchema } from "./object";

type DiscriminatorPart = {
    discriminatorValue: string;
    discriminatorCase: string;
    typeName: string;
    content: string;
};

export function swiftTaggedUnionFromSchema(
    schema: SchemaFormDiscriminator,
    context: GeneratorContext,
): SwiftProperty {
    const typeName = getTypeName(schema, context);
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const isNullable = isNullableType(schema, context);
    const defaultValue = isNullable ? `` : `${prefixedTypeName}()`;
    const result: SwiftProperty = {
        typeName: isNullable ? `${prefixedTypeName}?` : prefixedTypeName,
        isNullable,
        defaultValue,
        canBeQueryString: false,
        fromJsonTemplate(input, target, _) {
            if (context.isOptional) {
                return `if ${input}.exists() {
                    ${target} = ${prefixedTypeName}(json: ${input})
                }`;
            }
            if (schema.nullable) {
                return `if ${input}.dictionary != nil {
                    ${target} = ${prefixedTypeName}(json: ${input})
                }`;
            }
            return `${target} = ${prefixedTypeName}(json: ${input})`;
        },
        toJsonTemplate(input, target) {
            if (context.isOptional) {
                return `${target} += ${input}!.toJSONString()`;
            }
            if (schema.nullable) {
                return `if ${input} != nil {
                    ${target} += ${input}!.toJSONString()
                } else {
                    ${target} += "null" 
                }`;
            }
            return `${target} += ${input}.toJSONString()`;
        },
        toQueryStringTemplate(_, __, ___) {
            return `print("[WARNING] nested objects cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        cloneTemplate(input, _) {
            return {
                fieldContent: `${input}${isNullable ? "?" : ""}.clone()`,
                bodyContent: "",
            };
        },
        content: "",
    };
    if (context.generatedTypes.includes(typeName)) {
        return result;
    }
    const discriminatorParts: DiscriminatorPart[] = [];
    const discriminatorKey = schema.discriminator;
    for (const key of Object.keys(schema.mapping)) {
        const discriminatorValue = key;
        const subSchema = schema.mapping[key]!;
        const subType = swiftObjectFromSchema(subSchema, {
            clientVersion: context.clientVersion,
            clientName: context.clientName,
            typePrefix: context.typePrefix,
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/mapping/${key}`,
            generatedTypes: context.generatedTypes,
            discriminatorKey,
            discriminatorParent: typeName,
            discriminatorValue: key,
        });
        const discriminatorCase = validSwiftKey(key);
        const discriminatorPart: DiscriminatorPart = {
            discriminatorValue: discriminatorValue,
            discriminatorCase: discriminatorCase,
            typeName: subType.typeName.replace("?", ""),
            content: subType.content,
        };
        discriminatorParts.push(discriminatorPart);
    }
    const defaultPart = discriminatorParts[0];
    if (!defaultPart) {
        throw new Error(
            `Invalid schema at ${context.schemaPath}. Discriminators must have at least one mapping.`,
        );
    }
    result.content = `${codeComments(schema)}public enum ${prefixedTypeName}: ArriClientModel {
${discriminatorParts.map((part) => `    case ${part.discriminatorCase}(${part.typeName})`).join("\n")}
    public init() {
        self = .${defaultPart.discriminatorCase}(${defaultPart.typeName}())
    }
    public init(json: JSON) {
        let discriminator = json["${discriminatorKey}"].string ?? ""
        switch (discriminator) {
${discriminatorParts
    .map(
        (part) => `            case "${part.discriminatorValue}":
                self = .${part.discriminatorCase}(${part.typeName}(json: json))
                break`,
    )
    .join("\n")}
            default:
                self = .${defaultPart.discriminatorCase}(${defaultPart.typeName}())
                break
        }
    }
    public init(JSONString: String) {
        do {
            let data = try JSON(data:  JSONString.data(using: .utf8) ?? Data())
            self.init(json: data)
        } catch {
            self.init()
        }
    }
    public func toJSONString() -> String {
        switch(self) {
${discriminatorParts
    .map(
        (part) => `            case .${part.discriminatorCase}(let __innerVal):
                return __innerVal.toJSONString()`,
    )
    .join("\n")}
        }
    }
    public func toQueryString() -> String {
        switch(self) {
${discriminatorParts
    .map(
        (part) => `            case .${part.discriminatorCase}(let __innerVal):
                return __innerVal.toQueryString()`,
    )
    .join("\n")}
        }
    }
    public func clone() -> ${prefixedTypeName} {
        switch(self) {
${discriminatorParts
    .map(
        (part) => `            case .${part.discriminatorCase}(let __innerVal):
                return .${part.discriminatorCase}(__innerVal.clone())`,
    )
    .join("\n")}
        }
    }
}
    
${discriminatorParts.map((part) => part.content).join("\n")}`;
    context.generatedTypes.push(typeName);
    return result;
}
