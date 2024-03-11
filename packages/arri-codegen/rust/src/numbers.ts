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
) {
    const rustKey = validRustKey(key);
    return `match ${val} {
    Some(serde_json::Value::Number(${rustKey}_val)) => ${fromJsonNumber(`${rustKey}_val`)},
    _ => ${defaultVal},
}`;
}

function defaultToJson(val: string, key: string, isNullable?: boolean) {
    const rustKey = validRustKey(key);
    if (isNullable) {
        return `match ${val} {
    Some(${rustKey}_val) => ${rustKey}_val.to_string(),
    _ => "null".to_string(),
}`;
    }
    return `${val}.to_string()`;
}

function defaultToQuery(val: string, key: string, isNullable?: boolean) {
    const rustKey = validRustKey(key);
    if (isNullable) {
        return `match ${val} {
    Some(${rustKey}_val) => ${rustKey}_val.to_string(),
    _ => "null".to_string(),
}`;
    }
    return `${val}.to_string()`;
}

export function rustFloatFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
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
            return maybeSome(
                `${subKey}.as_f64().unwrap_or(0.0)`,
                schema.nullable,
            );
        }
        return maybeSome(
            `f32::try_from(${subKey}.as_f64().unwrap_or(0.0)).unwrap_or(0.0)`,
            schema.nullable,
        );
    };

    return {
        fieldTemplate: maybeOption(typeName, isOptionType(schema, context)),
        defaultTemplate: maybeNone("0.0", schema.nullable),
        fromJsonTemplate: (val, key) =>
            defaultFromJson(
                val,
                key,
                fromJsonNumber,
                maybeNone("0.0", schema.nullable),
            ),
        toJsonTemplate: (val, key) => defaultToJson(val, key, schema.nullable),
        toQueryTemplate: (val, key) =>
            defaultToQuery(val, key, schema.nullable),
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
    let fromJsonTemplate = (val: string, key: string) =>
        defaultFromJson(
            val,
            key,
            (subKey) =>
                maybeSome(
                    `${typeName}::tryFrom(${subKey}.as_i64().unwrap_or(0.0)).unwrap_or(0)`,
                ),
            maybeNone(`0`, schema.nullable),
        );
    if (typeName === "i64" || typeName === "u64") {
        fromJsonTemplate = (val: string, key: string) => {
            const rustKey = validRustKey(key);
            return `match ${val} {
                Some(serde_json::Value::String(${rustKey}_val)) => ${maybeSome(
                    `${rustKey}_val.parse::<${typeName}>().unwrap_or(0)`,
                    schema.nullable,
                )},
                _ => ${maybeNone(`0`, schema.nullable)}`;
        };
    }

    return {
        fieldTemplate: maybeOption(typeName, isOptionType(schema, context)),
        defaultTemplate: maybeNone("0", isOptionType(schema, context)),
        toJsonTemplate: (val, key) => defaultToJson(val, key, schema.nullable),
        fromJsonTemplate,
        toQueryTemplate: (val, key) =>
            defaultToQuery(val, key, schema.nullable),
        content: "",
    };
}
