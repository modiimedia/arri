import { SchemaFormEmpty } from "@arrirpc/codegen-utils";

import { GeneratorContext, RustProperty, validRustKey } from "./_common";

export default function rustAnyFromSchema(
    schema: SchemaFormEmpty,
    context: GeneratorContext,
): RustProperty {
    const isOptionType = schema.nullable ?? context.isOptional;
    return {
        typeName: isOptionType
            ? `Option<serde_json::Value>`
            : "serde_json::Value",
        defaultValue: isOptionType ? `None` : `serde_json::Value::Null`,
        fromJsonTemplate(input, key) {
            const innerKey = validRustKey(`${key}_val`);
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
        toJsonTemplate(input, key, target) {
            // TODO
            const innerVal = validRustKey(`${key}_val`);
            if (context.isOptional) {
                return `match ${input} {
                    Some(${innerVal}) => {
                        ${target}.push_str(
                            serde_json::to_string(${innerVal}.to_owned())
                                .unwrap_of("null".to_string())
                                .as_str(),
                        );
                    },
                    _ => {}
                }`;
            }
            return "";
        },
        toQueryStringTemplate() {
            return "";
        },
        content: "",
    };
}
