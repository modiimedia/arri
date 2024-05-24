import { SchemaFormRef } from "@arrirpc/codegen-utils";

import {
    GeneratorContext,
    outputIsOptionType,
    RustProperty,
    validRustIdentifier,
    validRustName,
} from "./_common";

export default function rustRefFromSchema(
    schema: SchemaFormRef,
    context: GeneratorContext,
): RustProperty {
    const innerTypeName = validRustName(schema.ref);
    const isOptionType = outputIsOptionType(schema, context);
    const needsBoxing = context.parentTypeNames.includes(innerTypeName);
    let typeName = needsBoxing ? `Box<${innerTypeName}>` : `${innerTypeName}`;
    if (isOptionType) {
        typeName = `Option<${typeName}>`;
    }
    let defaultValue: string;
    if (isOptionType) {
        defaultValue = "None";
    } else if (needsBoxing) {
        defaultValue = `Box::new(${innerTypeName}::new())`;
    } else {
        defaultValue = `${innerTypeName}::new()`;
    }
    return {
        typeName,
        defaultValue,
        isNullable: schema.nullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            const valFromJson = (input: string) => {
                if (needsBoxing) {
                    return `Box::new(${innerTypeName}::from_json(${input}.to_owned()))`;
                }
                return `${innerTypeName}::from_json(${input}.to_owned())`;
            };
            if (isOptionType) {
                return `match ${input} {
                    Some(${innerKey}) => match ${innerKey} {
                        serde_json::Value::Object(_) => {
                            Some(${valFromJson(innerKey)})
                        }
                        _ => None,
                    },
                    _ => None,
                }`;
            }
            return `match ${input} {
                Some(${innerKey}) => match ${innerKey} {
                    serde_json::Value::Object(_) => {
                        ${valFromJson(innerKey)}
                    }
                    _ => ${valFromJson(innerKey)},
                },
                _ => ${valFromJson(innerKey)},
            }`;
        },
        toJsonTemplate(input, target) {
            return `${target}.push_str(${input}.to_json_string().as_str())`;
        },
        toQueryStringTemplate() {
            return `println!("[WARNING] cannot serialize nested objects to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: "",
    };
}
