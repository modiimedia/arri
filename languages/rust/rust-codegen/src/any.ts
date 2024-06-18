import { SchemaFormEmpty } from "@arrirpc/codegen-utils";

import { GeneratorContext, RustProperty, validRustIdentifier } from "./_common";

export default function rustAnyFromSchema(
    schema: SchemaFormEmpty,
    context: GeneratorContext,
): RustProperty {
    return {
        typeName: context.isOptional
            ? `Option<serde_json::Value>`
            : "serde_json::Value",
        defaultValue: context.isOptional ? `None` : `serde_json::Value::Null`,
        isNullable: false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (context.isOptional) {
                return `match ${input} {
                            Some(${innerKey}) => Some(${innerKey}.to_owned()),
                            _ => None,
                        }`;
            }
            return `match ${input} {
                        Some(${innerKey}) => ${innerKey}.to_owned(),
                        _ => serde_json::Value::Null,
                    }`;
        },
        toJsonTemplate(input, target) {
            return `${target}.push_str(
                        serde_json::to_string(${input})
                            .unwrap_or("null".to_string())
                            .as_str(),
                    )`;
        },
        toQueryStringTemplate() {
            return `println!("[WARNING] cannot serialize any's to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: "",
    };
}
