import { type SchemaFormType } from "arri-codegen-utils";
import {
    type GeneratorContext,
    maybeNone,
    maybeSome,
    validRustKey,
    type RustProperty,
    maybeOption,
    isOptionType,
} from "./common";

function defaultFromJson(
    val: string,
    key: string,
    fromJsonNumber: (subKey: string) => string,
    defaultVal: string,
    valIsOption: boolean,
) {
    const rustKey = validRustKey(key);
    return `match ${val} {
    ${maybeSome(`serde_json::Value::Number(${rustKey}_val)`, valIsOption)} => ${fromJsonNumber(`${rustKey}_val`)},
    _ => ${defaultVal},
}`;
}

function defaultToJson(
    target: string,
    val: string,
    key: string,
    isNullable?: boolean,
) {
    const rustKey = validRustKey(key);
    if (isNullable) {
        return `match ${val} {
    Some(${rustKey}_val) => ${target}.push_str(${rustKey}_val.to_string().as_str()),
    _ => ${target}.push_str("null"),
}`;
    }
    return `${target}.push_str(${val}.to_string().as_str())`;
}

function defaultToQuery(
    target: string,
    val: string,
    key: string,
    isNullable?: boolean,
) {
    const rustKey = validRustKey(key);
    if (isNullable) {
        return `match ${val} {
    Some(${rustKey}_val) => ${target}.push(format!("${key}={}", ${rustKey}_val)),
    _ => ${target}.push("${key}=null".to_string()),
}`;
    }
    return `${target}.push(format!("${key}={}", ${val}))`;
}

export function rustFloatFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    const isOption = isOptionType(schema, context);
    let typeName = "";
    switch (schema.type) {
        case "float32":
            typeName = "f32";
            break;
        case "float64":
            typeName = "f64";
            break;
        default:
            throw new Error(`${schema.type} is not a float`);
    }
    const fromJsonNumber = (subKey: string) => {
        if (schema.type === "float64") {
            return maybeSome(`${subKey}.as_f64().unwrap_or(0.0)`, isOption);
        }
        return maybeSome(`${subKey}.as_f64().unwrap_or(0.0) as f32`, isOption);
    };

    return {
        fieldTemplate: maybeOption(typeName, isOption),
        defaultTemplate: maybeNone("0.0", isOption),
        fromJsonTemplate: (val, key, valIsOption) =>
            defaultFromJson(
                val,
                key,
                fromJsonNumber,
                maybeNone("0.0", isOption),
                valIsOption,
            ),
        toJsonTemplate: (target, val, key) =>
            defaultToJson(target, val, key, schema.nullable),
        toQueryTemplate: (target, val, key) =>
            defaultToQuery(target, val, key, schema.nullable),
        content: "",
    };
}

export function rustIntFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    let typeName: string = "";
    switch (schema.type) {
        case "int8":
            typeName = "i8";
            break;
        case "uint8":
            typeName = "u8";
            break;
        case "int16":
            typeName = "i16";
            break;
        case "uint16":
            typeName = "u16";
            break;
        case "int32":
            typeName = "i32";
            break;
        case "uint32":
            typeName = "u32";
            break;
        case "int64":
            typeName = "i64";
            break;
        case "uint64":
            typeName = "u64";
            break;
    }
    let fromJsonTemplate = (val: string, key: string, valIsOption: boolean) =>
        defaultFromJson(
            val,
            key,
            (subKey) =>
                maybeSome(
                    `${typeName}::try_from(${subKey}.as_i64().unwrap_or(0)).unwrap_or(0)`,
                    isOptionType(schema, context),
                ),
            maybeNone(`0`, isOptionType(schema, context)),
            valIsOption,
        );
    let toJsonTemplate = (target: string, val: string, key: string) =>
        defaultToJson(target, val, key, schema.nullable);
    if (typeName === "i64" || typeName === "u64") {
        fromJsonTemplate = (val: string, key: string) => {
            const rustKey = validRustKey(key);
            return `match ${val} {
                Some(serde_json::Value::String(${rustKey}_val)) => ${maybeSome(
                    `${rustKey}_val.parse::<${typeName}>().unwrap_or(0)`,
                    isOptionType(schema, context),
                )},
                _ => ${maybeNone(`0`, isOptionType(schema, context))}
            }`;
        };
        toJsonTemplate = (target: string, val: string, key: string) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${target}.push_str(format!("\\"{}\\"", ${rustKey}_val.to_string()).as_str()),
                    _ => ${target}.push_str("null"),
                }`;
            }
            return `${target}.push_str(format!("\\"{}\\"", ${val}).as_str())`;
        };
    }

    return {
        fieldTemplate: maybeOption(typeName, isOptionType(schema, context)),
        defaultTemplate: maybeNone("0", isOptionType(schema, context)),
        toJsonTemplate,
        fromJsonTemplate,
        toQueryTemplate: (target, val, key) =>
            defaultToQuery(target, val, key, schema.nullable),
        content: "",
    };
}
