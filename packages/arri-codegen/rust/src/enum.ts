import { type SchemaFormEnum, pascalCase } from "arri-codegen-utils";
import {
    type GeneratorContext,
    type RustProperty,
    isOptionType,
    maybeNone,
    maybeOption,
    validRustKey,
    getTypeName,
} from "./common";

export function rustEnumFromSchema(
    schema: SchemaFormEnum,
    context: GeneratorContext,
): RustProperty {
    const isOption = isOptionType(schema, context);
    const enumName = getTypeName(schema, context);
    const fieldParts: string[] = [];
    const fromJsonMatchParts: string[] = [];
    const toJsonStringMatchParts: string[] = [];
    const toQueryParamMatchParts: string[] = [];
    for (const val of schema.enum) {
        const rustVal = pascalCase(val, { normalize: true });
        fieldParts.push(rustVal);
        fromJsonMatchParts.push(`"${val}" => Self::${rustVal}`);
        toJsonStringMatchParts.push(
            `Self::${rustVal} => format!("\\"{}\\"", "${val}")`,
        );
        toQueryParamMatchParts.push(`Self::${rustVal} => "${val}".to_string()`);
    }
    const defaultVal = maybeNone(`${enumName}::${fieldParts[0]}`, isOption);
    let content = `#[derive(Debug, PartialEq, Clone)]
pub enum ${enumName} {
    ${fieldParts.join(",\n")}
}

impl ArriModel for ${enumName} {
    fn new() -> Self {
        Self::${pascalCase(schema.enum[0], { normalize: true })}
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::String(input_val) => match input_val.as_str() {
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
        fieldTemplate: maybeOption(enumName, isOption),
        defaultTemplate: defaultVal,
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
                    Some(${rustKey}_val) => Some(${enumName}::from_json(${rustKey}_val.to_owned())),
                    _ => None,
                }`;
            }
            if (valIsOption) {
                return `match ${val} {
    Some(${rustKey}_val) => ${enumName}::from_json(${rustKey}_val.to_owned()),
    _ => ${defaultVal},
}`;
            }
            return `${enumName}::from_json(${val}.to_owned())`;
        },
        toQueryTemplate: (target, val, key) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${target}.push(format!("${key}={}", ${rustKey}_val.to_query_params_string())),
                    _ => ${target}.push("${key}=null".to_string()),
                }`;
            }
            return `${target}.push(format!("${key}={}", ${val}.to_query_params_string()))`;
        },
        content,
    };
}
