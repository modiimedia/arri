import { pascalCase, type SchemaFormEnum } from '@arrirpc/codegen-utils';

import {
    type CodegenContext,
    getClassName,
    isNullable,
    type KotlinProperty,
} from './_common';

export function kotlinEnumFromSchema(
    schema: SchemaFormEnum,
    context: CodegenContext,
): KotlinProperty {
    const nullable = isNullable(schema, context);
    const className = getClassName(schema, context);
    const prefixedClassName = `${context.typePrefix}${className}`;
    const enumItems = schema.enum.map((val) => {
        return {
            name: pascalCase(val, { normalize: true }),
            value: val,
        };
    });
    if (!enumItems.length) {
        throw new Error(
            `Enum schemas must have at least one enum value. At ${context.schemaPath}.`,
        );
    }
    const defaultValue = nullable ? 'null' : `${prefixedClassName}.new()`;
    let content = '';
    if (!context.existingTypeIds.includes(className)) {
        content = `enum class ${prefixedClassName} {
    ${enumItems.map((item) => item.name).join(',\n    ')};
    val serialValue: String
        get() = when (this) {
            ${enumItems.map((item) => `${item.name} -> "${item.value}"`).join('\n            ')}
        }
    
    companion object Factory : ${context.clientName}ModelFactory<${prefixedClassName}> {
        @JvmStatic
        override fun new(): ${prefixedClassName} {
            return ${enumItems[0]!.name}
        }

        @JvmStatic
        override fun fromJson(input: String): ${prefixedClassName} {
            return when (input) {
                ${enumItems.map((item) => `${item.name}.serialValue -> ${item.name}`).join('\n                ')}
                else -> ${enumItems[0]!.name}
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ${prefixedClassName} {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] ${prefixedClassName}.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got \${__input.javaClass}. Initializing empty ${prefixedClassName}.")
                return new()
            }
            return when (__input.jsonPrimitive.contentOrNull) {
                ${enumItems.map((item) => `"${item.value}" -> ${item.name}`).join('\n                ')}
                else -> new()
            }
        }
    }
}`;
        context.existingTypeIds.push(className);
    }
    return {
        typeName: className,
        prefixedTypeName: prefixedClassName,
        isNullable: nullable,
        defaultValue,
        fromJson(input, key) {
            if (nullable) {
                return `when (${input}) {
                    is JsonNull -> null
                    is JsonPrimitive -> ${prefixedClassName}.fromJsonElement(${input}!!, "$instancePath/${key ?? ''}")
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonNull -> ${defaultValue}
                is JsonPrimitive -> ${prefixedClassName}.fromJsonElement(${input}!!, "$instancePath/${key}")
                else -> ${defaultValue}
            }`;
        },
        toJson(input, target) {
            if (schema.nullable) {
                return `${target} += when (${input}) {
                    is ${prefixedClassName} -> "\\"\${${input}.serialValue}\\""
                    else -> "null"
                }`;
            }
            return `${target} += "\\"\${${input}.serialValue}\\""`;
        },
        toQueryString(input, target, key) {
            if (context.isOptional) {
                return `if (${input} != null) {
                    ${target}.add("${key}=\${${input}.serialValue}")
                }`;
            }
            if (schema.nullable) {
                return `${target}.add("${key}=\${${input}?.serialValue}")`;
            }
            return `${target}.add("${key}=\${${input}.serialValue}")`;
        },
        content,
    };
}
