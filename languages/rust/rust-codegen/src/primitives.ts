import { SchemaFormType } from "@arrirpc/codegen-utils";

import {
    GeneratorContext,
    outputIsOptionType,
    RustProperty,
    validRustIdentifier,
} from "./_common";

export function rustStringFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    const isOptionType = outputIsOptionType(schema, context);
    const defaultValue = isOptionType ? "None" : '"".to_string()';
    const typeName = isOptionType ? "Option<String>" : "String";
    return {
        typeName,
        defaultValue,
        isNullable: schema.nullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (isOptionType) {
                return `match ${input} {
                    Some(serde_json::Value::String(${innerKey})) => Some(${innerKey}.to_owned()),
                    _ => None,
                }`;
            }
            return `match ${input} {
                Some(serde_json::Value::String(${innerKey})) => ${innerKey}.to_owned(),
                _ => "".to_string(),
            }`;
        },
        toJsonTemplate(input, target) {
            return `${target}.push_str(serialize_string(${input}).as_str())`;
        },
        toQueryStringTemplate(input, key, target) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (context.isOptional) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(format!("${key}={}", ${innerKey}));
                    }
                    _ => {}
                }`;
            }
            if (schema.nullable) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(format!("${key}={}", ${innerKey}));
                    },
                    _ => {
                        ${target}.push("null".to_string());
                    }
                }`;
            }
            return `${target}.push(format!("${key}={}", ${input}));`;
        },
        content: "",
    };
}

export function rustBooleanFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    const isOptionType = outputIsOptionType(schema, context);
    const defaultValue = isOptionType ? "None" : "false";
    const typeName = isOptionType ? "Option<bool>" : "bool";
    return {
        typeName,
        defaultValue,
        isNullable: schema.nullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (isOptionType) {
                return `match ${input} {
                    Some(serde_json::Value::Bool(${innerKey})) => Some(${innerKey}.to_owned()),
                    _ => None,
                }`;
            }
            return `match ${input} {
                Some(serde_json::Value::Bool(${innerKey})) => Some(${innerKey}.to_owned()),
                _ => Some(false),
            }`;
        },
        toJsonTemplate(input, target) {
            return `${target}.push_str(${input}.to_string().as_str())`;
        },
        toQueryStringTemplate(input, key, target) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (context.isOptional) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(${innerKey}.to_string());
                    }
                    _ => {}
                }`;
            }
            if (schema.nullable) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(${innerKey}.to_string());
                    }
                    _ => {
                        ${target}.push("null".to_string());
                    }
                }`;
            }
            return `${target}.push(${input}.to_string())`;
        },
        content: "",
    };
}

export function rustTimestampFromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    const isOptionType = outputIsOptionType(schema, context);
    const typeName = isOptionType
        ? "Option<DateTime<FixedOffset>>"
        : "DateTime<FixedOffset>";
    const defaultValue = isOptionType ? "None" : "DateTime::default()";
    return {
        typeName,
        defaultValue,
        isNullable: schema.nullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (isOptionType) {
                return `match ${input} {
                    Some(serde_json::Value::String(${innerKey})) => {
                        match DateTime::parsed_from_rfc3339(${innerKey}) {
                            Ok(${innerKey}_result) => Some(${innerKey}_result),
                            Err(_) => None,
                        }
                    }
                    _ => None,
                }`;
            }
            return `match ${input} {
                Some(serde_json::Value::String(${innerKey})) => {
                    DateTime::parse_from_rfc3339(${innerKey}).unwrap_or_default()
                }
                _ => DateTime::default(),
            }`;
        },
        toJsonTemplate(input, target) {
            return `${target}.push_str(serialize_date_time(${input}, true).as_str())`;
        },
        toQueryStringTemplate(input, key, target) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (context.isOptional) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(format!("${key}={}", serialize_date_time(${innerKey}, false)));
                    }
                    _ => {}
                }`;
            }
            if (schema.nullable) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(format!("${key}={}", serialize_date_time(${innerKey}, false)));
                    },
                    _ => {
                        ${target}.push("${key}=null".to_string());
                    }
                }`;
            }
            return `${target}.push(format!("${key}={}", serialize_date_time(${input}, false)))`;
        },
        content: "",
    };
}

export function rustF32FromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    const isOptionType = outputIsOptionType(schema, context);
    const typeName = isOptionType ? `Option<f32>` : "f32";
    const defaultValue = isOptionType ? `None` : "0.0";
    return {
        typeName,
        defaultValue,
        isNullable: schema.nullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (isOptionType) {
                return `match ${input} {
                    Some(serde_json::Value::Number(${innerKey})) => match ${innerKey}.as_f64() {
                        Some(${innerKey}_result) => Some(${innerKey}_result as f32),
                        _ => None,
                    },
                    _ => None,
                }`;
            }
            return `match ${input} {
                Some(serde_json::Value::Number(${innerKey})) => {
                    ${innerKey}.as_f64().unwrap_or(0.0) as f32
                }
                _ => 0.0,
            }`;
        },
        toJsonTemplate(input, target) {
            return `${target}.push_str(${input}.to_string().as_str())`;
        },
        toQueryStringTemplate(input, key, target) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (context.isOptional) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(format!("${key}={}", ${innerKey}));
                    }
                    _ => {}
                }`;
            }
            if (schema.nullable) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(format!("${key}={}", ${innerKey}));
                    }
                    _ => {
                        ${target}.push("${key}=null".to_string());
                    }
                }`;
            }
            return `${target}.push(format!("${key}={}", ${input}))`;
        },
        content: "",
    };
}

export function rustF64FromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    const isOptionType = outputIsOptionType(schema, context);
    const typeName = isOptionType ? `Some<f64>` : "f64";
    const defaultValue = isOptionType ? `None` : "0.0";
    return {
        typeName,
        defaultValue,
        isNullable: schema.nullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (isOptionType) {
                return `match ${input} {
                    Some(serde_json::Value::Number(${innerKey})) => match ${innerKey}.as_f64() {
                        Some(${innerKey}_result) => Some(${innerKey}_result),
                        _ => None,
                    },
                    _ => None,
                }`;
            }
            return `match ${input} {
                Some(serde_json::Value::Number(${innerKey})) => {
                    ${innerKey}.as_f64().unwrap_or(0.0)
                }
                _ => 0.0,
            }`;
        },
        toJsonTemplate(input, target) {
            return `${input}.push_str(${target}.to_string().as_str())`;
        },
        toQueryStringTemplate(input, key, target) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (context.isOptional) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(format!("${key}={}", ${innerKey}));
                    },
                    _ => {}
                }`;
            }
            if (schema.nullable) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(format!("${key}={}", ${innerKey}));
                    },
                    _ => {
                        ${target}.push("${key}=null".to_string());
                    }
                }`;
            }
            return `${target}.push(format!("${key}={}", ${input}))`;
        },
        content: "",
    };
}

export function rustI8FromSchema(
    schema: SchemaFormType,
    context: GeneratorContext,
): RustProperty {
    const isOptionType = outputIsOptionType(schema, context);
    const typeName = isOptionType ? `Option<i8>` : "i8";
    const defaultValue = isOptionType ? `None` : "0";
    return {
        typeName,
        defaultValue,
        isNullable: schema.nullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (isOptionType) {
                return `match ${input} {
                    Some(serde_json::Value::Number(${innerKey})) => match ${innerKey}.as_i64() {
                        Some(${innerKey}_result) => match i8::try_from(${innerKey}_result) {
                            Ok(${innerKey}_result_val) => Some(${innerKey}_result_val),
                            Err(_) => None,
                        },
                        _ => None,
                    },
                    _ => None,
                }`;
            }
            return `match ${input} {
                Some(serde_json::Value::Number(${innerKey})) {
                    i8::try_from(${innerKey}.as_i64().unwrap_or(0)).unwrap_or(0)
                }
                _ => 0,
            }`;
        },
        toJsonTemplate(input, target) {
            return `${target}.push_str(${input}.to_string().as_str())`;
        },
        toQueryStringTemplate(input, key, target) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (context.isOptional) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(format!("${key}={}", ${innerKey}));
                    }
                    _ => {}
                }`;
            }
            if (schema.nullable) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(format!("${key}={}", ${innerKey}));
                    }
                    _ => {
                        ${target}.push("${key}=null".to_string());
                    }
                }`;
            }
            return `${target}.push(format!("${key}={}", ${input}))`;
        },
        content: "",
    };
}
