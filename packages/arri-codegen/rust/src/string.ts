import { type SchemaFormType } from "arri-codegen-utils";
import {
    type GeneratorContext,
    type RustProperty,
    maybeNone,
    validRustKey,
    maybeOption,
    isOptionType,
} from "./common";

export function rustStringFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    const isOption = isOptionType(schema, context);
    const fieldTemplate = maybeOption("String", isOption);
    const defaultTemplate = maybeNone(`"".to_string()`, isOption);
    return {
        fieldTemplate,
        defaultTemplate,
        toJsonTemplate: (target, val, key) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${target}.push_str(
                            format!("\\"{}\\"", ${rustKey}_val.replace("\\n", "\\\\n").replace("\\"", "\\\\\\"")).as_str()),
                    _ => ${target}.push_str("null"),
                }`;
            }
            return `${target}.push_str(format!("\\"{}\\"", ${val}.replace("\\n", "\\\\n").replace("\\"", "\\\\\\"")).as_str())`;
        },
        fromJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            if (isOption) {
                return `match ${val} {
    Some(serde_json::Value::String(${rustKey}_val)) => Some(${rustKey}_val.to_owned()),
    _ => None,
}`;
            }
            return `match ${val} {
    Some(serde_json::Value::String(${rustKey}_val)) => ${rustKey}_val.to_owned(),
    _ => "".to_string(),
}`;
        },
        toQueryTemplate(target, val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${target}.push(format!("${key}={}", ${rustKey}_val)),
                    _ => ${target}.push("${key}=null".to_string()),
                }`;
            }
            return `${target}.push(format!("${key}={}", ${val}))`;
        },
        content: "",
    };
}
