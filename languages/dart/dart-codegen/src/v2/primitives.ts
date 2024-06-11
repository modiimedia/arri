import { SchemaFormType } from "@arrirpc/codegen-utils";

import { CodegenContext, DartProperty, outputIsNullable } from "./_common";

export function dartStringFromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const typeName = isNullable ? `String?` : "String";
    const defaultValue = isNullable ? "null" : '""';
    return {
        typeName,
        isNullable,
        defaultValue,
        fromJson(input, _key) {
            if (isNullable) {
                return `nullableTypeFromDynamic<String>(${input})`;
            }
            return `typeFromDynamic<String>(${input}, "")`;
        },
        toJson(input, _target, _key) {
            return input;
        },
        toQueryString(input, target, key) {
            if (context.isOptional) {
                return `if (${input} != null) ${target}.add("${key}=$${input}")`;
            }
            return `${target}.add("${key}=$${input}")`;
        },
        content: "",
    };
}

export function dartBoolFromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const typeName = isNullable ? "bool?" : "bool";
    const defaultValue = isNullable ? "null" : "false";
    return {
        typeName,
        isNullable,
        defaultValue,
        fromJson(input, _key) {
            if (isNullable) {
                return `nullableTypeFromDynamic<bool>(${input})`;
            }
            return `typeFromDynamic<bool>(${input}, false)`;
        },
        toJson(input, _target, _key) {
            return input;
        },
        toQueryString(input, target, key) {
            if (context.isOptional) {
                return `if (${input} != null) ${target}.add("${key}=$${input}")`;
            }
            return `${target}.add("${key}=$${input}")`;
        },
        content: "",
    };
}

export function dartDateTimeFromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const typeName = isNullable ? "DateTime?" : "DateTime";
    const defaultValue = isNullable ? "null" : "DateTime.now()";
    return {
        typeName,
        isNullable,
        defaultValue,
        fromJson(input, _key) {
            if (isNullable) {
                return `nullableDateTimeFromDynamic(${input})`;
            }
            return `dateTimeFromDynamic(${input}, DateTime.now())`;
        },
        toJson(input, _target, _key) {
            if (context.isOptional) {
                // the null check will happen at the object level
                return `${input}!.toIso8601String()`;
            }
            if (schema.nullable) {
                return `${input}?.toIso8601String()`;
            }
            return `${input}.toIso8601String()`;
        },
        toQueryString(input, target, key) {
            if (context.isOptional) {
                return `if (${input} != null) ${target}.add("${key}=\${${input}!.toIso8601String()}")`;
            }
            if (schema.nullable) {
                return `${target}.add("${key}=\${${input}?.toIso8601String()}")`;
            }
            return `${target}.add("${key}=\${${input}.toIso8601String()}")`;
        },
        content: "",
    };
}

export function dartDoubleFromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const typeName = isNullable ? "double?" : "double";
    const defaultValue = isNullable ? "null" : "0.0";
    return {
        typeName,
        isNullable,
        defaultValue,
        fromJson(input, _key) {
            if (isNullable) {
                return `nullableTypeFromDynamic<double>(${input})`;
            }
            return `typeFromDynamic<double>(${input}, 0.0)`;
        },
        toJson(input, _, __) {
            return input;
        },
        toQueryString(input, target, key) {
            if (context.isOptional) {
                return `if (${input} != null) ${target}.add("${key}=$${input}")`;
            }
            return `${target}.add("${key}=$${input}")`;
        },
        content: "",
    };
}

export function dartIntFromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const typeName = isNullable ? "int?" : "int";
    const defaultValue = isNullable ? "null" : "0";
    return {
        typeName,
        isNullable,
        defaultValue,
        fromJson(input, _key) {
            if (isNullable) {
                return `nullableTypeFromDynamic<int>(${input})`;
            }
            return `typeFromDynamic<int>(${input}, 0)`;
        },
        toJson(input) {
            return input;
        },
        toQueryString(input, target, key) {
            if (context.isOptional) {
                return `if (${input} != null) ${target}.add("${key}=$${input}")`;
            }
            return `${target}.add("${key}=$${input}")`;
        },
        content: "",
    };
}

export function dartBigIntFromSchema(
    schema: SchemaFormType,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const typeName = isNullable ? "BigInt?" : "BigInt";
    const defaultValue = isNullable ? "null" : "BigInt.zero";
    return {
        typeName,
        isNullable,
        defaultValue,
        fromJson(input, _key) {
            if (isNullable) {
                return `nullableBigIntFromDynamic(${input})`;
            }
            return `bigIntFromDynamic(${input}, BigInt.zero)`;
        },
        toJson(input, _target, _key) {
            if (context.isOptional) {
                return `${input}!.toString()`;
            }
            if (schema.nullable) {
                return `${input}?.toString()`;
            }
            return `${input}.toString()`;
        },
        toQueryString(input, target, key) {
            if (context.isOptional) {
                return `if (${input} != null) ${target}.add("${key}=$${input}")`;
            }
            return `${target}.add("${key}=$${input}")`;
        },
        content: "",
    };
}
