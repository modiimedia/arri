import { type SchemaFormType } from "arri-codegen-utils";
import {
    type GeneratorContext,
    type RustProperty,
    maybeNone,
    maybeSome,
    validRustKey,
} from "./common";

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
    Some(serde_json::Value::Bool(${rustKey}_val)) => ${maybeSome(`${rustKey}_val.to_owned()`, context.isOptional)},
    _ => ${maybeNone("false", context.isOptional)},
}`;
        },
        toQueryTemplate(val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `format!("${key}={}", match ${val} {
                    Some(${rustKey}_val) => ${rustKey}_val.to_string(),
                    _ => "null".to_string()
                })`;
            }
            return `format!("${key}={}", ${val})`;
        },
        content: "",
    };
}
