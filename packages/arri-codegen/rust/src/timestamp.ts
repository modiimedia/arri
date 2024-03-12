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

export function rustDateTimeFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    const isOption = isOptionType(schema, context);
    const fieldTemplate = maybeOption("DateTime<FixedOffset>", isOption);
    const defaultTemplate = maybeNone("DateTime::default()", isOption);
    return {
        fieldTemplate,
        defaultTemplate,
        toJsonTemplate: (target, val, key) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => {
                        ${target}.push_str(format!("\\"{}\\"", ${rustKey}_val.to_rfc3339()).as_str())
                    },
                    _ => ${target}.push_str("null"),
                }`;
            }
            return `${target}.push_str(format!("\\"{}\\"", ${val}.to_rfc3339()).as_str())`;
        },
        fromJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            return `match ${val} {
    Some(serde_json::Value::String(${rustKey}_val)) => ${maybeSome(`DateTime::<FixedOffset>::parse_from_rfc3339(${rustKey}_val).unwrap_or(DateTime::default())`, isOption)},
    _ => ${maybeNone(`DateTime::default()`, isOption)},
}`;
        },
        toQueryTemplate(target, val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
    Some(${rustKey}_val) => parts.push(format!("${key}={}", ${rustKey}_val.to_rfc3339())),
    _ => parts.push("${key}=null".to_string()),
}`;
            }
            return `${target}.push(format!("${key}={}", ${val}.to_rfc3339()))`;
        },
        content: "",
    };
}
