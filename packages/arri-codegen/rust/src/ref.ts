import { pascalCase, snakeCase, type SchemaFormRef } from "arri-codegen-utils";
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
    const typeName = snakeCase(schema.ref);
    const isOption = isOptionType(schema, context);
    const isBoxed = context.rootTypeName === typeName;
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
        fromJsonTemplate(val, key) {
            const rustKey = validRustKey(key);
            const fromJsonStr = (v: string) =>
                isBoxed
                    ? `Box::new(${typeName}::from_json(${v}))`
                    : `${typeName}::from_json(${v})`;
            if (isOption) {
                return `match ${val} {
                    Some(${rustKey}_val) => Some(${fromJsonStr(`${rustKey}_val`)}),
                    _ => None,
                }`;
            }
            return `match ${val} {
                Some(${rustKey}_val) => ${fromJsonStr(`${rustKey}_val`)},
                _ => ${isBoxed ? `Box::new(${typeName}::new())` : `${typeName}::new()`}
            }`;
        },
        toQueryTemplate(target, val, key) {
            // TODO
        },
    };
}
