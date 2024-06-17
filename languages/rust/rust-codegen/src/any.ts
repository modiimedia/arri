import { SchemaFormEmpty } from "@arrirpc/codegen-utils";

import {
    GeneratorContext,
    outputIsOptionType,
    RustProperty,
    validRustIdentifier,
} from "./_common";

export default function rustAnyFromSchema(
    schema: SchemaFormEmpty,
    context: GeneratorContext,
): RustProperty {
    const isOptionType = outputIsOptionType(schema, context);
    return {
        typeName: isOptionType
            ? `Option<serde_json::Value>`
            : "serde_json::Value",
        defaultValue: isOptionType ? `None` : `serde_json::Value::Null`,
        isNullable: schema.nullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (isOptionType) {
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
            return `println!("[WARNING] cannot serialize any's to query params. Skipping field at ${context.instancePath}")`;
        },
        content: "",
    };
}
