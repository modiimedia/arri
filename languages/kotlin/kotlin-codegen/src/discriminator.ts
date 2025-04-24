import { type SchemaFormDiscriminator } from '@arrirpc/codegen-utils';

import {
    type CodegenContext,
    getClassName,
    getCodeComment,
    isNullable,
    kotlinIdentifier,
    type KotlinProperty,
} from './_common';
import { kotlinObjectFromSchema } from './object';

export function kotlinDiscriminatorFromSchema(
    schema: SchemaFormDiscriminator,
    context: CodegenContext,
): KotlinProperty {
    const kotlinDiscriminatorKey = kotlinIdentifier(schema.discriminator);
    const className = getClassName(schema, context);
    const prefixedClassName = `${context.typePrefix}${className}`;
    const nullable = isNullable(schema, context);
    const subTypes: {
        typeName: string;
        prefixedTypeName: string;
        discriminatorValue: string;
    }[] = [];
    const subContent: string[] = [];
    for (const key of Object.keys(schema.mapping)) {
        const subSchema = schema.mapping[key]!;
        const subType = kotlinObjectFromSchema(subSchema, {
            typePrefix: context.typePrefix,
            clientName: context.clientName,
            clientVersion: context.clientVersion,
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/mapping/${key}`,
            existingTypeIds: context.existingTypeIds,
            discriminatorKey: schema.discriminator,
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
            return `__logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
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
            return ${subTypes[0]!.prefixedTypeName}.new()
        }

        @JvmStatic
        override fun fromJson(input: String): ${prefixedClassName} {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ${prefixedClassName} {
            if (__input !is JsonObject) {
                __logError("[WARNING] Discriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got \${__input.javaClass}. Initializing empty ${prefixedClassName}.")
                return new()
            }
            return when (__input.jsonObject["${schema.discriminator}"]) {
                is JsonPrimitive -> when (__input.jsonObject["${schema.discriminator}"]!!.jsonPrimitive.contentOrNull) {
                    ${subTypes.map((type) => `"${type.discriminatorValue}" -> ${type.prefixedTypeName}.fromJsonElement(__input, instancePath)`).join('\n')}
                    else -> new()
                }

                else -> new()
            }
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
