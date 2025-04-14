import { type SchemaFormProperties } from '@arrirpc/codegen-utils';

import {
    type CodegenContext,
    getClassName,
    getCodeComment,
    isNullable,
    kotlinIdentifier,
    type KotlinProperty,
} from './_common';
import { kotlinTypeFromSchema } from './_index';

export function kotlinObjectFromSchema(
    schema: SchemaFormProperties,
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
            if (nullable) {
                return `when (${input}) {
                    is JsonObject -> ${prefixedClassName}.fromJsonElement(
                        ${input}!!,
                        "$instancePath/${key}",
                    )
                    else -> null
                }`;
            }
            return `when (${input}) {
                is JsonObject -> ${prefixedClassName}.fromJsonElement(
                    ${input}!!,
                    "$instancePath/${key}",
                )

                else -> ${prefixedClassName}.new()
            }`;
        },
        toJson(input, target) {
            if (schema.isNullable) {
                return `${target} += ${input}?.toJson()`;
            }
            return `${target} += ${input}.toJson()`;
        },
        toQueryString() {
            return `__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: '',
    };
    if (context.existingTypeIds.includes(className)) {
        return result;
    }
    const subContent: string[] = [];
    const kotlinKeys: string[] = [];
    const fieldParts: string[] = [];
    const defaultParts: string[] = [];
    const toJsonParts: string[] = [`var output = "{"`];
    const toQueryParts: string[] = ['val queryParts = mutableListOf<String>()'];
    const fromJsonParts: string[] = [];
    const requiredKeys = Object.keys(schema.properties);
    const optionalKeys = Object.keys(schema.optionalProperties ?? {});
    const hasKnownKeys =
        requiredKeys.length > 0 ||
        (context.discriminatorKey && context.discriminatorValue);
    if (!hasKnownKeys) {
        toJsonParts.push('var hasProperties = false');
    }

    if (context.discriminatorKey && context.discriminatorValue) {
        toJsonParts.push(
            `output += "\\"${context.discriminatorKey}\\":\\"${context.discriminatorValue}\\""`,
        );
        toQueryParts.push(
            `queryParts.add("${context.discriminatorKey}=${context.discriminatorValue}")`,
        );
    }
    for (let i = 0; i < requiredKeys.length; i++) {
        const key = requiredKeys[i]!;
        const kotlinKey = kotlinIdentifier(key);
        kotlinKeys.push(kotlinKey);
        const prop = schema.properties[key]!;
        const type = kotlinTypeFromSchema(prop, {
            typePrefix: context.typePrefix,
            clientName: context.clientName,
            clientVersion: context.clientVersion,
            instancePath: `/${className}/${key}`,
            schemaPath: `${context.schemaPath}/properties/${key}`,
            existingTypeIds: context.existingTypeIds,
        });

        if (type.content) {
            subContent.push(type.content);
        }
        fieldParts.push(
            `${getCodeComment(prop.metadata, '    ', 'field')}    val ${kotlinKey}: ${type.prefixedTypeName}${type.isNullable ? '?' : ''},`,
        );
        if (i === 0 && !context.discriminatorKey) {
            toJsonParts.push(`output += "\\"${key}\\":"`);
        } else {
            toJsonParts.push(`output += ",\\"${key}\\":"`);
        }
        toJsonParts.push(type.toJson(kotlinKey, 'output'));
        toQueryParts.push(type.toQueryString(kotlinKey, 'queryParts', key));
        fromJsonParts.push(
            `val ${kotlinKey}: ${type.prefixedTypeName}${type.isNullable ? '?' : ''} = ${type.fromJson(`__input.jsonObject["${key}"]`, key)}`,
        );
        defaultParts.push(
            `                ${kotlinKey} = ${type.defaultValue},`,
        );
    }

    for (let i = 0; i < optionalKeys.length; i++) {
        const isFirst =
            i === 0 && requiredKeys.length === 0 && !context.discriminatorKey;
        const isLast = i === optionalKeys.length - 1;
        const key = optionalKeys[i]!;
        const kotlinKey = kotlinIdentifier(key);
        kotlinKeys.push(kotlinKey);
        const type = kotlinTypeFromSchema(schema.optionalProperties![key]!, {
            typePrefix: context.typePrefix,
            clientName: context.clientName,
            clientVersion: context.clientVersion,
            instancePath: `/${className}/${key}`,
            schemaPath: `${context.schemaPath}/optionalProperties/${key}`,
            existingTypeIds: context.existingTypeIds,
            isOptional: true,
        });

        if (type.content) {
            subContent.push(type.content);
        }
        const addCommaPart = isFirst
            ? ''
            : `\n        if (hasProperties) output += ","\n`;
        fieldParts.push(
            `${getCodeComment(schema.optionalProperties![key]!.metadata, '    ', 'field')}    val ${kotlinKey}: ${type.prefixedTypeName}? = null,`,
        );
        if (hasKnownKeys) {
            toJsonParts.push(`if (${kotlinKey} != null) {
                output += ",\\"${key}\\":"
                ${type.toJson(kotlinKey, 'output')}
            }`);
        } else {
            toJsonParts.push(`if (${kotlinKey} != null) {${addCommaPart}
    output += "\\"${key}\\":"
    ${type.toJson(kotlinKey, 'output')}
${isLast ? '' : '    hasProperties = true'}\n}`);
        }

        toQueryParts.push(type.toQueryString(kotlinKey, 'queryParts', key));
        fromJsonParts.push(
            `val ${kotlinKey}: ${type.prefixedTypeName}? = ${type.fromJson(`__input.jsonObject["${key}"]`, key)}`,
        );
    }

    toJsonParts.push('output += "}"');
    toJsonParts.push('return output');
    toQueryParts.push('return queryParts.joinToString("&")');
    const implementedClass = context.discriminatorParentId
        ? `${context.typePrefix}${context.discriminatorParentId}`
        : `${context.clientName}Model`;
    let discriminatorField = '';
    if (context.discriminatorKey && context.discriminatorValue) {
        discriminatorField = `\n    override val ${kotlinIdentifier(context.discriminatorKey)} get() = "${context.discriminatorValue}"\n`;
    }
    const hasProperties = fieldParts.length > 0;
    const content = `${getCodeComment(schema.metadata, '', 'class')}data class ${prefixedClassName}(
${fieldParts.join('\n')}${!hasProperties ? '    private val placeholderKey: Short = 0' : ''}
) : ${implementedClass} {${discriminatorField}
    override fun toJson(): String {
${toJsonParts.join('\n')}    
    }

    override fun toUrlQueryParams(): String {
${toQueryParts.join('\n')}
    }

    companion object Factory : ${context.clientName}ModelFactory<${prefixedClassName}> {
        @JvmStatic
        override fun new(): ${prefixedClassName} {
            return ${prefixedClassName}(
${defaultParts.join('\n')}
            )
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
${fromJsonParts.join('\n')}
            return ${prefixedClassName}(
                ${kotlinKeys.join(',\n                ')}${hasProperties ? `,` : ''}
            )
        }
    }
}

${subContent.join('\n\n')}`;
    context.existingTypeIds.push(className);
    return {
        ...result,
        content,
    };
}
