import { writeFileSync } from "fs";
import {
    type AppDefinition,
    defineClientGeneratorPlugin,
    pascalCase,
    type Schema,
    isTypeForm,
    type SchemaFormType,
    isPropertiesForm,
    type SchemaFormProperties,
    isEnumForm,
    type SchemaFormEnum,
    isElementsForm,
    type SchemaFormElements,
    type SchemaFormDiscriminator,
    camelCase,
    isDiscriminatorForm,
    isValuesForm,
    type SchemaFormValues,
    type RpcDefinition,
    unflattenProcedures,
    isRpcDefinition,
    isServiceDefinition,
    type ServiceDefinition,
} from "arri-codegen-utils";
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
                throw new Error(
                    "No procedures found in definition file. Typescript client will not be generated.",
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
    const typesNeedingValidator: string[] = [];
    Object.keys(services).forEach((key) => {
        const item = services[key];
        if (isRpcDefinition(item)) {
            const rpc = tsRpcFromDefinition(key, item, {
                typesNeedingValidator,
                ...options,
            });
            procedureParts.push(rpc);
            return;
        }
        if (isServiceDefinition(item)) {
            const serviceName: string = pascalCase(`${clientName}_${key}`);
            const service = tsServiceFromDefinition(serviceName, item, {
                typesNeedingValidator,
                ...options,
            });
            serviceFieldParts.push(`${key}: ${serviceName}Service;`);
            serviceInitializationParts.push(
                `this.${key} = new ${serviceName}Service(options);`,
            );
            subContentParts.push(service);
            // todo
        }
    });
    for (const key of Object.keys(def.models)) {
        const schema = def.models[key];
        if (isPropertiesForm(schema)) {
            const type = tsTypeFromJtdSchema(key, schema, options, {
                isOptional: false,
                existingTypeNames,
                typesNeedingValidator,
            });
            subContentParts.push(type.content);
        }
    }
    return await prettier.format(
        `// this file was autogenerated by arri-codegen-ts
/* eslint-disable */
import { arriRequest, createRawJtdValidator } from 'arri-client';
    
interface ${clientName}Options {
    baseUrl?: string;
    headers?: Record<string, string>;
}

export class ${clientName} {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;
    ${serviceFieldParts.join("\n    ")}

    constructor(options: ${clientName}Options = {}) {
        this.baseUrl = options.baseUrl ?? "";
        this.headers = options.headers ?? {};
        ${serviceInitializationParts.join(";\n        ")}
    }
    ${procedureParts.join("\n    ")}
}

${subContentParts.join("\n")}
`,
        { parser: "typescript", ...options.prettierOptions },
    );
}

interface RpcOptions extends GeneratorOptions {
    typesNeedingValidator: string[];
}

export function tsRpcFromDefinition(
    key: string,
    schema: RpcDefinition,
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
        options.typesNeedingValidator.push(pascalCase(schema.params ?? ""));
        serializerPart = `_$${paramName}Validator.serialize`;
    }
    if (hasOutput) {
        options.typesNeedingValidator.push(pascalCase(schema.response ?? ""));
        parserPart = `_$${responseName}Validator.parse`;
    }
    const paramsOutput = hasInput ? `params` : `params: undefined`;

    return `${key}(${paramsInput}) {
        return arriRequest<${schema.response ?? "undefined"}, ${
            schema.params ?? "undefined"
        }>({
            url: \`\${this.baseUrl}${schema.path}\`,
            method: "${schema.method}",
            headers: this.headers,
            ${paramsOutput},
            parser: ${parserPart},
            serializer: ${serializerPart},
        });
    }`;
}

export function tsServiceFromDefinition(
    name: string,
    schema: ServiceDefinition,
    options: RpcOptions,
): string {
    const serviceFieldParts: string[] = [];
    const serviceConstructorParts: string[] = [];
    const subServiceContent: string[] = [];
    const rpcContent: string[] = [];

    Object.keys(schema).forEach((key) => {
        const def = schema[key];
        if (isRpcDefinition(def)) {
            const rpc = tsRpcFromDefinition(key, def, options);
            rpcContent.push(rpc);
            return;
        }
        if (isServiceDefinition(def)) {
            const serviceName: string = pascalCase(`${name}_${key}`);
            const service = tsServiceFromDefinition(serviceName, def, options);
            serviceFieldParts.push(`${key}: ${serviceName}Service;`);
            serviceConstructorParts.push(
                `this.${key} = new ${serviceName}Service(options);`,
            );
            subServiceContent.push(service);
        }
    });

    return `export class ${name}Service {
        private readonly baseUrl: string;
        private readonly headers: Record<string, string>;
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
    typesNeedingValidator: string[];
    existingTypeNames: string[];
}

interface TsProperty {
    tsType: string;
    schema: Schema;
    fieldTemplate: string;
    content: string;
}

export function tsTypeFromJtdSchema(
    nodePath: string,
    def: Schema,
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    if (isTypeForm(def)) {
        return tsScalarFromJtdSchema(nodePath, def, options, additionalOptions);
    }
    if (isPropertiesForm(def)) {
        return tsObjectFromJtdSchema(nodePath, def, options, additionalOptions);
    }
    if (isEnumForm(def)) {
        return tsEnumFromJtdSchema(nodePath, def, options, additionalOptions);
    }
    if (isElementsForm(def)) {
        return tsArrayFromJtdSchema(nodePath, def, options, additionalOptions);
    }
    if (isDiscriminatorForm(def)) {
        return tsDiscriminatedUnionFromJtdSchema(
            nodePath,
            def,
            options,
            additionalOptions,
        );
    }
    if (isValuesForm(def)) {
        return tsRecordFromJtdSchema(nodePath, def, options, additionalOptions);
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
        content: "",
    };
}

export function tsScalarFromJtdSchema(
    nodePath: string,
    def: SchemaFormType,
    options: GeneratorOptions,
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
                fieldTemplate: `${maybeOptionalKey(
                    key,
                    isOptional,
                )}: ${maybeNullType("boolean", isNullable)}`,
                content: "",
            };
        case "string":
            return {
                tsType: "string",
                schema: def,
                fieldTemplate: `${maybeOptionalKey(
                    key,
                    isOptional,
                )}: ${maybeNullType("string", isNullable)}`,
                content: "",
            };
        case "timestamp":
            return {
                tsType: "Date",
                schema: def,
                fieldTemplate: `${maybeOptionalKey(
                    key,
                    isOptional,
                )}: ${maybeNullType("Date", isNullable)}`,
                content: "",
            };
        case "float32":
        case "float64":
        case "int8":
        case "int16":
        case "int32":
        case "uint16":
        case "uint32":
        case "uint8":
            return {
                tsType: "number",
                schema: def,
                fieldTemplate: `${maybeOptionalKey(
                    key,
                    isOptional,
                )}: ${maybeNullType("number", isNullable)}`,
                content: "",
            };
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
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions & {
        discriminatorKey?: string;
        discriminatorKeyValue?: string;
    },
): TsProperty {
    const typeName = getTypeName(nodePath, def);
    const key = nodePath.split(".").pop() ?? "";
    const fieldParts: string[] = [];
    const subContentParts: string[] = [];
    if (
        additionalOptions.discriminatorKey &&
        additionalOptions.discriminatorKeyValue
    ) {
        fieldParts.push(
            `${additionalOptions.discriminatorKey}: "${additionalOptions.discriminatorKeyValue}"`,
        );
    }
    if (def.properties) {
        for (const propKey of Object.keys(def.properties)) {
            const propSchema = def.properties[propKey];
            const type = tsTypeFromJtdSchema(
                `${nodePath}.${propKey}`,
                propSchema,
                options,
                {
                    isOptional: false,
                    existingTypeNames: additionalOptions.existingTypeNames,
                    typesNeedingValidator:
                        additionalOptions.typesNeedingValidator,
                },
            );
            fieldParts.push(type.fieldTemplate);
            if (type.content) {
                subContentParts.push(type.content);
            }
        }
    }
    if (def.optionalProperties) {
        for (const propKey of Object.keys(def.optionalProperties)) {
            const propSchema = def.optionalProperties[propKey];
            const type = tsTypeFromJtdSchema(
                `${nodePath}.${propKey}`,
                propSchema,
                options,
                {
                    isOptional: true,
                    existingTypeNames: additionalOptions.existingTypeNames,
                    typesNeedingValidator:
                        additionalOptions.typesNeedingValidator,
                },
            );
            fieldParts.push(type.fieldTemplate);
            if (type.content) {
                subContentParts.push(type.content);
            }
        }
    }
    let content = "";
    let validatorPart = "";
    if (additionalOptions.typesNeedingValidator.includes(typeName)) {
        validatorPart = `const _$${typeName}Validator = createRawJtdValidator<${typeName}>(${JSON.stringify(
            def,
        )})`;
    }
    if (!additionalOptions.existingTypeNames.includes(typeName)) {
        content = `export interface ${typeName} {
        ${fieldParts.join(";\n    ")}
    }
    ${validatorPart}
    ${subContentParts.join("\n")}`;
        additionalOptions.existingTypeNames.push(typeName);
    }

    return {
        tsType: typeName,
        schema: def,
        fieldTemplate: `${maybeOptionalKey(
            key,
            additionalOptions.isOptional,
        )}: ${maybeNullType(typeName, def.nullable ?? false)}`,
        content,
    };
}

export function tsEnumFromJtdSchema(
    nodePath: string,
    def: SchemaFormEnum,
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const keyName = nodePath.split(".").pop() ?? "";
    const typeName = getTypeName(nodePath, def);
    const content = `export type ${typeName} = ${def.enum
        .map((val) => `"${val}"`)
        .join(" | ")}`;
    return {
        tsType: typeName,
        schema: def,
        fieldTemplate: `${maybeOptionalKey(
            keyName,
            additionalOptions.isOptional,
        )}: ${maybeNullType(typeName, def.nullable ?? false)}`,
        content,
    };
}

export function tsArrayFromJtdSchema(
    nodePath: string,
    def: SchemaFormElements,
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const key = nodePath.split(".").pop() ?? "";
    const subType = tsTypeFromJtdSchema(
        `${nodePath}.item`,
        def.elements,
        options,
        additionalOptions,
    );
    const tsType = `Array<${subType.tsType}>`;
    return {
        tsType,
        schema: def,
        fieldTemplate: `${maybeOptionalKey(
            key,
            additionalOptions.isOptional ?? false,
        )}: ${maybeNullType(tsType, def.nullable ?? false)}`,
        content: subType.content,
    };
}

export function tsDiscriminatedUnionFromJtdSchema(
    nodePath: string,
    def: SchemaFormDiscriminator,
    options: GeneratorOptions,
    additionalOptions: AdditionalOptions,
): TsProperty {
    const key = nodePath.split(".").pop() ?? "";
    const typeName = getTypeName(nodePath, def);
    const subTypeNames: string[] = [];
    const subContentParts: string[] = [];
    for (const val of Object.keys(def.mapping)) {
        const optionSchema = def.mapping[val];
        if (!isPropertiesForm(optionSchema)) {
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
                typesNeedingValidator: additionalOptions.typesNeedingValidator,
            },
        );
        subTypeNames.push(optionType.tsType);
        subContentParts.push(optionType.content);
    }
    let content = `export type ${typeName} = ${subTypeNames.join(" | ")};
    ${subContentParts.join("\n")}`;
    if (additionalOptions.existingTypeNames.includes(typeName)) {
        content = "";
    } else {
        additionalOptions.existingTypeNames.push(typeName);
    }
    return {
        tsType: typeName,
        fieldTemplate: `${maybeOptionalKey(
            key,
            additionalOptions.isOptional,
        )}: ${maybeNullType(typeName, def.nullable)}`,
        schema: def,
        content,
    };
}

export function tsRecordFromJtdSchema(
    nodePath: string,
    def: SchemaFormValues,
    options: GeneratorOptions,
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
            typesNeedingValidator: additionalOptions.typesNeedingValidator,
        },
    );
    let content = "";
    if (!additionalOptions.existingTypeNames.includes(typeName)) {
        content = `export type ${typeName} = Record<string, ${subType.tsType}>;
${subType.content}`;
    }
    return {
        tsType: typeName,
        schema: def,
        fieldTemplate: `${maybeOptionalKey(
            key,
            additionalOptions.isOptional,
        )}: ${maybeNullType(typeName, def.nullable)}`,
        content,
    };
}