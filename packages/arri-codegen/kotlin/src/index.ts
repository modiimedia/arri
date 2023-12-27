import {
    type RpcDefinition,
    camelCase,
    pascalCase,
    type ServiceDefinition,
    isServiceDefinition,
    isRpcDefinition,
} from "arri-codegen-utils";
import {
    isSchemaFormEnum,
    isSchemaFormType,
    type SchemaFormEnum,
    type Schema,
    isSchemaFormProperties,
    type SchemaFormProperties,
    isSchemaFormElements,
    type SchemaFormElements,
    type SchemaFormDiscriminator,
    type SchemaFormValues,
    isSchemaFormValues,
} from "jtd-utils";

export interface ServiceContext {
    clientName: string;
    modelPrefix?: string;
}

// SERVICE GENERATION
export function kotlinServiceFromDef(
    name: string,
    def: ServiceDefinition,
    context: ServiceContext,
): string {
    const subServiceNames: string[] = [];
    const subServiceParts: string[] = [];
    const rpcParts: string[] = [];
    for (const key of Object.keys(def)) {
        const subDef = def[key];
        if (isServiceDefinition(subDef)) {
            const subServiceName = pascalCase(`${name}_${key}`);
            subServiceNames.push(subServiceName);
            subServiceParts.push(
                kotlinServiceFromDef(subServiceName, subDef, context),
            );
            continue;
        }
        if (isRpcDefinition(subDef)) {
            rpcParts.push(
                kotlinRpcFromDef(
                    camelCase(key, { normalize: true }),
                    subDef,
                    context,
                ),
            );
            continue;
        }
    }

    const finalName = pascalCase(`${name}_service`, { normalize: true });
}

// RPC GENERATION
export function kotlinRpcFromDef(
    name: string,
    def: RpcDefinition,
    context: ServiceContext,
): string {
    const paramType = def.params
        ? (pascalCase(`${context.modelPrefix}_${def.params}`, {
              normalize: true,
          }) as string)
        : undefined;
    const returnType = def.response
        ? pascalCase(`${context.modelPrefix}_${def.params}`, {
              normalize: true,
          })
        : undefined;

    if (def.isEventStream) {
        return ``;
    }

    return `    suspend fun ${name}(${
        paramType ? `params: ${paramType}` : ""
    }): ${returnType ?? "Unit"} {
        val response = prepareRequest(
            client = httpClient,
            url = "$baseUrl${def.path}",
            method = HttpMethod.${pascalCase(def.method)},
            params = ${
                paramType ? `JsonInstance.encodeToJsonElements(params)` : "null"
            },
            headers = headers,
        ).execute()
        ${
            returnType
                ? `return JsonInstance.decodeFromString<${returnType}>(response.body())`
                : ""
        }
    }`;
}

// MODEL GENERATION

export interface ModelContext {
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
    hashTemplate: (key: string, nullable: boolean) => string;
}

function defaultComparisonTemplate(key: string) {
    return `        if (${key} != other.${key}) return false`;
}

function defaultHashTemplate(key: string, nullable: boolean) {
    if (nullable) {
        return `(${key}?.hashCode() ?: 0)`;
    }
    return `${key}.hashCode()`;
}

export function kotlinPropertyFromSchema(
    schema: Schema,
    context: ModelContext,
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
            hashTemplate: defaultHashTemplate,
        };
    }

    if (isSchemaFormEnum(schema)) {
        return kotlinEnumFromSchema(schema, context);
    }

    if (isSchemaFormProperties(schema)) {
        return kotlinClassFromSchema(schema, context);
    }

    if (isSchemaFormElements(schema)) {
        return kotlinArrayFromSchema(schema, context);
    }

    if (isSchemaFormValues(schema)) {
        return kotlinMapFromSchema(schema, context);
    }

    return {
        dataType: `JsonElement${schema.nullable ? "?" : ""}`,
        comparisonTemplate: defaultComparisonTemplate,
        hashTemplate: defaultHashTemplate,
    };
}

export function kotlinEnumFromSchema(
    schema: SchemaFormEnum,
    context: ModelContext,
): KotlinProperty {
    const name = pascalCase(
        schema.metadata?.id ?? context.instancePath.split("/").join("_"),
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
    if (!context.generatedTypes.includes(name)) {
        content = `enum class ${name}() {
${parts.join("\n")}
}`;
        context.generatedTypes.push(name);
    }

    return {
        dataType: name,
        content,
        comparisonTemplate: defaultComparisonTemplate,
        hashTemplate: defaultHashTemplate,
    };
}

export function kotlinClassFromSchema(
    schema: SchemaFormProperties,
    options: ModelContext,
): KotlinProperty {
    let name = pascalCase(
        schema.metadata?.id ?? options.instancePath.split("/").join("_"),
        {
            normalize: true,
        },
    );
    const annotationParts = ["@Serializable"];
    if (options.discriminatorKey && options.discriminatorValue) {
        annotationParts.push(`@SerialName("${options.discriminatorValue}")`);
        name = pascalCase(
            schema.metadata?.id ??
                `${options.instancePath.split("/").join("_")}_${
                    options.discriminatorValue
                }`,
            {
                normalize: true,
            },
        );
    }
    const subContentParts: string[] = [];
    const constructorParts: string[] = [];
    const equalsFnParts: string[] = [];
    const hashParts: string[] = [];
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
        if (hashParts.length) {
            hashParts.push(
                `        result = 31 * result + ${prop.hashTemplate(
                    camelCaseKey,
                    propSchema.nullable ?? false,
                )}`,
            );
        } else {
            hashParts.push(
                `        var result = ${prop.hashTemplate(
                    camelCaseKey,
                    propSchema.nullable ?? false,
                )}`,
            );
        }
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
        content = `${annotationParts.join("\n")}
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

    override fun hashCode(): Int {
${hashParts.join("\n")}
        return result
    }
}

${subContentParts.join("\n")}`;
    }

    return {
        dataType: name,
        content,
        comparisonTemplate: defaultComparisonTemplate,
        hashTemplate: defaultHashTemplate,
    };
}

export function kotlinArrayFromSchema(
    schema: SchemaFormElements,
    context: ModelContext,
): KotlinProperty {
    const subType = kotlinPropertyFromSchema(schema.elements, {
        instancePath: `${context.instancePath}/Item`,
        schemaPath: `${context.schemaPath}/elements`,
        generatedTypes: context.generatedTypes,
    });
    const dataType = schema.nullable
        ? `Array<${subType.dataType}>?`
        : `Array<${subType.dataType}>`;
    return {
        dataType,
        content: subType.content,
        comparisonTemplate(key) {
            if (schema.nullable) {
                return `        if (${key}?.contentEquals(other.${key}) != true) return false`;
            }
            return `        if (!${key}.contentEquals(other.${key})) return false`;
        },
        hashTemplate(key, nullable) {
            if (nullable) {
                return `(${key}?.contentHashCode() ?: 0)`;
            }
            return `${key}.contentHashCode()`;
        },
    };
}

export function kotlinSealedClassedFromSchema(
    schema: SchemaFormDiscriminator,
    context: ModelContext,
): KotlinProperty {
    const name = pascalCase(
        schema.metadata?.id ?? context.instancePath.split("/").join("_"),
    );
    const subContentParts: string[] = [];
    for (const discriminatorVal of Object.keys(schema.mapping)) {
        const mappingSchema = schema.mapping[discriminatorVal];
        const mapping = kotlinClassFromSchema(mappingSchema, {
            generatedTypes: context.generatedTypes,
            instancePath: `${context.instancePath}`,
            schemaPath: `${context.schemaPath}/mapping/${discriminatorVal}`,
            discriminatorValue: discriminatorVal,
            discriminatorKey: schema.discriminator,
        });
        if (mapping.content) {
            subContentParts.push(mapping.content);
        }
    }

    let content: string | undefined;
    if (!context.generatedTypes.includes(name)) {
        content = `@Serializable
sealed class ${name}()

${subContentParts.join("\n\n")}`;
    }

    return {
        dataType: name,
        content,
        comparisonTemplate: defaultComparisonTemplate,
        hashTemplate: defaultHashTemplate,
    };
}

export function kotlinMapFromSchema(
    schema: SchemaFormValues,
    context: ModelContext,
): KotlinProperty {
    const subType = kotlinPropertyFromSchema(schema.values, {
        instancePath: `${context.instancePath}/Value`,
        schemaPath: `${context.schemaPath}/values`,
        generatedTypes: context.generatedTypes,
    });
    const dataType = `Map<String, ${subType.dataType}>${
        schema.nullable ? "?" : ""
    }`;
    return {
        dataType,
        comparisonTemplate: defaultComparisonTemplate,
        hashTemplate: defaultHashTemplate,
        content: subType.content,
    };
}
