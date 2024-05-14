import { type SchemaFormRef, pascalCase } from "@arrirpc/codegen-utils";
import {
    isOptionType,
    type GeneratorContext,
    type RustProperty,
    maybeNone,
    maybeOption,
    validRustKey,
} from "./common";

export function rustRefFromSchema(
    schema: SchemaFormRef,
    context: GeneratorContext,
): RustProperty {
    const typeName = pascalCase(schema.ref, {
        normalize: true,
    });
    const isOption = isOptionType(schema, context);
    const isBoxed = context.parentIds.includes(typeName);
    const defaultVal = isBoxed
        ? `Box::new(${typeName}::new())`
        : `${typeName}::new()`;
    return {
        fieldTemplate: maybeOption(
            isBoxed ? `Box<${typeName}>` : typeName,
            isOption,
        ),
        defaultTemplate: maybeNone(defaultVal, isOption),
        toJsonTemplate(target, val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${target}.push_str(${rustKey}_val.to_json_string().as_str()),
                    _ => ${target}.push_str("null"),
                }`;
            }
            return `${target}.push_str(${val}.to_json_string().as_str())`;
        },
        fromJsonTemplate(val, key, valIsOption) {
            const rustKey = validRustKey(key);
            const fromJsonStr = (v: string) =>
                isBoxed
                    ? `Box::new(${typeName}::from_json(${v}.to_owned()))`
                    : `${typeName}::from_json(${v}.to_owned())`;
            if (isOption) {
                return `match ${val} {
    Some(${rustKey}_val) => Some(${fromJsonStr(`${rustKey}_val`)}),
    _ => None,
}`;
            }
            if (valIsOption) {
                return `match ${val} {
    Some(${rustKey}_val) => ${fromJsonStr(`${rustKey}_val`)},
    _ => ${isBoxed ? `Box::new(${typeName}::new())` : `${typeName}::new()`}
}`;
            }
            return fromJsonStr(val);
        },
        toQueryTemplate(target, val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${target}.push(format!("${key}={}", ${rustKey}_val.to_query_params_string())),
                    _ => ${target}.push("${key}=null".to_string()),
                }`;
            }
            if (isOption) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${target}.push(format!("${key}={}", ${rustKey}_val.to_query_params_string())),
                    _ => {},
                }`;
            }
            return `${target}.push(format!("${key}={}", ${val}.to_query_params_string()))`;
            // TODO
        },
        content: "",
    };
}
