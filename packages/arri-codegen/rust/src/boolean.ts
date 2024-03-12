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

export function rustBoolFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    const isOption = isOptionType(schema, context);
    return {
        fieldTemplate: maybeOption("bool", isOption),
        defaultTemplate: maybeNone(`false`, isOption),
        toJsonTemplate: (target, val, key) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${target}.push_str(${rustKey}_val.to_string().as_str()),
                    _ => ${target}.push_str("null"),
                }`;
            }
            return `${target}.push_str(${val}.to_string().as_str())`;
        },
        fromJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            return `match ${val} {
    Some(serde_json::Value::Bool(${rustKey}_val)) => ${maybeSome(`${rustKey}_val.to_owned()`, isOption)},
    _ => ${maybeNone("false", isOption)},
}`;
        },
        toQueryTemplate(target, val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${target}.push(format!("${key}={}", ${rustKey}_val)),
                    _ => ${target}.push("${key}=null".to_string())
                }`;
            }
            return `${target}.push(format!("${key}={}", ${val}))`;
        },
        content: "",
    };
}
