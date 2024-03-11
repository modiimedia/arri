import { type SchemaFormEnum, pascalCase } from "arri-codegen-utils";
import {
    type GeneratorContext,
    type RustProperty,
    isOptionType,
    maybeNone,
    maybeOption,
    validRustKey,
} from "./common";

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
    const fromJsonMatchParts: string[] = [];
    const toJsonStringMatchParts: string[] = [];
    const toQueryParamMatchParts: string[] = [];
    for (const val of schema.enum) {
        const rustVal = pascalCase(val, { normalize: true });
        fieldParts.push(rustVal);
        fromJsonMatchParts.push(`"${val}" => Self::${rustVal}`);
        toJsonStringMatchParts.push(`Self:${rustVal} => "${val}".to_string()`);
        toQueryParamMatchParts.push(`Self::${rustVal} => "${val}".to_string()`);
    }
    const defaultVal = maybeNone(`#[derive(Debug, PartialEq, Clone)]
${enumName}::${fieldParts[0]}`);
    let content = `pub enum ${enumName} {
    ${fieldParts.join(",\n")}
}

impl ArriModel for ${enumName} {
    fn new() -> Self {
        Self::A
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::String(val) -> match val.as_str() {
                ${fromJsonMatchParts.join(",\n\t\t\t\t")},
                _ => Self::${pascalCase(schema.enum[0], { normalize: true })},
            },
            _ => Self::${pascalCase(schema.enum[0], { normalize: true })}
        }
    }
    fn from_json_string(input: String) -> Self {
        match serde_json::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }
    fn to_json_string(&self) -> String {
        match &self {
            ${toJsonStringMatchParts.join(",\n\t\t\t")},
        }
    }
    fn to_query_params_string(&self) -> String {
        match &self {
            ${toQueryParamMatchParts.join(",\n\t\t\t")},
        }
    }
}
`;
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
                return `format!("${key}={}", match ${val} {
                    Some(${rustKey}_val) => ${rustKey}_val.to_query_params_string(),
                    _ => "null".to_string(),
                })`;
            }
            return `format!("${key}={}", ${val}.to_query_params_string())`;
        },
        content,
    };
}
