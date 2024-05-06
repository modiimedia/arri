import { type SchemaFormElements } from "arri-codegen-utils";
import {
    isNullable,
    type CodegenContext,
    type KotlinProperty,
} from "./_common";
import { kotlinTypeFromSchema } from "./_index";

export function kotlinArrayFromSchema(
    schema: SchemaFormElements,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? "null" : "mutableListOf()";
    const subType = kotlinTypeFromSchema(schema.elements, {
        modelPrefix: context.modelPrefix,
        clientName: context.clientName,
        clientVersion: context.clientVersion,
        instancePath: `${context.instancePath}/[element]`,
        schemaPath: `${context.schemaPath}/elements`,
        existingTypeIds: context.existingTypeIds,
    });
    const typeName = `MutableList<${subType.typeName}${subType.isNullable ? "?" : ""}>`;
    return {
        typeName,
        isNullable: nullable,
        defaultValue,
        fromJson(input) {
            if (nullable) {
                return `when (${input}) {
                    is JsonArray -> {
                        val __value: ${typeName} = mutableListOf()
                        for (__element in ${input}!!.jsonArray) {
                            __value.add(
                                ${subType.fromJson("__element")}
                            )
                        }
                        __value
                    }

                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonArray -> {
                    val __value: ${typeName} = mutableListOf()
                    for (__element in ${input}!!.jsonArray) {
                        __value.add(
                            ${subType.fromJson("__element")}
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }`;
        },
        toJson(input, target) {
            if (schema.nullable) {
                return `if (${input} == null) {
                    ${target} += "null"
                } else {
                    ${target} += "["
                    for ((__index, __element) in ${input}.withIndex()) {
                        if (__index != 0) {
                            ${target} += ","
                        }
                        ${subType.toJson("__element", target)}
                    }
                    ${target} += "]"
                }`;
            }
            return `${target} += "["
                for ((__index, __element) in ${input}.withIndex()) {
                    if (__index != 0) {
                        ${target} += ","
                    }
                    ${subType.toJson("__element", target)}
                }
                ${target} += "]"`;
        },
        toQueryString() {
            return `__logError("[WARNING] arrays cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: subType.content,
    };
}
