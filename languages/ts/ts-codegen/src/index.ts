import {
    type AppDefinition,
    camelCase,
    defineClientGeneratorPlugin,
    type HttpRpcDefinition,
    isRpcDefinition,
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormType,
    isSchemaFormValues,
    isServiceDefinition,
    pascalCase,
    type RpcDefinition,
    type Schema,
    type SchemaFormDiscriminator,
    type SchemaFormElements,
    type SchemaFormEnum,
    type SchemaFormProperties,
    type SchemaFormRef,
    type SchemaFormType,
    type SchemaFormValues,
    type ServiceDefinition,
    unflattenProcedures,
    type WsRpcDefinition,
} from "@arrirpc/codegen-utils";
import {
    getSchemaParsingCode,
    getSchemaSerializationCode,
} from "@arrirpc/schema";
import { writeFileSync } from "fs";
import prettier from "prettier";

interface GeneratorOptions {
    clientName: string;
    outputFile: string;
    prettierOptions?: Omit<prettier.Config, "parser">;
}

export const typescriptClientGenerator = defineClientGeneratorPlugin(
    (options: GeneratorOptions) => ({
        generator: async (def) => {
            if (!options.clientName) {
                throw new Error("Name is requires");
            }
            if (!options.outputFile) {
                throw new Error("No output file specified");
            }
            if (Object.keys(def.procedures).length <= 0) {
                console.warn(
                    `No procedures defined in AppDefinition. Only data models will be outputted.`,
                );
            }
            const result = await createTypescriptClient(def, options);
            writeFileSync(options.outputFile, result);
        },
        options,
    }),
);

export async function createTypescriptClient(
    def: AppDefinition,
    options: GeneratorOptions,
): Promise<string> {
    const clientName = pascalCase(options.clientName);
    const services = unflattenProcedures(def.procedures);
    const serviceFieldParts: string[] = [];
    const serviceInitializationParts: string[] = [];
    const procedureParts: string[] = [];
    const subContentParts: string[] = [];
    const existingTypeNames: string[] = [];
    const rpcOptions: RpcOptions = {
        ...options,
        versionNumber: def.info?.version ?? "",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        typesNeedingParser: Object.keys(def.definitions),
        hasSseProcedures: false,
        hasWsProcedures: false,
    };
    Object.keys(services).forEach((key) => {
        const item = services[key];
        if (isRpcDefinition(item)) {
            const rpc = tsRpcFromDefinition(key, item, rpcOptions);
            if (rpc) {
                procedureParts.push(rpc);
            }
            return;
        }
        if (isServiceDefinition(item)) {
            const serviceName: string = pascalCase(`${clientName}_${key}`);
            const service = tsServiceFromDefinition(
                serviceName,
                item,
                rpcOptions,
            );
            serviceFieldParts.push(`${key}: ${serviceName}Service;`);
            serviceInitializationParts.push(
                `this.${key} = new ${serviceName}Service(options);`,
            );
            subContentParts.push(service);
            // todo
        }
    });
    for (const key of rpcOptions.typesNeedingParser) {
        const schema = def.definitions[key];
        if (
            isSchemaFormProperties(schema) ||
            isSchemaFormDiscriminator(schema)
        ) {
            const type = tsTypeFromJtdSchema(key, schema, rpcOptions, {
                isOptional: false,
                existingTypeNames,
            });
            subContentParts.push(type.content);
        }
    }
    const importParts: string[] = ["arriRequest"];
    if (rpcOptions.hasSseProcedures) {
        importParts.push("arriSseRequest");
        importParts.push("type SseOptions");
        importParts.push("type EventSourceController");
    }
    if (rpcOptions.hasWsProcedures) {
        importParts.push("arriWsRequest");
        importParts.push("type WsOptions");
    }

    // generated only types if no procedures are found
    if (procedureParts.length === 0 && serviceFieldParts.length === 0) {
        const result = `/* eslint-disable */
// @ts-nocheck
// this file was autogenerated by arri-codegen-ts

${subContentParts.join("\n")}`;
        return prettier.format(result, {
            parser: "typescript",
            ...options.prettierOptions,
        });
    }
    const result = `/* eslint-disable */
// @ts-nocheck
// this file was autogenerated by arri-codegen-ts
import { ${importParts.join(", ")} } from '@arrirpc/client';
    
interface ${clientName}Options {
    baseUrl?: string;
    headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
}

export class ${clientName} {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>)
    private readonly clientVersion = '${rpcOptions.versionNumber}';
    ${serviceFieldParts.join("\n    ")}

    constructor(options: ${clientName}Options = {}) {
        this.baseUrl = options.baseUrl ?? "";
        this.headers = options.headers ?? {};
        ${serviceInitializationParts.join(";\n        ")}
    }
    ${procedureParts.join("\n    ")}
}

${subContentParts.join("\n")}
`;
    return await prettier.format(result, {
        parser: "typescript",
        ...options.prettierOptions,
    });
}

interface RpcOptions extends GeneratorOptions {
    versionNumber: string;
    typesNeedingParser: string[];
    hasSseProcedures: boolean;
    hasWsProcedures: boolean;
}

export function tsRpcFromDefinition(
    key: string,
    schema: RpcDefinition,
    options: RpcOptions,
): string {
    if (schema.transport === "http") {
        return tsHttpRpcFromDefinition(key, schema, options);
    }
    if (schema.transport === "ws") {
        return tsWsRpcFromDefinition(key, schema, options);
    }
    console.warn(
        `[codegen-ts] Unsupported transport "${schema.transport}". Ignoring rpc.`,
    );
    return "";
}

export function tsHttpRpcFromDefinition(
    key: string,
    schema: HttpRpcDefinition,
    options: RpcOptions,
) {
    const paramName = pascalCase(schema.params ?? "");
    const responseName = pascalCase(schema.response ?? "");
    const paramsInput = schema.params ? `params: ${paramName}` : "";
    const hasInput = paramName.length > 0;
    const hasOutput = responseName.length > 0;
    let serializerPart = `(_) => {}`;
    let parserPart = `(_) => {}`;
    if (hasInput) {
        serializerPart = `$$${paramName}.serialize`;
    }
    if (hasOutput) {
        parserPart = `$$${responseName}.parse`;
    }
    const paramsOutput = hasInput ? `params` : `params: undefined`;
    if (schema.isEventStream) {
        options.hasSseProcedures = true;
        return `${getJsDocComment({ isDeprecated: schema.isDeprecated, description: schema.description })}${key}(${
            paramsInput.length ? `${paramsInput}, ` : ""
        }options: SseOptions<${schema.response ?? "undefined"}>): EventSourceController {
            return arriSseRequest<${schema.response ?? "undefined"}, ${
                schema.params ?? "undefined"
            }>({
                url: \`\${this.baseUrl}${schema.path}\`,
                method: "${schema.method}",
                headers: this.headers,
                ${paramsOutput},
                parser: ${parserPart},
                serializer: ${serializerPart},
                clientVersion: this.clientVersion,
            }, options);
        }`;
    }
    return `${getJsDocComment({ isDeprecated: schema.isDeprecated, description: schema.description })}${key}(${paramsInput}) {
        return arriRequest<${schema.response ?? "undefined"}, ${
            schema.params ?? "undefined"
        }>({
            url: \`\${this.baseUrl}${schema.path}\`,
            method: "${schema.method}",
            headers: this.headers,
            ${paramsOutput},
            parser: ${parserPart},
            serializer: ${serializerPart},
            clientVersion: this.clientVersion,
        });
    }`;
}
export function tsWsRpcFromDefinition(
    key: string,
    schema: WsRpcDefinition,
    options: RpcOptions,
): string {
    options.hasWsProcedures = true;
    const paramName = schema.params ? pascalCase(schema.params) : "undefined";
    const responseName = schema.response
        ? pascalCase(schema.response)
        : "undefined";
    const hasInput = paramName.length > 0 && paramName !== "undefined";
    const hasOutput = responseName.length > 0 && paramName !== "undefined";
    let serializerPart = `(_) => {}`;
    let parserPart = `(_) => {}`;
    if (hasInput) {
        serializerPart = `$$${paramName}.serialize`;
    }
    if (hasOutput) {
        parserPart = `$$${responseName}.parse`;
    }
    return `${getJsDocComment(schema)}${key}(options: WsOptions<${responseName}> = {}) {
        return arriWsRequest<${paramName}, ${responseName}>({
            url: \`\${this.baseUrl}${schema.path}\`,
            headers: this.headers,
            parser: ${parserPart},
            serializer: ${serializerPart},
            onOpen: options.onOpen,
            onClose: options.onClose,
            onError: options.onError,
            onConnectionError: options.onConnectionError,
            onMessage: options.onMessage,
            clientVersion: this.clientVersion,
        })
    }`;
}

export function tsServiceFromDefinition(
    name: string,
    schema: ServiceDefinition,
    options: RpcOptions,
): string {
    const serviceFieldParts: string[] = [];
    const serviceInitParts: string[] = [];
    const serviceConstructorParts: string[] = [];
    const subServiceContent: string[] = [];
    const rpcContent: string[] = [];

    Object.keys(schema).forEach((key) => {
        const def = schema[key];
        if (isRpcDefinition(def)) {
            const rpc = tsRpcFromDefinition(key, def, options);
            if (rpc) {
                rpcContent.push(rpc);
            }
            return;
        }
        if (isServiceDefinition(def)) {
            const serviceName: string = pascalCase(`${name}_${key}`);
            const service = tsServiceFromDefinition(serviceName, def, options);
            serviceFieldParts.push(`${key}: ${serviceName}Service;`);
            serviceInitParts.push(`this.${key}.initClient(options);`);

            serviceConstructorParts.push(
                `this.${key} = new ${serviceName}Service(options);`,
            );
            subServiceContent.push(service);
        }
    });

    return `export class ${name}Service {
        private readonly baseUrl: string;
        private readonly headers: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
        private readonly clientVersion = '${options.versionNumber}';
        ${serviceFieldParts.join("\n    ")}

        constructor(options: ${pascalCase(
            `${options.clientName}_Options`,
        )} = {}) {
            this.baseUrl = options.baseUrl ?? '';
            this.headers = options.headers ?? {};
            ${serviceConstructorParts.join("\n        ")}
        }
        ${rpcContent.join("\n    ")}
    }
    ${subServiceContent.join("\n")}`;
}

interface AdditionalOptions {
    isOptional: boolean;
    existingTypeNames: string[];
    logDef?: boolean;
}

interface TsProperty {
    tsType: string;
    schema: Schema;
    fieldTemplate: string;
    fromJsonTemplate: (input: string) => string;
    toJsonTemplate: (input: string) => string;
    content: string;
}

export function tsTypeFromJtdSchema(
    nodePath: string,
    def: Schema,
    options: RpcOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    if (additionalOptions.logDef) {
        console.log(def);
    }
    if (isSchemaFormType(def)) {
        return tsScalarFromJtdSchema(nodePath, def, options, additionalOptions);
    }
    if (isSchemaFormProperties(def)) {
        return tsObjectFromJtdSchema(nodePath, def, options, additionalOptions);
    }
    if (isSchemaFormEnum(def)) {
        return tsEnumFromJtdSchema(nodePath, def, options, additionalOptions);
    }
    if (isSchemaFormElements(def)) {
        return tsArrayFromJtdSchema(nodePath, def, options, additionalOptions);
    }
    if (isSchemaFormDiscriminator(def)) {
        return tsDiscriminatedUnionFromJtdSchema(
            nodePath,
            def,
            options,
            additionalOptions,
        );
    }
    if (isSchemaFormValues(def)) {
        return tsRecordFromJtdSchema(nodePath, def, options, additionalOptions);
    }
    if (isSchemaFormRef(def)) {
        return tsRefFromJtdSchema(nodePath, def, options, additionalOptions);
    }

    return tsAnyFromJtdSchema(nodePath, def, options, additionalOptions);
}

export function maybeOptionalKey(keyName: string, isOptional = false) {
    if (isOptional) {
        return `${keyName}?`;
    }
    return keyName;
}

export function maybeNullType(typeName: string, isNullable = false) {
    if (isNullable) {
        return `${typeName} | null`;
    }
    return typeName;
}

export function tsAnyFromJtdSchema(
    nodePath: string,
    def: Schema,
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const key = nodePath.split(".").pop() ?? "";
    const isNullable = def.nullable ?? false;
    const isOptional = additionalOptions.isOptional;
    return {
        tsType: "any",
        schema: def,
        fieldTemplate: `${maybeOptionalKey(key, isOptional)}: ${maybeNullType(
            "any",
            isNullable,
        )}`,
        fromJsonTemplate(input) {
            return input;
        },
        toJsonTemplate(input) {
            return `JSON.stringify(${input})`;
        },
        content: "",
    };
}

export function getJsDocComment(metadata: Schema["metadata"]) {
    const descriptionParts: string[] = [];

    if (metadata?.description?.length) {
        const parts = metadata.description.split("\n");
        for (const part of parts) {
            descriptionParts.push(`* ${part}`);
        }
    }
    if (metadata?.isDeprecated) {
        descriptionParts.push("* @deprecated");
    }
    if (descriptionParts.length === 0) {
        return "";
    }
    return `/**
${descriptionParts.join("\n")}
*/\n`;
}

export function tsScalarFromJtdSchema(
    nodePath: string,
    def: SchemaFormType,
    options: RpcOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const key = nodePath.split(".").pop() ?? "";
    const isNullable = def.nullable ?? false;
    const isOptional = additionalOptions.isOptional;
    switch (def.type) {
        case "boolean":
            return {
                tsType: "boolean",
                schema: def,
                fieldTemplate: `${getJsDocComment(def.metadata)}${maybeOptionalKey(
                    key,
                    isOptional,
                )}: ${maybeNullType("boolean", isNullable)}`,
                fromJsonTemplate(input) {
                    if (isOptional) {
                        return `typeof ${input} === 'boolean' ? ${input} : undefined`;
                    }
                    if (isNullable) {
                        return `typeof ${input} === 'boolean' ? ${input} : null`;
                    }
                    return `typeof ${input} === 'boolean' ? ${input} : false`;
                },
                toJsonTemplate(input) {
                    if (isNullable) {
                        return `typeof ${input} === 'boolean' ? ${input} : null`;
                    }
                    return `typeof ${input} === 'boolean' ? ${input} : false`;
                },
                content: "",
            };
        case "string":
            return {
                tsType: "string",
                schema: def,
                fieldTemplate: `${getJsDocComment(def.metadata)}${maybeOptionalKey(
                    key,
                    isOptional,
                )}: ${maybeNullType("string", isNullable)}`,
                fromJsonTemplate(input) {
                    if (isOptional) {
                        return `typeof ${input} === 'string' ? ${input} : undefined`;
                    }
                    if (isNullable) {
                        return `typeof ${input} === 'string' ? ${input} : null`;
                    }
                    return `typeof ${input} === 'string' ? ${input} : ''`;
                },
                toJsonTemplate(input) {
                    if (isNullable) {
                        return `typeof ${input} === 'string' ? \`"${input}"\` : null`;
                    }
                    return `typeof ${input} === 'string' ? \`"${input}"\` : ""`;
                },
                content: "",
            };
        case "timestamp":
            return {
                tsType: "Date",
                schema: def,
                fieldTemplate: `${getJsDocComment(def.metadata)}${maybeOptionalKey(
                    key,
                    isOptional,
                )}: ${maybeNullType("Date", isNullable)}`,
                fromJsonTemplate(input) {
                    if (isOptional) {
                        return `typeof ${input} === 'string' ? new Date(${input}) : undefined`;
                    }
                    if (isNullable) {
                        return `typeof ${input} === 'string' ? new Date(${input}) : null`;
                    }
                    return `typeof ${input} === 'string' ? new Date(${input}) : new Date(0)`;
                },
                toJsonTemplate(input) {
                    if (isOptional || isNullable) {
                        return `typeof ${input} === 'object' && ${input} instanceof Date ? "${input}.toISOString()" : null`;
                    }
                    return `"${input}.toISOString()"`;
                },
                content: "",
            };
        case "float32":
        case "float64":
        case "int8":
        case "int16":
        case "int32":
        case "uint8":
        case "uint16":
        case "uint32":
            return {
                tsType: "number",
                schema: def,
                fieldTemplate: `${getJsDocComment(def.metadata)}${maybeOptionalKey(
                    key,
                    isOptional,
                )}: ${maybeNullType("number", isNullable)}`,
                fromJsonTemplate(input) {
                    if (isOptional) {
                        return `typeof ${input} === 'number' ? ${input} : undefined`;
                    }
                    if (isNullable) {
                        return `typeof ${input} === 'number' ? ${input} : null`;
                    }
                    return `typeof ${input} === 'number' ? ${input} : 0`;
                },
                toJsonTemplate(input) {
                    return `JSON.stringify(${input})`;
                },
                content: "",
            };
        case "int64":
        case "uint64":
            return {
                tsType: "bigint",
                schema: def,
                fieldTemplate: `${getJsDocComment(def.metadata)}${maybeOptionalKey(
                    key,
                    isOptional,
                )}: ${maybeNullType("bigint", isNullable)}`,
                fromJsonTemplate(input) {
                    if (isOptional) {
                        return `typeof ${input} === 'string' ? BigInt(${input}) : undefined`;
                    }
                    if (isNullable) {
                        return `typeof ${input} === 'string' ? BigInt(${input}) : null`;
                    }
                    return `typeof ${input} === 'string' ? BigInt(${input}) : BigInt("0")`;
                },
                toJsonTemplate(input) {
                    if (isOptional || isNullable) {
                        return `${input}?.toString()`;
                    }
                    return `${input}.toString()`;
                },
                content: "",
            };
        default:
            def.type satisfies never;
            throw new Error(`Invalid type in SchemaFormType`);
    }
}

function getTypeName(nodePath: string, def: Schema) {
    if (def.metadata?.id) {
        return pascalCase(def.metadata.id);
    }
    return pascalCase(nodePath.split(".").join("_"));
}

export function tsObjectFromJtdSchema(
    nodePath: string,
    def: SchemaFormProperties,
    options: RpcOptions,
    additionalOptions: AdditionalOptions & {
        discriminatorKey?: string;
        discriminatorKeyValue?: string;
    },
): TsProperty {
    const typeName = getTypeName(nodePath, def);
    const key = nodePath.split(".").pop() ?? "";
    const fieldNames: string[] = [];
    const fieldParts: string[] = [];
    const subContentParts: string[] = [];
    const parserParts: string[] = [];
    if (
        additionalOptions.discriminatorKey &&
        additionalOptions.discriminatorKeyValue
    ) {
        parserParts.push(
            `${additionalOptions.discriminatorKey}: '${additionalOptions.discriminatorKeyValue}'`,
        );
        fieldParts.push(
            `${additionalOptions.discriminatorKey}: "${additionalOptions.discriminatorKeyValue}"`,
        );
        fieldNames.push(additionalOptions.discriminatorKey);
    }
    if (def.properties) {
        for (const propKey of Object.keys(def.properties)) {
            const propSchema = def.properties[propKey]!;
            const type = tsTypeFromJtdSchema(
                `${nodePath}.${propKey}`,
                propSchema,
                options,
                {
                    isOptional: false,
                    existingTypeNames: additionalOptions.existingTypeNames,
                },
            );
            parserParts.push(
                `${propKey}: ${type.fromJsonTemplate(`input.${propKey}`)}`,
            );
            fieldParts.push(type.fieldTemplate);
            fieldNames.push(propKey);
            if (type.content) {
                subContentParts.push(type.content);
            }
        }
    }
    if (def.optionalProperties) {
        for (const propKey of Object.keys(def.optionalProperties)) {
            const propSchema = def.optionalProperties[propKey]!;
            const type = tsTypeFromJtdSchema(
                `${nodePath}.${propKey}`,
                propSchema,
                options,
                {
                    isOptional: true,
                    existingTypeNames: additionalOptions.existingTypeNames,
                },
            );
            parserParts.push(
                `${propKey}: ${type.fromJsonTemplate(`input.${propKey}`)}`,
            );
            fieldParts.push(type.fieldTemplate);
            fieldNames.push(propKey);
            if (type.content) {
                subContentParts.push(type.content);
            }
        }
    }
    let content = "";
    const modifiedDef = {
        ...def,
        metadata: {
            id: def.metadata?.id ?? typeName,
            description: def.metadata?.description,
        },
        nullable: false,
    } satisfies Schema;
    let validatorPart = "";
    if (options.typesNeedingParser.includes(typeName)) {
        const parsingCode = getSchemaParsingCode("input", modifiedDef);
        const serializationCode = getSchemaSerializationCode(
            "input",
            modifiedDef,
        );
        validatorPart = `export const $$${typeName} = {
            parse(input: Record<any, any>): ${typeName} {
                ${parsingCode}
            },
            serialize(input: ${typeName}): string {
                ${serializationCode}
            }
        }`;
    }
    if (!additionalOptions.existingTypeNames.includes(typeName)) {
        content = `${getJsDocComment(def.metadata)}export interface ${typeName} {
        ${fieldParts.join(";\n    ")};
    }
    ${validatorPart}
    ${subContentParts.join("\n")}`;
        additionalOptions.existingTypeNames.push(typeName);
    }
    return {
        tsType: typeName,
        schema: def,
        fieldTemplate: `${getJsDocComment(def.metadata)}${maybeOptionalKey(
            key,
            additionalOptions.isOptional,
        )}: ${maybeNullType(typeName, def.nullable ?? false)}`,
        fromJsonTemplate(input) {
            if (additionalOptions.isOptional) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : undefined`;
            }
            if (def.nullable) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : null`;
            }
            return `$$${typeName}.parse(${input})`;
        },
        toJsonTemplate(input) {
            return `JSON.stringify(${input})`;
        },
        content,
    };
}

export function tsEnumFromJtdSchema(
    nodePath: string,
    def: SchemaFormEnum,
    options: RpcOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const keyName = nodePath.split(".").pop() ?? "";
    const typeName = getTypeName(nodePath, def);
    let content = `${getJsDocComment(def.metadata)}export type ${typeName} = ${def.enum
        .map((val) => `"${val}"`)
        .join(" | ")}`;
    if (additionalOptions.existingTypeNames.includes(typeName)) {
        content = "";
    } else {
        additionalOptions.existingTypeNames.push(typeName);
    }
    return {
        tsType: typeName,
        schema: def,
        fieldTemplate: `${getJsDocComment(def.metadata)}${maybeOptionalKey(
            keyName,
            additionalOptions.isOptional,
        )}: ${maybeNullType(typeName, def.nullable ?? false)}`,
        fromJsonTemplate(input) {
            if (additionalOptions.isOptional) {
                return `typeof ${input} === 'string' ? $$${typeName}.parse(${input}) : undefined`;
            }
            if (def.nullable) {
                return `typeof ${input} === 'string' ? $$${typeName}.parse(${input}) : null`;
            }
            return `$$${typeName}.parse(${input})`;
        },
        toJsonTemplate(input) {
            return `JSON.stringify(${input})`;
        },
        content,
    };
}

export function tsArrayFromJtdSchema(
    nodePath: string,
    def: SchemaFormElements,
    options: RpcOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const key = nodePath.split(".").pop() ?? "";
    const subType = tsTypeFromJtdSchema(
        `${nodePath}.item`,
        def.elements,
        options,
        {
            isOptional: false,
            existingTypeNames: additionalOptions.existingTypeNames,
        },
    );
    const tsType = `Array<${maybeNullType(
        subType.tsType,
        def.elements.nullable,
    )}>`;
    return {
        tsType,
        schema: def,
        fieldTemplate: `${getJsDocComment(def.metadata)}${maybeOptionalKey(
            key,
            additionalOptions.isOptional ?? false,
        )}: ${maybeNullType(tsType, def.nullable ?? false)}`,
        fromJsonTemplate(input) {
            if (additionalOptions.isOptional) {
                return `Array.isArray(${input}) ? ${input}.map((item) => ${subType.fromJsonTemplate(
                    "item",
                )}) : undefined`;
            }
            if (def.nullable) {
                return `Array.isArray(${input}) ? ${input}.map((item) => ${subType.fromJsonTemplate(
                    "item",
                )}) : null`;
            }
            return `Array.isArray(${input}) ? ${input}.map((item) => ${subType.fromJsonTemplate(
                "item",
            )}) : []`;
        },
        toJsonTemplate(input) {
            return `JSON.stringify(${input})`;
        },
        content: subType.content,
    };
}

export function tsDiscriminatedUnionFromJtdSchema(
    nodePath: string,
    def: SchemaFormDiscriminator,
    options: RpcOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const key = nodePath.split(".").pop() ?? "";
    const typeName = getTypeName(nodePath, def);
    const subTypeNames: string[] = [];
    const subContentParts: string[] = [];
    const parserParts: string[] = [];
    for (const val of Object.keys(def.mapping)) {
        const optionSchema = def.mapping[val];
        if (!isSchemaFormProperties(optionSchema)) {
            continue;
        }
        const optionType = tsObjectFromJtdSchema(
            `${nodePath}.${camelCase(val.toLowerCase())}`,
            optionSchema,
            options,
            {
                discriminatorKey: def.discriminator,
                discriminatorKeyValue: val,
                isOptional: false,
                existingTypeNames: additionalOptions.existingTypeNames,
            },
        );
        parserParts.push(`case '${val}': 
        return $$${optionType.tsType}.parse(input);`);
        subTypeNames.push(optionType.tsType);
        subContentParts.push(optionType.content);
    }
    let validatorPart = "";
    if (options.typesNeedingParser.includes(typeName)) {
        const modifiedDef = { ...def, nullable: false };
        const parsingCode = getSchemaParsingCode(
            "input",
            modifiedDef as Schema,
        );
        const serializationCode = getSchemaSerializationCode(
            "input",
            modifiedDef,
        );
        validatorPart = `export const $$${typeName} = {
    parse(input: Record<any, any>): ${typeName} {
        ${parsingCode}
    },
    serialize(input: ${typeName}): string {
        ${serializationCode}
    }
}`;
    }
    let content = `${getJsDocComment(def.metadata)}export type ${typeName} = ${subTypeNames.join(" | ")};
${validatorPart}
    ${subContentParts.join("\n")}`;
    if (additionalOptions.existingTypeNames.includes(typeName)) {
        content = "";
    } else {
        additionalOptions.existingTypeNames.push(typeName);
    }
    return {
        tsType: typeName,
        fieldTemplate: `${getJsDocComment(def.metadata)}${maybeOptionalKey(
            key,
            additionalOptions.isOptional,
        )}: ${maybeNullType(typeName, def.nullable)}`,
        schema: def,
        fromJsonTemplate(input) {
            if (additionalOptions.isOptional) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : undefined`;
            }
            if (def.nullable) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : null`;
            }
            return `$$${typeName}.parse(${input})`;
        },
        toJsonTemplate(input) {
            return `JSON.stringify(${input})`;
        },
        content,
    };
}

export function tsRecordFromJtdSchema(
    nodePath: string,
    def: SchemaFormValues,
    options: RpcOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const key = nodePath.split(".").pop() ?? "";
    const typeName = getTypeName(nodePath, def);
    const subType = tsTypeFromJtdSchema(
        `${nodePath}.value`,
        def.values,
        options,
        {
            isOptional: false,
            existingTypeNames: additionalOptions.existingTypeNames,
        },
    );
    let content = "";
    if (!additionalOptions.existingTypeNames.includes(typeName)) {
        let validatorPart = "";
        if (options.typesNeedingParser.includes(typeName)) {
            const modifiedDef = { ...def, nullable: false };
            const parsingCode = getSchemaParsingCode(
                "input",
                modifiedDef as Schema,
            );
            const serializationCode = getSchemaSerializationCode(
                "input",
                modifiedDef as Schema,
            );
            validatorPart = `export const $$${typeName} = {
    parse(input: Record<any, any>): ${typeName} {
        ${parsingCode}
    },
    serialize(input: ${typeName}): string {
        ${serializationCode}
    }
}`;
        }
        content = `${getJsDocComment(def.metadata)}export type ${typeName} = Record<string, ${subType.tsType}>;
${validatorPart}
${subType.content}`;
    }
    return {
        tsType: typeName,
        schema: def,
        fieldTemplate: `${getJsDocComment(def.metadata)}${maybeOptionalKey(
            key,
            additionalOptions.isOptional,
        )}: ${maybeNullType(typeName, def.nullable)}`,
        fromJsonTemplate(input) {
            if (additionalOptions.isOptional) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : undefined`;
            }
            if (def.nullable) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : null`;
            }
            return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : {}`;
        },
        toJsonTemplate(input) {
            return `JSON.stringify(${input})`;
        },
        content,
    };
}

export function tsRefFromJtdSchema(
    nodePath: string,
    def: SchemaFormRef,
    options: RpcOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const key = nodePath.split(".").pop() ?? "";
    const typeName = pascalCase(def.ref, {
        normalize: true,
    });
    return {
        tsType: typeName,
        schema: def,
        fieldTemplate: `${maybeOptionalKey(key, additionalOptions.isOptional)}: ${maybeNullType(typeName, def.nullable)}`,
        fromJsonTemplate(input) {
            if (additionalOptions.isOptional) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : undefined`;
            }
            if (def.nullable) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : null`;
            }
            return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.parse(${input}) : {}`;
        },
        toJsonTemplate(input) {
            if (additionalOptions.isOptional) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.serialize(${input}) : 'undefined'`;
            }
            if (def.nullable) {
                return `typeof ${input} === 'object' && ${input} !== null ? $$${typeName}.serialize(${input}) : 'null'`;
            }
            return `$$${typeName}.serialize(${input})`;
        },
        content: "",
    };
}
