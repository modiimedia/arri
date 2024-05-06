import { type Schema, type SchemaFormType } from "arri-codegen-utils";
import {
    isNullable,
    type KotlinProperty,
    type CodegenContext,
} from "./_common";

function defaultToQueryString(
    context: CodegenContext,
    input: string,
    target: string,
    key: string,
) {
    if (context.isOptional) {
        return `if (${input} != null) {
            ${target}.add("${key}=$${input}")
        }`;
    }
    return `${target}.add("${key}=$${input}")`;
}

function defaultToJsonString(
    context: CodegenContext,
    input: string,
    target: string,
) {
    return `${target} += ${input}`;
}

export function kotlinStringFromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : '""';
    return {
        typeName: "String",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (nullable) {
                return `when (${input}) {
                    is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull ?: ${defaultValue}
                else -> ${defaultValue}
            }`;
        },
        toJson(input, target) {
            if (schema.nullable) {
                return `${target} += when (${input}) {
                    is String -> buildString { printQuoted(${input}) }
                    else -> "null"
                }`;
            }
            return `buildString { printQuoted(${input}) }`;
        },
        toQueryString(input, target, key) {
            return defaultToQueryString(context, input, target, key);
        },
        content: "",
    };
}

export function kotlinBooleanFromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "false";
    return {
        typeName: "Boolean",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (nullable) {
                return `when (${input}) {
                    is JsonPrimitive -> ${input}!!.jsonPrimitive.booleanOrNull
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonPrimitive -> ${input}!!.jsonPrimitive.booleanOrNull ?: ${defaultValue}
                else -> ${defaultValue}
            }`;
        },
        toJson(input, target) {
            return defaultToJsonString(context, input, target);
        },
        toQueryString(input, target, key) {
            return defaultToQueryString(context, input, target, key);
        },
        content: "",
    };
}

export function kotlinTimestampFromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "Instant.now()";
    return {
        typeName: "Instant",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            return `when (${input}) {
                is JsonPrimitive ->
                    if (${input}!!.jsonPrimitive.isString)
                        Instant.parse(${input}!!.jsonPrimitive.content)
                    else
                        ${defaultValue}
                else -> ${defaultValue}
            }`;
        },
        toJson(input, target) {
            if (schema.nullable) {
                return `${target} += when (${input}) {
                    is Instant -> "\\"\${timestampFormatter.format(${input})}\\""
                    else -> "null"
                }`;
            }
            return `${target} += "\\"\${timestampFormatter.format(${input})}\\""`;
        },
        toQueryString(input, target, key) {
            if (context.isOptional) {
                return `if (${input} != null) {
                    ${target}.add(
                        "${key}=\${
                            timestampFormatter.format(${input})
                        }"
                )
            }`;
            }
            if (schema.nullable) {
                return `${target}.add(
                    "${key}=\${
                        when (${input}) {
                            is Instant -> timestampFormatter.format(${input})
                            else -> "null"
                        }
                    }"
        )`;
            }
            return `${target}.add(
                "${key}=\${
                    timestampFormatter.format(${input})
                }"
        )`;
        },
        content: "",
    };
}

export function kotlinFloat32FromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "0.0F";
    return {
        typeName: "Float",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (nullable) {
                return `when (${input}) {
                    is JsonPrimitive -> ${input}!!.jsonPrimitive.floatOrNull
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonPrimitive -> ${input}!!.jsonPrimitive.floatOrNull ?: ${defaultValue}
                else -> ${defaultValue}
            }`;
        },
        toJson(input, target) {
            return defaultToJsonString(context, input, target);
        },
        toQueryString(input, target, key) {
            return defaultToQueryString(context, input, target, key);
        },
        content: "",
    };
}

export function kotlinFloat64FromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "0.0";
    return {
        typeName: "Double",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (nullable) {
                return `when (${input}) {
                    is JsonPrimitive -> ${input}!!.jsonPrimitive.doubleOrNull
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonPrimitive -> ${input}!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }`;
        },
        toJson(input, target) {
            return defaultToJsonString(context, input, target);
        },
        toQueryString(input, target, key) {
            return defaultToQueryString(context, input, target, key);
        },
        content: "",
    };
}

export function kotlinInt8FromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "0";
    return {
        typeName: "Byte",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (nullable) {
                return `when (${input}) {
                    is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull?.toByteOrNull()
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull?.toByteOrNull() ?: 0
                else -> 0
            }`;
        },
        toJson(input, target) {
            return defaultToJsonString(context, input, target);
        },
        toQueryString(input, target, key) {
            return defaultToQueryString(context, input, target, key);
        },
        content: "",
    };
}

export function kotlinInt16FromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "0";
    return {
        typeName: "Short",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (nullable) {
                return `when (${input}) {
                    is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull?.toShortOrNull()
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull?.toShortOrNull() ?: 0
                else -> 0
            }`;
        },
        toJson(input, target) {
            return defaultToJsonString(context, input, target);
        },
        toQueryString(input, target, key) {
            return defaultToQueryString(context, input, target, key);
        },
        content: "",
    };
}

export function kotlinInt32FromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "0";
    return {
        typeName: "Int",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (nullable) {
                return `when (${input}) {
                    is JsonPrimitive -> ${input}!!.jsonPrimitive.intOrNull
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonPrimitive -> ${input}!!.jsonPrimitive.intOrNull ?: 0
                else -> 0
            }`;
        },
        toJson(input, target) {
            return defaultToJsonString(context, input, target);
        },
        toQueryString(input, target, key) {
            return defaultToQueryString(context, input, target, key);
        },
        content: "",
    };
}

export function kotlinInt64FromSchema(
    schema: Schema,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "0L";
    return {
        typeName: "Long",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (nullable) {
                return `when (${input}) {
                    is JsonPrimitive -> ${input}!!.jsonPrimitive.longOrNull
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonPrimitive -> ${input}!!.jsonPrimitive.longOrNull ?: 0L
                else -> 0L
            }`;
        },
        toJson(input, target) {
            if (schema.nullable) {
                return `${target} += when (${input}) {
                    is Long -> "\\"$${input}\\""
                    else -> "null"
                }`;
            }
            return `${target} += "\\"$${input}\\""`;
        },
        toQueryString(input, target, key) {
            return defaultToQueryString(context, input, target, key);
        },
        content: "",
    };
}

export function kotlinUint8FromSchema(
    schema: Schema,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "0u";
    return {
        typeName: "UByte",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (nullable) {
                return `when (${input}) {
                    is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull?.toUByteOrNull()
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull?.toUByteOrNull() ?: 0u
                else -> 0u
            }`;
        },
        toJson(input, target) {
            return defaultToJsonString(context, input, target);
        },
        toQueryString(input, target, key) {
            return defaultToQueryString(context, input, target, key);
        },
        content: "",
    };
}

export function kotlinUint16FromSchema(
    schema: Schema,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "0u";
    return {
        typeName: "UShort",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (nullable) {
                return `when (${input}) {
                    is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull?.toUShortOrNull()
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull?.toUShortOrNull() ?: 0u
                else -> 0u
            }`;
        },
        toJson(input, target) {
            return defaultToJsonString(context, input, target);
        },
        toQueryString(input, target, key) {
            return defaultToQueryString(context, input, target, key);
        },
        content: "",
    };
}

export function kotlinUint32FromSchema(
    schema: Schema,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "0u";
    return {
        typeName: "UInt",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (nullable) {
                return `when (${input}) {
                    is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull?.toUIntOrNull()
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull?.toUIntOrNull() ?: 0u
                else -> 0u
            }`;
        },
        toJson(input, target) {
            return defaultToJsonString(context, input, target);
        },
        toQueryString(input, target, key) {
            return defaultToQueryString(context, input, target, key);
        },
        content: "",
    };
}

export function kotlinUint64FromSchema(
    schema: Schema,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "0UL";
    return {
        typeName: "ULong",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (nullable) {
                return `when (${input}) {
                    is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull?.toULongOrNull()
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonPrimitive -> ${input}!!.jsonPrimitive.contentOrNull?.toULongOrNull() ?: 0UL
                else -> 0UL
            }`;
        },
        toJson(input, target) {
            if (schema.nullable) {
                return `${target} += when (${input}) {
                    is ULong -> "\\"$${input}\\""
                    else -> "null"
                }`;
            }
            return `${target} += "\\"${input}\\""`;
        },
        toQueryString(input, target, key) {
            return defaultToQueryString(context, input, target, key);
        },
        content: "",
    };
}
