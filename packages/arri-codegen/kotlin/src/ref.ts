import { type SchemaFormRef } from "arri-codegen-utils";
import {
    isNullable,
    kotlinClassName,
    type CodegenContext,
    type KotlinProperty,
} from "./_common";

export function kotlinRefFromSchema(
    schema: SchemaFormRef,
    context: CodegenContext,
): KotlinProperty {
    const typeName = kotlinClassName(schema.ref);
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : `${typeName}.new()`;
    return {
        typeName,
        isNullable: nullable,
        defaultValue,
        fromJson(input, key) {
            return `when (${input}) {
                is JsonElement -> ${typeName}.fromJsonElement(
                    ${input}!!,
                    "$instancePath/${key}",
                )
                else -> ${defaultValue}
            }`;
        },
        toJson(input, target) {
            if (schema.nullable) {
                return `${target} += ${input}?.toJson()`;
            }
            return `${target} += ${input}.toJson()`;
        },
        toQueryString() {
            return `System.err.println("[WARNING] nested objects cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: "",
    };
}
