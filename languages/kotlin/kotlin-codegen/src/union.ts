import {
    getUnionFallbackKey,
    isSchemaFormProperties,
    type Schema,
    type SchemaFormProperties,
    type SchemaFormUnion,
} from '@arrirpc/codegen-utils';

import {
    type CodegenContext,
    getClassName,
    getCodeComment,
    indentTail,
    isNullable,
    kotlinClassName,
    kotlinIdentifier,
    type KotlinProperty,
} from './_common';
import { kotlinTypeFromSchema } from './_index';
import { kotlinObjectFromSchema } from './object';

export function kotlinUnionFromSchema(
    schema: SchemaFormUnion,
    context: CodegenContext,
): KotlinProperty {
    if (schema.tagKey && !schema.valueKey) {
        for (const key of Object.keys(schema.union)) {
            if (!isSchemaFormProperties(schema.union[key])) {
                throw new Error(
                    `Error at ${context.schemaPath}/union/${key}: All union variants must be an object when tagKey is specified without a valueKey`,
                );
            }
        }
        return kotlinInternallyTaggedSealedInterface(
            schema,
            schema.tagKey,
            schema.union as Record<string, SchemaFormProperties>,
            'union',
            context,
        );
    }
    return kotlinWrappedUnionFromSchema(schema, context);
}

/**
 * Shared by discriminator schemas and internally tagged union schemas.
 * Each variant becomes a data class that injects the tag into its JSON output.
 */
export function kotlinInternallyTaggedSealedInterface(
    schema: Schema,
    tagKey: string,
    variants: Record<string, SchemaFormProperties>,
    variantsSchemaKey: string,
    context: CodegenContext,
): KotlinProperty {
    const kotlinDiscriminatorKey = kotlinIdentifier(tagKey);
    const className = getClassName(schema, context);
    const prefixedClassName = `${context.typePrefix}${className}`;
    const nullable = isNullable(schema, context);
    const subTypes: {
        typeName: string;
        prefixedTypeName: string;
        discriminatorValue: string;
    }[] = [];
    const subContent: string[] = [];
    for (const key of Object.keys(variants)) {
        const subSchema = variants[key]!;
        const subType = kotlinObjectFromSchema(subSchema, {
            typePrefix: context.typePrefix,
            clientName: context.clientName,
            clientVersion: context.clientVersion,
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/${variantsSchemaKey}/${key}`,
            existingTypeIds: context.existingTypeIds,
            discriminatorKey: tagKey,
            discriminatorValue: key,
            discriminatorParentId: className,
        });
        subTypes.push({
            typeName: subType.typeName,
            prefixedTypeName: subType.prefixedTypeName,
            discriminatorValue: key,
        });
        if (subType.content) {
            subContent.push(subType.content);
        }
    }
    if (subTypes.length === 0) {
        throw new Error('Discriminator schemas must have at least one mapping');
    }
    const fallbackKey = getUnionFallbackKey(variants);
    const fallbackType = subTypes.find(
        (type) => type.discriminatorValue === fallbackKey,
    )!;
    const defaultValue = nullable ? 'null' : `${prefixedClassName}.new()`;
    const result: KotlinProperty = {
        typeName: className,
        prefixedTypeName: prefixedClassName,
        isNullable: nullable,
        defaultValue,
        fromJson(input, key) {
            return `when (${input}) {
    is JsonObject -> ${prefixedClassName}.fromJsonElement(
        ${input}!!,
        "$instancePath/${key}",
    )

    else -> ${defaultValue}
}`;
        },
        toJson(input, target) {
            if (schema.isNullable) {
                return `${target} += ${input}?.toJson()`;
            }
            return `${target} += ${input}.toJson()`;
        },
        toQueryString() {
            return `__logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: '',
    };
    if (context.existingTypeIds.includes(className)) {
        return result;
    }
    const codeComment = getCodeComment(schema.metadata, '', 'class');
    const content = `${codeComment}sealed interface ${prefixedClassName} : ${context.clientName}Model {
    val ${kotlinDiscriminatorKey}: String

    companion object Factory : ${context.clientName}ModelFactory<${prefixedClassName}> {
        @JvmStatic
        override fun new(): ${prefixedClassName} {
            return ${fallbackType.prefixedTypeName}.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ${prefixedClassName} {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ${prefixedClassName} {
            if (__input !is JsonObject) {
                __logError("[WARNING] ${prefixedClassName}.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got \${__input.javaClass}. Initializing empty ${prefixedClassName}.")
                return new()
            }
            return when (__input.jsonObject["${tagKey}"]) {
                is JsonPrimitive -> when (__input.jsonObject["${tagKey}"]!!.jsonPrimitive.contentOrNull) {
                    ${subTypes.map((type) => `"${type.discriminatorValue}" -> ${type.prefixedTypeName}.fromJsonElement(__input, instancePath)`).join('\n                    ')}
                    else -> new()
                }

                else -> new()
            }
        }
    }
}${subContent.length ? `\n\n${subContent.join('\n\n')}` : ''}`;
    context.existingTypeIds.push(className);
    return {
        ...result,
        content,
    };
}

/**
 * Externally tagged unions (no tagKey) and adjacently tagged unions (tagKey + valueKey).
 * Both wrap the variant value in an object, so each variant becomes a data class holding a single value field.
 */
function kotlinWrappedUnionFromSchema(
    schema: SchemaFormUnion,
    context: CodegenContext,
): KotlinProperty {
    const className = getClassName(schema, context);
    const prefixedClassName = `${context.typePrefix}${className}`;
    const nullable = isNullable(schema, context);
    const defaultValue = nullable ? 'null' : `${prefixedClassName}.new()`;
    const result: KotlinProperty = {
        typeName: className,
        prefixedTypeName: prefixedClassName,
        isNullable: nullable,
        defaultValue,
        fromJson(input, key) {
            return `when (${input}) {
    is JsonObject -> ${prefixedClassName}.fromJsonElement(
        ${input}!!,
        "$instancePath/${key}",
    )

    else -> ${defaultValue}
}`;
        },
        toJson(input, target) {
            if (schema.isNullable) {
                return `${target} += ${input}?.toJson()`;
            }
            return `${target} += ${input}.toJson()`;
        },
        toQueryString() {
            return `__logError("[WARNING] nested unions cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: '',
    };
    if (context.existingTypeIds.includes(className)) {
        return result;
    }
    const keys = Object.keys(schema.union);
    if (keys.length === 0) {
        throw new Error(
            `Error at ${context.schemaPath}: Union schemas must have at least one variant`,
        );
    }
    const tagKey = schema.tagKey;
    const tagProp = tagKey ? kotlinIdentifier(tagKey) : undefined;
    const valueKey = schema.valueKey ?? 'value';
    const valueProp = kotlinIdentifier(valueKey);
    const variants: { key: string; prefixedClassName: string }[] = [];
    const variantContent: string[] = [];
    const subContent: string[] = [];
    for (const key of keys) {
        const subSchema = schema.union[key]!;
        const variantClassName = `${context.typePrefix}${kotlinClassName(`${className}_${key}`)}`;
        const valueType = kotlinTypeFromSchema(subSchema, {
            typePrefix: context.typePrefix,
            clientName: context.clientName,
            clientVersion: context.clientVersion,
            instancePath: `/${className}/${key}/${valueKey}`,
            schemaPath: `${context.schemaPath}/union/${key}`,
            existingTypeIds: context.existingTypeIds,
        });
        if (valueType.content) {
            subContent.push(valueType.content);
        }
        variants.push({ key, prefixedClassName: variantClassName });
        // externally tagged unions use the variant key as the JSON key for the value
        const jsonValueKey = tagKey ? valueKey : key;
        const valueTypeName = `${valueType.prefixedTypeName}${valueType.isNullable ? '?' : ''}`;
        const tagField = tagProp
            ? `\n    override val ${tagProp} get() = "${key}"\n`
            : '';
        const toJsonParts = tagProp
            ? [
                  `output += "\\"${tagKey}\\":\\"${key}\\""`,
                  `output += ",\\"${jsonValueKey}\\":"`,
              ]
            : [`output += "\\"${jsonValueKey}\\":"`];
        toJsonParts.push(valueType.toJson(valueProp, 'output'));
        variantContent.push(`data class ${variantClassName}(
    val ${valueProp}: ${valueTypeName},
) : ${prefixedClassName} {${tagField}
    override fun toJson(): String {
        var output = "{"
        ${indentTail(toJsonParts.join('\n'), 8)}
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        __logError("[WARNING] unions cannot be serialized to query params. Skipping ${variantClassName}.")
        return ""
    }

    companion object Factory : ${context.clientName}ModelFactory<${variantClassName}> {
        @JvmStatic
        override fun new(): ${variantClassName} {
            return ${variantClassName}(
                ${valueProp} = ${valueType.defaultValue},
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ${variantClassName} {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ${variantClassName} {
            if (__input !is JsonObject) {
                __logError("[WARNING] ${variantClassName}.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got \${__input.javaClass}. Initializing empty ${variantClassName}.")
                return new()
            }
            val ${valueProp}: ${valueTypeName} = ${indentTail(valueType.fromJson(`__input.jsonObject["${jsonValueKey}"]`, jsonValueKey), 12)}
            return ${variantClassName}(
                ${valueProp},
            )
        }
    }
}`);
    }
    const fallbackKey = getUnionFallbackKey(schema.union);
    const fallbackVariant = variants.find(
        (variant) => variant.key === fallbackKey,
    )!;
    let fromJsonBody: string;
    if (tagKey && tagProp) {
        fromJsonBody = `            return when (__input.jsonObject["${tagKey}"]) {
                is JsonPrimitive -> when (__input.jsonObject["${tagKey}"]!!.jsonPrimitive.contentOrNull) {
                    ${variants.map((variant) => `"${variant.key}" -> ${variant.prefixedClassName}.fromJsonElement(__input, instancePath)`).join('\n                    ')}
                    else -> new()
                }

                else -> new()
            }`;
    } else {
        fromJsonBody = `            return when {
                ${variants.map((variant) => `"${variant.key}" in __input -> ${variant.prefixedClassName}.fromJsonElement(__input, instancePath)`).join('\n                ')}
                else -> new()
            }`;
    }
    const codeComment = getCodeComment(schema.metadata, '', 'class');
    const content = `${codeComment}sealed interface ${prefixedClassName} : ${context.clientName}Model {${tagProp ? `\n    val ${tagProp}: String\n` : ''}
    companion object Factory : ${context.clientName}ModelFactory<${prefixedClassName}> {
        @JvmStatic
        override fun new(): ${prefixedClassName} {
            return ${fallbackVariant.prefixedClassName}.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ${prefixedClassName} {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ${prefixedClassName} {
            if (__input !is JsonObject) {
                __logError("[WARNING] ${prefixedClassName}.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got \${__input.javaClass}. Initializing empty ${prefixedClassName}.")
                return new()
            }
${fromJsonBody}
        }
    }
}

${[...variantContent, ...subContent].join('\n\n')}`;
    context.existingTypeIds.push(className);
    return {
        ...result,
        content,
    };
}
