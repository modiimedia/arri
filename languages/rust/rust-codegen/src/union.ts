import {
    getUnionFallbackKey,
    isSchemaFormProperties,
    Schema,
    SchemaFormProperties,
    SchemaFormUnion,
} from '@arrirpc/codegen-utils';

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

export function rustUnionFromSchema(
    schema: SchemaFormUnion,
    context: GeneratorContext,
): RustProperty {
    if (schema.tagKey && !schema.valueKey) {
        for (const key of Object.keys(schema.union)) {
            if (!isSchemaFormProperties(schema.union[key])) {
                throw new Error(
                    `Error at ${context.schemaPath}/union/${key}: All union variants must be an object when tagKey is specified without a valueKey`,
                );
            }
        }
        return rustInternallyTaggedEnumFromSchema(
            schema,
            schema.tagKey,
            schema.union as Record<string, SchemaFormProperties>,
            'union',
            context,
        );
    }
    return rustWrappedUnionFromSchema(schema, context);
}

/**
 * Shared by internally tagged union schemas and legacy discriminator schemas.
 * Each variant becomes an enum variant with named fields and the tag is injected into its JSON output.
 *
 * @param variantsSchemaKey The schema key that holds the variants. Used for error paths. ("mapping" for legacy discriminators)
 */
export function rustInternallyTaggedEnumFromSchema(
    schema: Schema,
    tagKey: string,
    variants: Record<string, SchemaFormProperties>,
    variantsSchemaKey: string,
    context: GeneratorContext,
): RustProperty {
    const enumName = getTypeName(schema, context);
    const prefixedEnumName = `${context.typeNamePrefix}${enumName}`;
    const isOptionType = outputIsOptionType(schema, context);
    const defaultValue = isOptionType ? 'None' : `${prefixedEnumName}::new()`;
    const result: RustProperty = {
        typeId: enumName,
        finalTypeName: isOptionType
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
    const discriminatorKey = tagKey;
    const discriminatorValues = Object.keys(variants);
    if (discriminatorValues.length === 0)
        throw new Error(
            `Union schemas must have at least one variant. Issue at ${context.schemaPath}.`,
        );
    type EnumSubType = {
        key: string;
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
        const subSchema = variants[discriminatorValue]!;
        const subType: EnumSubType = {
            key: discriminatorValue,
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
                schemaPath: `${context.schemaPath}/${variantsSchemaKey}/${discriminatorValue}/properties/${key}`,
                generatedTypes: context.generatedTypes,
                discriminatorKey: discriminatorKey,
                discriminatorValue: discriminatorValue,
                rootService: context.rootService,
            });
            if (keyType.content) subTypeContent.push(keyType.content);
            const keyName = validRustIdentifier(key);
            subType.properties.push({
                name: keyName,
                defaultValue: keyType.defaultValue,
                typeName: keyType.typeId,
                prefixedTypeName: keyType.finalTypeName,
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
                instancePath: `${context.instancePath}/${key}`,
                schemaPath: `${context.schemaPath}/${variantsSchemaKey}/${discriminatorValue}/optionalProperties/${key}`,
                generatedTypes: context.generatedTypes,
                discriminatorKey: discriminatorKey,
                discriminatorValue: discriminatorValue,
                rootService: context.rootService,
            });
            if (keyType.content) subTypeContent.push(keyType.content);
            const keyName = validRustIdentifier(key);
            subType.properties.push({
                name: keyName,
                defaultValue: keyType.defaultValue,
                typeName: keyType.typeId,
                prefixedTypeName: keyType.finalTypeName,
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
    const fallbackKey = getUnionFallbackKey(variants);
    const fallback = subTypes.find((type) => type.key === fallbackKey)!;
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
        Self::${fallback.name} {
            ${fallback.properties.map((prop) => `${prop.name}: ${prop.defaultValue},`).join('\n')}
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

/**
 * Externally tagged unions (no tagKey) and adjacently tagged unions (tagKey + valueKey).
 * Both wrap the variant value in an object, so each variant becomes a tuple variant holding the value.
 */
function rustWrappedUnionFromSchema(
    schema: SchemaFormUnion,
    context: GeneratorContext,
): RustProperty {
    const enumName = getTypeName(schema, context);
    const prefixedEnumName = `${context.typeNamePrefix}${enumName}`;
    const isOptionType = outputIsOptionType(schema, context);
    const defaultValue = isOptionType ? 'None' : `${prefixedEnumName}::new()`;
    const result: RustProperty = {
        typeId: enumName,
        finalTypeName: isOptionType
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
            return `println!("[WARNING] cannot serialize nested unions to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: '',
    };
    if (context.generatedTypes.includes(enumName)) {
        return result;
    }
    const keys = Object.keys(schema.union);
    if (keys.length === 0) {
        throw new Error(
            `Union schemas must have at least one variant. Issue at ${context.schemaPath}.`,
        );
    }
    const tagKey = schema.tagKey;
    const valueKey = schema.valueKey ?? 'value';
    const valueName = validRustIdentifier(valueKey);
    const subContent: string[] = [];
    const variants: {
        key: string;
        name: string;
        typeName: string;
        defaultValue: string;
        description: string;
        isDeprecated: boolean;
        fromJson: string;
        toJson: string;
    }[] = [];
    for (const key of keys) {
        const subSchema = schema.union[key]!;
        const valueType = rustTypeFromSchema(subSchema, {
            clientVersion: context.clientVersion,
            clientName: context.clientName,
            typeNamePrefix: context.typeNamePrefix,
            instancePath: `/${enumName}/${key}/${valueKey}`,
            schemaPath: `${context.schemaPath}/union/${key}`,
            generatedTypes: context.generatedTypes,
            rootService: context.rootService,
        });
        if (valueType.content) subContent.push(valueType.content);
        // externally tagged unions use the variant key as the JSON key for the value
        const jsonValueKey = tagKey ? valueKey : key;
        const jsonKeyPart = tagKey
            ? `\\"${tagKey}\\":\\"${key}\\",\\"${jsonValueKey}\\":`
            : `\\"${jsonValueKey}\\":`;
        let toJson = `_json_output_.push_str("${jsonKeyPart}");\n`;
        if (valueType.isNullable) {
            const innerKey = validRustIdentifier(`${valueKey}_val`);
            toJson += `match ${valueName} {
                Some(${innerKey}) => {
                    ${valueType.toJsonTemplate(innerKey, '_json_output_')};
                }
                _ => {
                    _json_output_.push_str("null");
                }
            };`;
        } else {
            toJson += `${valueType.toJsonTemplate(valueName, '_json_output_')};`;
        }
        variants.push({
            key,
            name: validRustName(key),
            typeName: valueType.finalTypeName,
            defaultValue: valueType.defaultValue,
            description: subSchema.metadata?.description ?? '',
            isDeprecated: subSchema.metadata?.isDeprecated ?? false,
            fromJson: valueType.fromJsonTemplate(
                `_val_.get("${jsonValueKey}")`,
                valueKey,
            ),
            toJson,
        });
    }
    const fallbackKey = getUnionFallbackKey(schema.union);
    const fallback = variants.find((variant) => variant.key === fallbackKey)!;
    let fromJsonBody: string;
    let tagFn = '';
    if (tagKey) {
        const tagName = validRustIdentifier(tagKey);
        fromJsonBody = `let ${tagName} = match _val_.get("${tagKey}") {
                    Some(serde_json::Value::String(${tagName}_val)) => ${tagName}_val.to_owned(),
                    _ => "".to_string(),
                };
                match ${tagName}.as_str() {
                    ${variants
                        .map(
                            (variant) => `"${variant.key}" => {
                        let ${valueName} = ${variant.fromJson};
                        Self::${variant.name}(${valueName})
                    }`,
                        )
                        .join('\n')}
                    _ => Self::new(),
                }`;
        tagFn = `

impl ${prefixedEnumName} {
    pub fn ${tagName}(&self) -> &'static str {
        match &self {
            ${variants.map((variant) => `Self::${variant.name}(_) => "${variant.key}",`).join('\n')}
        }
    }
}`;
    } else {
        fromJsonBody = `${variants
            .map(
                (variant) => `if _val_.contains_key("${variant.key}") {
                    let ${valueName} = ${variant.fromJson};
                    return Self::${variant.name}(${valueName});
                }`,
            )
            .join('\n')}
                Self::new()`;
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
    ${variants
        .map((variant) => {
            let leading = '';
            if (variant.description) {
                leading += formatDescriptionComment(variant.description);
                leading += '\n';
            }
            if (variant.isDeprecated) {
                leading += '#[deprecated]\n';
            }
            return `${leading}${variant.name}(${variant.typeName}),`;
        })
        .join('\n')}
}

impl ArriModel for ${prefixedEnumName} {
    fn new() -> Self {
        Self::${fallback.name}(${fallback.defaultValue})
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
                ${fromJsonBody}
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
            ${variants
                .map(
                    (variant) => `Self::${variant.name}(${valueName}) => {
                ${variant.toJson}
            }`,
                )
                .join('\n')}
        }
        _json_output_.push('}');
        _json_output_
    }

    fn to_query_params_string(&self) -> String {
        println!("[WARNING] cannot serialize unions to query params. Skipping ${prefixedEnumName}.");
        "".to_string()
    }
}${tagFn}

${subContent.join('\n\n')}`;
    context.generatedTypes.push(enumName);
    return result;
}
