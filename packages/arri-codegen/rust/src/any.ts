import { type Schema } from "arri-codegen-utils";
import {
    type GeneratorContext,
    maybeOption,
    isOptionType,
    validRustKey,
    type RustProperty,
    maybeSome,
    maybeNone,
} from "./common";

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
                return `match ${val}.get("${key}") {
                    Some(${rustKey}_val) => Some(${rustKey}_val),
                    _ => None(),
                }`;
            }
            return `match ${val}.get("${key}") {
                Some(${rustKey}_val) => ${rustKey}_val.to_owned(),
                _ => serde_json::Value::Null",
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
                return `format!("${key}={}", match ${val} {
                    Some(${rustKey}_val) => serde_json::to_string(${rustKey}_val).unwrap_or("null".to_string()),
                    _ => "null".to_string(),
                })`;
            }
            return `format!("${key}={}", serde_json::to_string(${val}).unwrap_or("null".to_string()))`;
        },
        content: "",
    };
}
