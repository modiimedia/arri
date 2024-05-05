import { type SchemaFormEmpty } from "arri-codegen-utils";
import { isNullable } from "./_common";
import { type CodegenContext, type KotlinProperty } from ".";

export function kotlinAnyFromSchema(
    schema: SchemaFormEmpty,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "JsonNull";
    return {
        typeName: "JsonElement",
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (context.isOptional) {
                return `when (${input}) {
                    null -> null
                    else -> ${input} 
                }`;
            }
            if (schema.nullable) {
                return `when (${input}) {
                    JsonNull -> null
                    null -> null
                    else -> ${input}
                }`;
            }
            return `when (${input}) {
                is JsonElement -> ${input}!!
                else -> JsonNull
            }`;
        },
        toJson(input, target) {
            if (context.isOptional) {
                return `if (${input} != null) {
                    ${target} += JsonInstance.encodeToString(${input})
                }`;
            }
            if (schema.nullable) {
                return `${target} += match (${input}) {
                    null -> "null"
                    else -> JsonInstance.encodeToString(${input})
                }`;
            }
            return `${target} += JsonInstance.encodeToString(${input})`;
        },
        toQueryString() {
            return `System.err.println("[WARNING] any's cannot be serialized to query params. Skipping field at ${context.instancePath}")`;
        },
        content: "",
    };
}
