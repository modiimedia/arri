import { SchemaFormDiscriminator } from '@arrirpc/codegen-utils';

import {
    formatDescriptionComment,
    GeneratorContext,
    getTypeName,
    outputIsOptionType,
    RustProperty,
    validRustIdentifier,
    validRustName,
} from './_common';
import { rustTypeFromSchema } from './_index';

export function rustTaggedUnionFromSchema(
    schema: SchemaFormDiscriminator,
    context: GeneratorContext,
): RustProperty {
    const enumName = getTypeName(schema, context);
    const prefixedEnumName = `${context.typeNamePrefix}${enumName}`;
    const isOptionType = outputIsOptionType(schema, context);
    const defaultValue = isOptionType ? 'None' : `${prefixedEnumName}::new()`;
    const result: RustProperty = {
        typeName: enumName,
        prefixedTypeName: isOptionType
            ? `Option<${prefixedEnumName}>`
            : prefixedEnumName,
        defaultValue,
        isNullable: isOptionType,
        fromJsonTemplate(input: string, key: string) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (isOptionType) {
                return `match ${input} {
                    Some(${innerKey}) => match ${innerKey} {
                        serde_json::Value::Object(_) => {
                            Some(${prefixedEnumName}::from_json(${innerKey}.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
                }`;
            }
            return `match ${input} {
                Some(${innerKey}) => match ${innerKey} {
                    serde_json::Value::Object(_) => {
                        ${prefixedEnumName}::from_json(${innerKey}.to_owned())
                    }
                    _ => ${prefixedEnumName}::new(),
                },
                _ => ${prefixedEnumName}::new(),
            }`;
        },
        toJsonTemplate(input: string, target: string) {
            return `${target}.push_str(${input}.to_json_string().as_str())`;
        },
        toQueryStringTemplate() {
            return `println!("[WARNING] cannot serialize nested objects to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: '',
    };
    if (context.generatedTypes.includes(enumName)) {
        return result;
    }
    const discriminatorKey = schema.discriminator;
    const discriminatorValues = Object.keys(schema.mapping);
    if (discriminatorValues.length === 0)
        throw new Error(
            `Discriminator schemas must have at least one subtype. Issue at ${context.schemaPath}.`,
        );
    type EnumSubType = {
        name: string;
        properties: {
            name: string;
            defaultValue: string;
            typeName: string;
            prefixedTypeName: string;
            isDeprecated: boolean;
            description: string;
        }[];
        isDeprecated: boolean;
        description: string;
        toJsonParts: string[];
        toQueryParts: string[];
    };
    const subTypes: EnumSubType[] = [];
    const subTypeContent: string[] = [];
    const discriminatorKeyProperty = validRustIdentifier(discriminatorKey);
    const fromJsonParts: string[] = [];
    for (const discriminatorValue of discriminatorValues) {
        const subTypeName = validRustName(discriminatorValue);
        const subSchema = schema.mapping[discriminatorValue]!;
        const subType: EnumSubType = {
            name: subTypeName,
            properties: [],
            toJsonParts: [],
            toQueryParts: [],
            isDeprecated: subSchema.metadata?.isDeprecated ?? false,
            description: subSchema.metadata?.description ?? '',
        };
        fromJsonParts.push(`"${discriminatorValue}" => {`);
        const keyNames: string[] = [];
        subType.toJsonParts.push(
            `\t\t_json_output_.push_str("\\"${discriminatorKey}\\":\\"${discriminatorValue}\\"");`,
        );
        subType.toQueryParts.push(
            `_query_parts_.push(format!("${discriminatorKey}=${discriminatorValue}"));`,
        );
        for (const key of Object.keys(subSchema.properties)) {
            const keySchema = subSchema.properties[key]!;
            const keyType = rustTypeFromSchema(keySchema, {
                clientVersion: context.clientVersion,
                clientName: context.clientName,
                typeNamePrefix: context.typeNamePrefix,
                instancePath: `${context.instancePath}/${key}`,
                schemaPath: `${context.schemaPath}/mapping/${key}`,
                generatedTypes: context.generatedTypes,
                discriminatorKey: discriminatorKey,
                discriminatorValue: discriminatorValue,
            });
            if (keyType.content) subTypeContent.push(keyType.content);
            const keyName = validRustIdentifier(key);
            subType.properties.push({
                name: keyName,
                defaultValue: keyType.defaultValue,
                typeName: keyType.typeName,
                prefixedTypeName: keyType.prefixedTypeName,
                isDeprecated: keySchema.metadata?.isDeprecated ?? false,
                description: keySchema.metadata?.description ?? '',
            });
            keyNames.push(keyName);
            fromJsonParts.push(
                `let ${keyName} = ${keyType.fromJsonTemplate(`_val_.get("${key}")`, key)};`,
            );
            subType.toJsonParts.push(
                `\t\t_json_output_.push_str(",\\"${key}\\":");`,
            );
            if (keyType.isNullable) {
                const innerKey = validRustIdentifier(`${key}_val`);
                subType.toJsonParts.push(`match ${keyName} {
                    Some(${innerKey}) => {
                        ${keyType.toJsonTemplate(innerKey, '_json_output_')};
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };`);
            } else {
                subType.toJsonParts.push(
                    `${keyType.toJsonTemplate(keyName, '_json_output_')};`,
                );
            }
            subType.toQueryParts.push(
                `${keyType.toQueryStringTemplate(keyName, key, '_query_parts_')};`,
            );
        }
        for (const key of Object.keys(subSchema.optionalProperties ?? {})) {
            const keySchema = subSchema.optionalProperties![key]!;
            const keyType = rustTypeFromSchema(keySchema, {
                clientVersion: context.clientVersion,
                clientName: context.clientName,
                typeNamePrefix: context.typeNamePrefix,
                instancePath: `${context.instancePath}/key`,
                schemaPath: `${context.schemaPath}/mapping/${key}`,
                generatedTypes: context.generatedTypes,
                discriminatorKey: discriminatorKey,
                discriminatorValue: discriminatorValue,
            });
            if (keyType.content) subTypeContent.push(keyType.content);
            const keyName = validRustIdentifier(key);
            subType.properties.push({
                name: keyName,
                defaultValue: keyType.defaultValue,
                typeName: keyType.typeName,
                prefixedTypeName: keyType.prefixedTypeName,
                isDeprecated: keySchema.metadata?.isDeprecated ?? false,
                description: keySchema.metadata?.description ?? '',
            });
            keyNames.push(keyName);
            fromJsonParts.push(
                `let ${keyName} = ${keyType.fromJsonTemplate(`_val_.get("${key}")`, key)};`,
            );
            subType.toJsonParts.push(
                `\t\t_json_output_.push_str(",\\"${key}\\":");`,
            );
            if (keyType.isNullable) {
                const innerKey = validRustIdentifier(`${key}_val`);
                subType.toJsonParts.push(`match ${keyName} {
                    Some(${innerKey}) => {
                        ${keyType.toJsonTemplate(innerKey, '_json_output_')};
                    }
                    _ => {
                        _json_output_.push_str("null");
                    }
                };`);
            } else {
                subType.toJsonParts.push(
                    `${keyType.toJsonTemplate(keyName, '_json_output_')};`,
                );
            }
        }
        fromJsonParts.push(`Self::${subTypeName} {
            ${subType.properties.map((prop) => `${prop.name},`).join('\n')}    
        }`);
        fromJsonParts.push(`}`);
        subTypes.push(subType);
    }
    let leading = '';
    if (schema.metadata?.description) {
        leading += formatDescriptionComment(schema.metadata.description);
        leading += '\n';
    }
    if (schema.metadata?.isDeprecated) {
        leading += '#[deprecated]\n';
    }
    result.content = `${leading}#[derive(Clone, Debug, PartialEq)]
pub enum ${prefixedEnumName} {
    ${subTypes
        .map((type) => {
            let leading = '';
            if (type.description) {
                leading += formatDescriptionComment(type.description);
                leading += '\n';
            }
            if (type.isDeprecated) {
                leading += '#[deprecated]\n';
            }
            return `${leading}${type.name} {
        ${type.properties
            .map((prop) => {
                let leading = '';
                if (prop.description) {
                    leading += formatDescriptionComment(prop.description);
                    leading += '\n';
                }
                if (prop.isDeprecated) {
                    leading += '#[deprecated]\n';
                }
                return `${leading}${prop.name}: ${prop.prefixedTypeName},`;
            })
            .join('\n')}
    },`;
        })
        .join('\n')}
}

impl ArriModel for ${prefixedEnumName} {
    fn new() -> Self {
        Self::${subTypes[0]!.name} {
            ${subTypes[0]?.properties.map((prop) => `${prop.name}: ${prop.defaultValue},`).join('\n')}
        }
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                let ${discriminatorKeyProperty} = match _val_.get("${discriminatorKey}") {
                    Some(serde_json::Value::String(${discriminatorKeyProperty}_val)) => ${discriminatorKeyProperty}_val.to_owned(),
                    _ => "".to_string(),
                };
                match ${discriminatorKeyProperty}.as_str() {
                    ${fromJsonParts.join('\n')}
                    _ => Self::new(),
                }
            }
            _ => Self::new(),
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        let mut _json_output_ = "{".to_string();
        match &self {
            ${subTypes.map(
                (
                    type,
                ) => `Self::${type.name} { ${type.properties.map((prop) => `${prop.name},`).join('\n')}} => {
                ${type.toJsonParts.join('\n')}    
            }`,
            )}
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        match &self {
            ${subTypes.map(
                (
                    type,
                ) => `Self::${type.name} { ${type.properties.map((prop) => `${prop.name},`).join('\n')}} => {
                ${type.toQueryParts.join('\n')}
            }`,
            )}
        }
        _query_parts_.join("&")
    }
}

${subTypeContent.join('\n\n')}`;
    context.generatedTypes.push(enumName);
    return result;
}
