import { type Schema } from "arri-codegen-utils";
import {
    type GeneratorContext,
    maybeOption,
    isOptionType,
    validRustKey,
    type RustProperty,
    maybeNone,
} from "./common";

export function rustAnyFromSchema(
    schema: Schema,
    context: GeneratorContext,
): RustProperty {
    const isOption = isOptionType(schema, context);
    return {
        fieldTemplate: maybeOption("serde_json::Value", isOption),
        defaultTemplate: maybeNone("serde_json::Value::Null", isOption),
        fromJsonTemplate(val, key) {
            const rustKey = validRustKey(key);
            if (isOption) {
                return `match ${val} {
                    Some(${rustKey}_val) => Some(${rustKey}_val.to_owned()),
                    _ => None,
                }`;
            }
            return `match ${val} {
                Some(${rustKey}_val) => ${rustKey}_val.to_owned(),
                _ => serde_json::Value::Null,
            }`;
        },
        toJsonTemplate: (target, val, key) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${target}.push_str(serde_json::to_string(${rustKey}_val).unwrap_or("null".to_string()).as_str()),
                    _ => ${target}.push_str("null"),
                }`;
            }
            return `${target}.push_str(serde_json::to_string(${val}).unwrap_or("\\"null\\"".to_string()).as_str())`;
        },
        toQueryTemplate(target, val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${target}.push(format!("${key}={}", serde_json::to_string(${rustKey}_val).unwrap_or("null".to_string()))),
                    _ => ${target}.push("${key}=null".to_string()),
                }`;
            }
            return `${target}.push(format!("${key}={}", serde_json::to_string(${val}).unwrap_or("null".to_string())))`;
        },
        content: "",
    };
}
