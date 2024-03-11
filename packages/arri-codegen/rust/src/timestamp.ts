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
    const fieldTemplate = maybeOption(
        "DateTime<FixedOffset>",
        isOptionType(schema, context),
    );
    const defaultTemplate = maybeNone(
        "DateTime::default()",
        isOptionType(schema, context),
    );
    return {
        fieldTemplate,
        defaultTemplate,
        toJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            let output = `${val}.to_rfc3339()`;
            if (schema.nullable) {
                output = `match ${val} {
                    Some(${rustKey}_val) => ${rustKey}_val.to_rfc3339(),
                    _ => "null".to_string(),
                }`;
            }
            if (context.instancePath.length !== 0) {
                return `format!("\\"{}\\"", ${output})`;
            }
            return output;
        },
        fromJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            return `match ${val}.get("${key}") {
                    Some(serde_json::Value::String(${rustKey}_val)) => ${maybeSome(`DateTime::<FixedOffset>::parse_from_rfc3339(${rustKey}_val).unwrap_or(DateTime::default())`)},
                    _ => ${maybeNone(`DateTime::default()`, schema.nullable)},
                }`;
        },
        toQueryTemplate(val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `format!("${key}={}", match ${val} {
                    Some(${rustKey}_val) => ${rustKey}_val.to_rfc3339(),
                    _ => "null".to_string()
                })`;
            }
            return `format!("${key}={}", ${val}.to_rfc3339())`;
        },
        content: "",
    };
}
