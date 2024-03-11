import { pascalCase, type SchemaFormProperties } from "arri-codegen-utils";
import {
    type GeneratorContext,
    type RustProperty,
    validRustKey,
} from "./common";
import { rustTypeFromSchema } from ".";

export function rustStructFromSchema(
    schema: SchemaFormProperties,
    context: GeneratorContext,
): RustProperty {
    let structName = pascalCase(schema.metadata?.id ?? "");
    if (!structName.length) {
        structName = pascalCase(
            context.instancePath.length
                ? context.instancePath.split("/").join("_")
                : context.schemaPath.split("/").join("_"),
            {
                normalize: true,
            },
        );
    }
    const keyParts: string[] = [];
    const fieldParts: string[] = [];
    const defaultParts: string[] = [];
    const toJsonParts: string[] = [];
    const fromJsonParts: string[] = [];
    const toQueryParts: string[] = [];
    const subContentParts: string[] = [];
    let keyCount = 0;
    for (const key of Object.keys(schema.properties)) {
        const rustKey = validRustKey(key);
        keyParts.push(rustKey);
        const prop = rustTypeFromSchema(schema.properties[key], {
            ...context,
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
            `            let ${rustKey} = ${prop.fromJsonTemplate("val", key)};`,
        );
        if (keyCount === 0) {
            toJsonParts.push(`output.push_str("\\"${key}\\":");`);
        } else {
            toJsonParts.push(`output.push_str(",\\"${key}\\":");`);
        }
        toJsonParts.push(
            `output.push_str(
    ${prop.toJsonTemplate(`&self.${rustKey}`, key)}
    .as_str(),
);`,
        );
        toQueryParts.push(
            `parts.push(${prop.toQueryTemplate(`&self.${rustKey}`, key)});`,
        );

        keyCount++;
    }
    if (schema.optionalProperties) {
        for (const key of Object.keys(schema.optionalProperties)) {
            const rustKey = validRustKey(key);
            keyParts.push(rustKey);
            const prop = rustTypeFromSchema(schema.optionalProperties[key], {
                ...context,
                instancePath: `${context.instancePath}/${key}`,
                schemaPath: `${context.schemaPath}/optionalProperties/${key}`,
                isOptional: true,
            });
            if (prop.content) {
                subContentParts.push(prop.content);
            }
            fieldParts.push(`    pub ${rustKey}: ${prop.fieldTemplate}`);
            defaultParts.push(`        ${rustKey}: None`);
            fromJsonParts.push(`let ${rustKey} = match val.get("${key}") {
                 Some(serde_json::Value(${rustKey}_val)) => Some(${prop.fromJsonTemplate(`${rustKey}_val`, key)}),
                 _ => None,
            };`);
            if (keyCount > 0) {
                toJsonParts.push(`match &self.${rustKey} {
                    Some(${rustKey}_val) => {
                        output.push_str(",\\"${key}\\":");
                        output.push_str(${prop.toJsonTemplate(`${rustKey}_val`, key)}.as_str());
                    },
                    _ => {},
                };`);
            } else {
                toJsonParts.push(`match &self.${rustKey} {
                    Some(${rustKey}_val) => {
                        if(key_count == 0) {
                            output.push_str("\\"${key}\\":");
                        } else {
                            output.push_str(",\\"${key}\\":");
                        }
                        output.push_str(${prop.toJsonTemplate(`${rustKey}_val`, key)}.as_str());
                        key_count += 1;
                    },
                    _ => {},
                };`);
            }
            toQueryParts.push(`match &self.${rustKey} {
                Some(${rustKey}_val) => {
                    parts.push(${prop.toQueryTemplate(`${rustKey}_val`, key)});
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
        match serde_json::Value::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }
    fn to_json_string(&self) -> String {
        let mut output = "{".to_string();
        ${toJsonParts.join("\n")}
        output.push('}');
        output
    }
    fn to_query_params_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        ${toQueryParts.join("\n")}
        parts.join("&")
    }
}`;
    if (context.generatedTypes.includes(structName)) {
        content = "";
    } else {
        context.generatedTypes.push(structName);
    }
    return {
        fieldTemplate: structName,
        defaultTemplate: `${structName}::new()`,
        toJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${structName}.to_json_string(),
                    _ => "null".to_string(),
                }`;
            }
            return `${rustKey}.to_json_string()`;
        },
        fromJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                Some(serde_json::Value(${rustKey}_val)) => ${structName}.from_json(${rustKey}_val),
                _ => None(),
            }`;
            }
            return `match ${val} {
                Some(serde_json::Value(${rustKey}_val)) => ${structName}.from_json(${rustKey}_val),
                _ => ${structName}::new(),
            }`;
        },
        toQueryTemplate(val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `format!("${key}={}", match ${val} {
                    Some(serde_json::Value(${rustKey}_val)) => ${structName}.to_query_params_string(),
                    _ => "null".to_string(),
                })`;
            }
            return `format!("${key}={}, ${structName}.to_query_params_string())`;
        },
        content,
    };
}
