import { type SchemaFormProperties } from "arri-codegen-utils";
import {
    type GeneratorContext,
    type RustProperty,
    validRustKey,
    getTypeName,
    isOptionType,
    maybeOption,
    maybeNone,
} from "./common";
import { rustTypeFromSchema } from ".";

export function rustStructFromSchema(
    schema: SchemaFormProperties,
    context: GeneratorContext,
): RustProperty {
    const structName = getTypeName(schema, context);
    if (context.instancePath === "") {
        context.parentIds = [structName];
    } else {
        context.parentIds.push(structName);
    }
    const isOption = isOptionType(schema, context);
    const keyParts: string[] = [];
    const fieldParts: string[] = [];
    const defaultParts: string[] = [];
    const toJsonParts: string[] = [];
    const fromJsonParts: string[] = [];
    const toQueryParts: string[] = [];
    const subContentParts: string[] = [];
    const requiredKeyCount = Object.keys(schema.properties).length;
    const keyCountPart =
        requiredKeyCount > 0
            ? `let _key_count_ = ${requiredKeyCount}`
            : `let mut _key_count_ = ${requiredKeyCount}`;
    let keyCount = 0;
    for (const key of Object.keys(schema.properties)) {
        const rustKey = validRustKey(key);
        keyParts.push(rustKey);
        const prop = rustTypeFromSchema(schema.properties[key], {
            ...context,
            parentId: structName,
            instancePath: `${context.instancePath}/${key}`,
            schemaPath: `${context.schemaPath}/properties/${key}`,
            isOptional: false,
        });
        if (prop.content) {
            subContentParts.push(prop.content);
        }
        fieldParts.push(`    pub ${rustKey}: ${prop.fieldTemplate}`);
        defaultParts.push(`        ${rustKey}: ${prop.defaultTemplate}`);
        fromJsonParts.push(
            `let ${rustKey} = ${prop.fromJsonTemplate(`val.get("${key}")`, key, true)};`,
        );
        if (keyCount === 0) {
            toJsonParts.push(`_json_output_.push_str("\\"${key}\\":");`);
        } else {
            toJsonParts.push(`_json_output_.push_str(",\\"${key}\\":");`);
        }
        toJsonParts.push(
            prop.toJsonTemplate("_json_output_", `&self.${rustKey}`, key),
        );
        toQueryParts.push(
            prop.toQueryTemplate("_query_parts_", `&self.${rustKey}`, key),
        );
        keyCount++;
    }
    if (schema.optionalProperties) {
        for (const key of Object.keys(schema.optionalProperties)) {
            const rustKey = validRustKey(key);
            keyParts.push(rustKey);
            const subSchema = schema.optionalProperties[key];
            const prop = rustTypeFromSchema(subSchema, {
                ...context,
                parentId: structName,
                instancePath: `${context.instancePath}/${key}`,
                schemaPath: `${context.schemaPath}/optionalProperties/${key}`,
                isOptional: true,
            });
            if (prop.content) {
                subContentParts.push(prop.content);
            }
            fieldParts.push(`    pub ${rustKey}: ${prop.fieldTemplate}`);
            defaultParts.push(`        ${rustKey}: None`);
            fromJsonParts.push(
                `let ${rustKey} = ${prop.fromJsonTemplate(`val.get("${key}")`, key, true)};`,
            );
            if (keyCount > 0) {
                toJsonParts.push(`match &self.${rustKey} {
                    Some(${rustKey}_val) => {
                        _json_output_.push_str(",\\"${key}\\":");
                        ${prop.toJsonTemplate(`_json_output_`, `${rustKey}_val`, key)};
                    },
                    _ => {},
                };`);
            } else {
                toJsonParts.push(`match &self.${rustKey} {
                    Some(${rustKey}_val) => {
                        if _key_count_ > 0 {
                            _json_output_.push(',');
                        }
                        _json_output_.push_str("\\"${key}\\":");
                        ${prop.toJsonTemplate("_json_output_", `${rustKey}_val`, key)};
                        _key_count_ += 1;
                    },
                    _ => {},
                };`);
            }
            toQueryParts.push(`match &self.${rustKey} {
                Some(${rustKey}_val) => {
                    ${prop.toQueryTemplate("_query_parts_", `${rustKey}_val`, key)};
                },
                _ => {},
            };`);
        }
    }

    let content = `#[derive(Debug, PartialEq, Clone)]
pub struct ${structName} {
${fieldParts.join(",\n")},
}

impl ArriModel for ${structName} {
    fn new() -> Self {
        Self {
${defaultParts.join(",\n")},
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => {
${fromJsonParts.join("\n")}
                Self {
                    ${keyParts.join(",\n            ")},
                }
            },
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
        ${keyCountPart};
        ${toJsonParts.join(";\n\t\t")};
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
        ${toQueryParts.join(";\n\t\t")};
        _query_parts_.join("&")
    }
}
${subContentParts.join("\n")}
`;
    if (context.generatedTypes.includes(structName)) {
        content = "";
    } else {
        context.generatedTypes.push(structName);
    }
    return {
        fieldTemplate: maybeOption(structName, isOption),
        defaultTemplate: maybeNone(`${structName}::new()`, isOption),
        toJsonTemplate: (target, val, key) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${target}.push_str(${rustKey}_val.to_json_string().as_str()),
                    _ => ${target}.push_str("null"),
                }`;
            }
            return `${target}.push_str(${val}.to_json_string().as_str())`;
        },
        fromJsonTemplate: (val, key, valIsOption) => {
            const rustKey = validRustKey(key);
            if (isOption) {
                return `match ${val} {
                Some(${rustKey}_val) => match ${rustKey}_val {
                    serde_json::Value::Object(_) => Some(${structName}::from_json(${rustKey}_val.to_owned())),
                    _ => None,
                },
                _ => None,
            }`;
            }
            if (valIsOption) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${structName}::from_json(${rustKey}_val.to_owned()),
                    _ => ${structName}::new(),
                }`;
            }
            return `${structName}::from_json(${val}.to_owned())`;
        },
        toQueryTemplate(target, val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `${target}.push(format!("${key}={}", match ${val} {
                    Some(${rustKey}_val) => ${rustKey}_val.to_query_params_string(),
                    _ => "null".to_string(),
                }))`;
            }
            return `${target}.push(format!("${key}={}", ${val}.to_query_params_string()))`;
        },
        content,
    };
}
