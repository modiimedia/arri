import { camelCase, pascalCase } from "arri-codegen-utils";
import {
    isSchemaFormEnum,
    isSchemaFormType,
    type SchemaFormEnum,
    type Schema,
    isSchemaFormProperties,
    type SchemaFormProperties,
} from "jtd-utils";

export interface Context {
    generatedTypes: string[];
    instancePath: string;
    schemaPath: string;
    discriminatorKey?: string;
    discriminatorValue?: string;
}

export interface KotlinProperty {
    dataType: string;
    annotation?: string;
    content?: string;
    comparisonTemplate: (key: string) => string;
}

function defaultComparisonTemplate(key: string) {
    return `        if (${key} != other?.${key}) return false`;
}

export function kotlinPropertyFromSchema(
    schema: Schema,
    options: Context,
): KotlinProperty {
    if (isSchemaFormType(schema)) {
        let dataType = "";
        let annotation: undefined | string;
        switch (schema.type) {
            case "string":
                dataType = "String";
                break;
            case "boolean":
                dataType = "Boolean";
                break;
            case "float32":
                dataType = "Float";
                break;
            case "float64":
                dataType = "Double";
                break;
            case "int8":
                dataType = "Byte";
                break;
            case "int16":
                dataType = "Short";
                break;
            case "int32":
                dataType = "Int";
                break;
            case "int64":
                dataType = "Long";
                break;
            case "timestamp":
                dataType = "Instant";
                annotation =
                    "@Serializable(with = InstantAsStringSerializer::class)";
                break;
            case "uint8":
                dataType = "UByte";
                break;
            case "uint16":
                dataType = "UShort";
                break;
            case "uint32":
                dataType = "UInt";
                break;
            case "uint64":
                dataType = "ULong";
                break;
        }
        return {
            dataType: `${dataType}${schema.nullable ? "?" : ""}`,
            annotation,
            comparisonTemplate: defaultComparisonTemplate,
        };
    }

    if (isSchemaFormEnum(schema)) {
        return kotlinEnumFromSchema(schema, options);
    }

    if (isSchemaFormProperties(schema)) {
        return kotlinClassFromSchema(schema, options);
    }

    return {
        dataType: `JsonElement${schema.nullable ? "?" : ""}`,
        comparisonTemplate: defaultComparisonTemplate,
    };
}

export function kotlinEnumFromSchema(
    schema: SchemaFormEnum,
    options: Context,
): KotlinProperty {
    const name = pascalCase(
        schema.metadata?.id ?? options.instancePath.split(".").join("_"),
    );
    const parts: string[] = [];
    for (const opt of schema.enum) {
        parts.push(
            `    @SerialName("${opt}")\n    ${pascalCase(opt, {
                normalize: true,
            })},`,
        );
    }
    let content: string | undefined;
    if (!options.generatedTypes.includes(name)) {
        content = `enum class ${name}() {
${parts.join("\n")}
}`;
        options.generatedTypes.push(name);
    }

    return {
        dataType: name,
        content,
        comparisonTemplate: defaultComparisonTemplate,
    };
}

export function kotlinClassFromSchema(
    schema: SchemaFormProperties,
    options: Context,
): KotlinProperty {
    const name = pascalCase(
        schema.metadata?.id ?? options.instancePath.split(".").join("_"),
    );
    const subContentParts: string[] = [];
    const constructorParts: string[] = [];
    const equalsFnParts: string[] = [];
    for (const key of Object.keys(schema.properties)) {
        const camelCaseKey = camelCase(key);
        const propSchema = schema.properties[key];
        const prop = kotlinPropertyFromSchema(propSchema, {
            instancePath: `${options.instancePath}/${key}`,
            schemaPath: `${options.schemaPath}/properties/${key}`,
            generatedTypes: options.generatedTypes,
        });
        const annotations: string[] = [];
        if (prop.annotation) {
            annotations.push(`    ${prop.annotation}`);
        }
        if (camelCaseKey !== key) {
            annotations.push(`    @SerialName("${key}")`);
        }
        if (annotations.length) {
            constructorParts.push(
                `${annotations.join("\n")}\n    val ${camelCaseKey}: ${
                    prop.dataType
                },`,
            );
        } else {
            constructorParts.push(`    val ${camelCaseKey}: ${prop.dataType},`);
        }
        equalsFnParts.push(prop.comparisonTemplate(camelCaseKey));
        if (prop.content) {
            subContentParts.push(prop.content);
        }
    }
    if (schema.optionalProperties) {
        for (const key of Object.keys(schema.optionalProperties)) {
            const camelCaseKey = camelCase(key);
            const propSchema = schema.optionalProperties[key];
            const prop = kotlinPropertyFromSchema(propSchema, {
                instancePath: `${options.instancePath}/${key}`,
                schemaPath: `${options.schemaPath}/properties/${key}`,
                generatedTypes: options.generatedTypes,
            });
            const annotations: string[] = [];
            if (prop.annotation) {
                annotations.push(`    ${prop.annotation}`);
            }
            if (key !== camelCaseKey) {
                annotations.push(`    @SerialName("${key}")`);
            }
            const finalType = prop.dataType.endsWith("?")
                ? prop.dataType
                : `${prop.dataType}?`;
            if (annotations.length) {
                constructorParts.push(
                    `${annotations.join(
                        "\n",
                    )}\n    val ${camelCaseKey}: ${finalType} = null,`,
                );
            } else {
                constructorParts.push(
                    `    val ${camelCaseKey}: ${finalType} = null,`,
                );
            }
            equalsFnParts.push(prop.comparisonTemplate(camelCaseKey));
            if (prop.content) {
                subContentParts.push(prop.content);
            }
        }
    }
    let content: string | undefined;
    if (!options.generatedTypes.includes(name)) {
        content = `@Serializable
data class ${name}(
${constructorParts.join("\n")}
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ${name}

${equalsFnParts.join("\n")}

        return true
    }
}

${subContentParts.join("\n")}`;
    }

    return {
        dataType: name,
        content,
        comparisonTemplate: defaultComparisonTemplate,
    };
}
