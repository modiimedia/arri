import { execSync } from "node:child_process";
import fs from "node:fs";
import {
    type AppDefinition,
    type Schema,
    type SchemaFormProperties,
    type SchemaFormType,
    defineClientGeneratorPlugin,
    isSchemaFormType,
    pascalCase,
    unflattenProcedures,
    isSchemaFormProperties,
    type SchemaFormEnum,
    isSchemaFormEnum,
} from "arri-codegen-utils";
import path from "pathe";
import {
    maybeNone,
    maybeSome,
    validRustKey,
    type GeneratorContext,
    type RustProperty,
    maybeOption,
    isOptionType,
} from "./common";
import { rustFloatFromSchema, rustIntFromSchema } from "./numbers";

interface RustClientGeneratorOptions {
    clientName: string;
    outputFile: string;
    format?: boolean;
}

export const rustClientGenerator = defineClientGeneratorPlugin(
    (options: RustClientGeneratorOptions) => {
        return {
            generator(def) {
                const context: GeneratorContext = {
                    clientName: options.clientName,
                    generatedTypes: [],
                    instancePath: "",
                    schemaPath: "",
                };
                const client = createRustClient(def, context);
                const outputFile = path.resolve(options.outputFile);
                fs.writeFileSync(outputFile, client);
                const shouldFormat = options.format ?? true;
                if (shouldFormat) {
                    try {
                        execSync(`rustfmt ${outputFile}`);
                    } catch (err) {
                        console.error(`Error formatting`, err);
                    }
                }
            },
            options,
        };
    },
);

export function createRustClient(
    def: AppDefinition,
    context: GeneratorContext,
): string {
    const services = unflattenProcedures(def.procedures);

    const modelParts: string[] = [];
    for (const key of Object.keys(def.models)) {
        const result = rustTypeFromSchema(def.models[key], {
            ...context,
            instancePath: key,
            schemaPath: "",
        });
        if (result.content) {
            modelParts.push(result.content);
        }
    }
    return `#![allow(dead_code)]
use arri_client::{
    async_trait::async_trait,
    chrono::{DateTime, FixedOffset},
    parsed_arri_request,
    reqwest::Method,
    serde_json::{self},
    ArriClientConfig, ArriModel, ArriParsedRequestOptions, ArriRequestError, ArriService,
    EmptyArriModel,
};
use std::{collections::HashMap, str::FromStr};

${modelParts.join("\n\n")}`;
}

export function rustTypeFromSchema(
    schema: Schema,
    context: GeneratorContext,
): RustProperty {
    if (isSchemaFormType(schema)) {
        switch (schema.type) {
            case "boolean":
                return rustBoolFromSchema(schema, context);
            case "string":
                return rustStringFromSchema(schema, context);
            case "timestamp":
                return rustDateTimeFromSchema(schema, context);
            case "float32":
            case "float64":
                return rustFloatFromSchema(schema, context);
            case "int8":
            case "uint8":
            case "int16":
            case "uint16":
            case "int32":
            case "uint32":
            case "int64":
            case "uint64":
                return rustIntFromSchema(schema, context);
        }
    }
    if (isSchemaFormProperties(schema)) {
        return rustStructFromSchema(schema, context);
    }
    if (isSchemaFormEnum(schema)) {
        return rustEnumFromSchema(schema, context);
    }
    return rustAnyFromSchema(schema, context);
}

export function rustAnyFromSchema(
    schema: Schema,
    context: GeneratorContext,
): RustProperty {
    return {
        fieldTemplate: maybeOption(
            "serde_json::Value",
            isOptionType(schema, context),
        ),
        defaultTemplate: schema.nullable ? "None()" : "serde_json::Value::Null",
        fromJsonTemplate(val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(serde_json::Value(${rustKey}_val)) => Some(${rustKey}_val),
                    _ => None(),
                }`;
            }
            return `match ${val} {
                Some(serde_json::Value(${rustKey}_val)) => ${maybeSome(`${rustKey}_val`, context.isOptional)},
                _ => ${maybeNone("serde_json::Value::Null", context.isOptional)},
            }`;
        },
        toJsonTemplate(val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val}.get("${key}") {
                    Some(${rustKey}_val) => match serde_json::to_string(${rustKey}_val) {
                        Ok(${rustKey}_val_result) => ${rustKey}_val_result,
                        _ => None,
                    },
                    _ => None,
                }`;
            }
            return `match ${val}.get("${key}") {
                Some(${rustKey}_val) => match serde_json::to_string(${rustKey}_val) {
                    Ok(${rustKey}_val_result) => ${rustKey}_val_result,
                    _ => "".to_string()
                },
                _ => "".to_string(),
            }`;
        },
        toQueryTemplate(val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => match serde_json::to_string(${rustKey}_val) {
                        Ok(${rustKey}_val_result) => ${rustKey}_val_result,
                        _ => "null".to_string(),
                    },
                    _ => "null".to_string(),
                }`;
            }
            return `match serde_json::to_string(${val}) {
                Ok(${rustKey}_val) => ${rustKey}_val,
                _ => "".to_string(),
            }`;
        },
        content: "",
    };
}

export function rustBoolFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    if (schema.nullable) {
        return {
            fieldTemplate: "Option<bool>",
            defaultTemplate: "None()",
            toJsonTemplate: (val, key) => {
                const rustKey = validRustKey(key);
                return `format!(match ${val} {
    Some(${rustKey}_val) => ${rustKey}_val.to_string(),
    None => "null".to_string(),
})`;
            },
            fromJsonTemplate: (val, key) => {
                const rustKey = validRustKey(key);
                return `match ${val}.get("${key}") {
    Some(serde_json::Value::Bool(${rustKey}_val)) => Some(${rustKey}_val),
    _ => None(),
}`;
            },
            toQueryTemplate(val, key) {
                const rustKey = validRustKey(key);
                return `match ${val} {
                    Some(${rustKey}_val) => ${rustKey}_val,
                    _ => "null".to_string(),
                }`;
            },
            content: "",
        };
    }
    return {
        fieldTemplate: "bool",
        defaultTemplate: "false",
        toJsonTemplate: (val, _) => {
            return `${val}.to_string()`;
        },
        fromJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            return `match ${val}.get("${key}") {
    Some(serde_json::Value::Bool(${rustKey}_val)) => ${maybeSome(`${rustKey}_val`, context.isOptional)},
    _ => ${maybeNone("false", context.isOptional)},
}`;
        },
        toQueryTemplate(val, key) {
            return val;
        },
        content: "",
    };
}

export function rustStringFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    if (schema.nullable) {
        return {
            fieldTemplate: "Option<String>",
            defaultTemplate: "None",
            toJsonTemplate: (val, key) => {
                const rustKey = validRustKey(key);
                const result = `match ${val} {
    Some(${rustKey}_val) => ${rustKey}_val.replace("\\n", "\\\\n").replace("\\"", "\\\\\\""),
    None => "null".to_string()
}`;
                if (context.instancePath.length === 0) {
                    return `format!("\\"{}\\"", ${result})`;
                }
                return result;
            },
            fromJsonTemplate: (val, key) => {
                const rustKey = validRustKey(key);
                return `match ${val}.get("${key}") {
    Some(serde_json::Value::String(${rustKey}_val)) => Some(${rustKey}_val.to_owned()),
    _ => None,
}`;
            },
            toQueryTemplate(val, key) {
                return `match ${val} {
                    Some(${key}_val) => ${key}_val,
                    _ => "null".to_string(),
                }`;
            },
            content: "",
        };
    }
    return {
        fieldTemplate: "String",
        defaultTemplate: '"".to_string()',
        toJsonTemplate: (val, key) => {
            if (context.instancePath.length === 0) {
                return `${val}.replace("\\n", "\\\\n").replace("\\"", "\\\\\\"")`;
            }
            return `format!(
    "\\"{}\\"", 
    ${val}.replace("\\n", "\\\\n").replace("\\"", "\\\\\\"")
)`;
        },
        fromJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            return `match ${val}.get("${key}") {
    Some(serde_json::Value::String(${rustKey}_val)) => ${maybeSome(`${rustKey}_val.to_owned()`, context.isOptional)},
    _ => ${maybeNone(`"".to_string()`, context.isOptional)},
}`;
        },
        toQueryTemplate(val, key) {
            return val;
        },
        content: "",
    };
}

export function rustDateTimeFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    if (schema.nullable) {
        return {
            fieldTemplate: "Some<DateTime<FixedOffset>>",
            defaultTemplate: "None()",
            toJsonTemplate: (val, key) => {
                const rustKey = validRustKey(key);
                const output = `match ${val} {
                    Some(${rustKey}_val) => ${rustKey}_val.to_rfc3339()
                }`;
                if (context.instancePath.length === 0) {
                    return `format!("\\"{}\\"", ${output})`;
                }
                return output;
            },
            fromJsonTemplate: (val, key) => {
                const rustKey = validRustKey(key);
                return `match ${val}.get("${key}") {
                    Some(serde_json::Value::String(${rustKey}_val)) => match DateTime::<FixedOffset>::parse_from_rfc3339(${rustKey}_val.as_str()) {
                        Ok(${rustKey}_val_result) => Some(${rustKey}_val_result),
                        _ => None(),
                    },
                    _ => None(),
                }`;
            },
            toQueryTemplate(val, key) {
                return `match ${val} {
                    Some(${key}_val) => ${key}_val.to_rfc3339(),
                    _ => "null".to_string(),
                }`;
            },
            content: "",
        };
    }
    return {
        fieldTemplate: "DateTime<FixedOffset>",
        defaultTemplate: "DateTime::default()",
        toJsonTemplate(val, key) {
            const output = `${val}.to_rfc3339()`;
            if (context.instancePath.length !== 0) {
                return `format!("\\"{}\\"", ${output})`;
            }
            return output;
        },
        fromJsonTemplate(val, key) {
            const rustKey = validRustKey(key);
            return `match ${val}.get("${key}") {
                Some(serde_json::Value::String(${rustKey}_val)) => match DateTime::<FixedOffset>::parse_from_rfc3339(${rustKey}_val.as_str()) {
                    Ok(${rustKey}_val_result) => ${maybeSome(`${rustKey}_val_result`, context.isOptional)},
                    _ => ${maybeNone("DateTime::default()", context.isOptional)},
                },
                _ => ${maybeNone(`DateTime::default()`, context.isOptional)},
            }`;
        },
        toQueryTemplate(val, key) {
            return `${val}.to_rfc3339()`;
        },
        content: "",
    };
}

export function rustEnumFromSchema(
    schema: SchemaFormEnum,
    context: GeneratorContext,
): RustProperty {
    let enumName = pascalCase(schema.metadata?.id ?? "");
    if (!enumName.length) {
        enumName = pascalCase(
            context.instancePath.length
                ? context.instancePath.split("/").join("_")
                : context.schemaPath.split("/").join("_"),
            { normalize: true },
        );
    }
    const fieldParts: string[] = [];
    for (const val of schema.enum) {
        const rustVal = pascalCase(val, { normalize: true });
        fieldParts.push(rustVal);
    }
    const defaultVal = maybeNone(`${enumName}::${fieldParts[0]}`);
    let content = `pub enum ${enumName} {
    ${fieldParts.join(",\n")}
}`;
    if (context.generatedTypes.includes(enumName)) {
        content = "";
    } else {
        context.generatedTypes.push(enumName);
    }

    return {
        fieldTemplate: maybeOption(enumName, isOptionType(schema, context)),
        defaultTemplate: defaultVal,
        toJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${rustKey}_val.to_json_string(),
                    _ => "null".to_string(),
                }`;
            }
            return `${val}.to_json_string()`;
        },
        fromJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => Some(${enumName}::from_json(${rustKey}_val)),
                    _ => None,
                }`;
            }
            return `${enumName}::from_json(${val})`;
        },
        toQueryTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${rustKey}_val.to_query_params_string(),
                    _ => "null".to_string(),
                }`;
            }
            return `${val}.to_query_params_string()`;
        },
        content,
    };
}

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
            `parts.push(format!("${key}={}", ${prop.toQueryTemplate(`&self.${rustKey}`, key)}));`,
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
                 Some(serde_json::Value(${rustKey}_val)) => ${prop.fromJsonTemplate(`${rustKey}_val`, key)},
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
                    parts.push(format!("${key}={}", ${prop.toQueryTemplate(`${rustKey}_val`, key)}));
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
            }
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
                return `match ${val} {
                    Some(serde_json::Value(${rustKey}_val)) => ${structName}.to_query_params_string(),
                    _ => "null".to_string(),
                }`;
            }
            return `${structName}.to_query_params_string()`;
        },
        content,
    };
}
