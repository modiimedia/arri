import { type SchemaFormType } from "arri-codegen-utils";
import {
    type GeneratorContext,
    type RustProperty,
    maybeNone,
    maybeSome,
    validRustKey,
    maybeOption,
    isOptionType,
} from "./common";

export function rustStringFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    const fieldTemplate = maybeOption("String", isOptionType(schema, context));
    const defaultTemplate = maybeNone(
        `"".to_string()`,
        isOptionType(schema, context),
    );
    return {
        fieldTemplate,
        defaultTemplate,
        toJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            let result = `${val}.replace("\\n", "\\\\n").replace("\\"", "\\\\\\"")`;
            if (schema.nullable) {
                result = `match ${val} {
                    Some(${rustKey}_val) => ${rustKey}_val.replace("\\n", "\\\\n").replace("\\"", "\\\\\\""),
                    None => "null".to_string(),
                }`;
            }
            if (context.instancePath.length !== 0) {
                return `format!("\\"{}\\"", ${result})`;
            }
            return result;
        },
        fromJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val}.get("${key}") {
    Some(serde_json::Value::String(${rustKey}_val)) => Some(${rustKey}_val.to_owned()),
    _ => None,
}`;
            }
            return `match ${val}.get("${key}") {
                Some(serde_json::Value::String(${rustKey}_val)) => ${rustKey}_val.to_owned(),
                _ => "".to_string(),
            }`;
        },
        toQueryTemplate(val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `format!("${key}={}", match ${val} {
                    Some(${key}_val) => ${key}_val,
                    _ => "null".to_string(),
                })`;
            }
            return `format!("${key}={}", ${val})`;
        },
        content: "",
    };
}
