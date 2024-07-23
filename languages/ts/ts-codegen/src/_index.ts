import {
    type AppDefinition,
    defineGeneratorPlugin,
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormType,
    isSchemaFormValues,
    type Schema,
} from "@arrirpc/codegen-utils";
import { writeFileSync } from "fs";
import prettier from "prettier";

import { tsAnyFromSchema } from "./any";
import { tsArrayFromSchema } from "./array";
import { CodegenContext, TsProperty } from "./common";
import { tsTaggedUnionFromSchema } from "./discriminator";
import { tsEnumFromSchema } from "./enum";
import { tsObjectFromSchema } from "./object";
import {
    tsBigIntFromSchema,
    tsBooleanFromSchema,
    tsDateFromSchema,
    tsFloatFromSchema,
    tsIntFromSchema,
    tsStringFromSchema,
} from "./primitives";
import { tsRecordFromSchema } from "./record";
import { tsRefFromSchema } from "./ref";

export interface TypescriptGeneratorOptions {
    clientName: string;
    outputFile: string;
    typePrefix?: string;
    prettierOptions?: Omit<prettier.Config, "parser">;
}

export const typescriptClientGenerator = defineGeneratorPlugin(
    (options: TypescriptGeneratorOptions) => ({
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
    options: TypescriptGeneratorOptions,
): Promise<string> {
    const types: string[] = [];
    const context: CodegenContext = {
        clientName: options.clientName,
        typePrefix: options.typePrefix ?? "",
        generatedTypes: [],
        instancePath: "",
        schemaPath: "",
        discriminatorParent: "",
        discriminatorKey: "",
        discriminatorValue: "",
        versionNumber: def.info?.version ?? "",
        hasSseProcedure: false,
        hasWsProcedure: false,
    };
    for (const key of Object.keys(def.definitions)) {
        const typeDef = def.definitions[key]!;
        const result = tsTypeFromSchema(typeDef, {
            clientName: context.clientName,
            typePrefix: context.typePrefix,
            generatedTypes: context.generatedTypes,
            instancePath: `/${key}`,
            schemaPath: `/${key}`,
            discriminatorParent: "",
            discriminatorKey: "",
            discriminatorValue: "",
            versionNumber: context.versionNumber,
            hasSseProcedure: context.hasSseProcedure,
            hasWsProcedure: context.hasWsProcedure,
        });
        if (result.content) {
            types.push(result.content);
        }
    }

    const result = `
import {
    ArriEnumValidator,
    ArriModelValidator,
    arriRequest,
    arriSseRequest,
    arriWsRequest,
    INT8_MAX,
    INT8_MIN,
    INT16_MAX,
    INT16_MIN,
    INT32_MAX,
    INT32_MIN,
    isObject,
    serializeString,
    SseOptions,
    UINT8_MAX,
    UINT16_MAX,
    UINT32_MAX,
    WsOptions,
} from "@arrirpc/client";

${types.join("\n")}`;
    return await prettier.format(result, {
        ...options.prettierOptions,
        parser: "typescript",
    });
}

export function tsTypeFromSchema(
    schema: Schema,
    context: CodegenContext,
): TsProperty {
    if (isSchemaFormType(schema)) {
        switch (schema.type) {
            case "string":
                return tsStringFromSchema(schema, context);
            case "boolean":
                return tsBooleanFromSchema(schema, context);
            case "timestamp":
                return tsDateFromSchema(schema, context);
            case "float32":
            case "float64":
                return tsFloatFromSchema(schema, context);
            case "int8":
                return tsIntFromSchema(schema, "int8", context);
            case "uint8":
                return tsIntFromSchema(schema, "uint8", context);
            case "int16":
                return tsIntFromSchema(schema, "int16", context);
            case "uint16":
                return tsIntFromSchema(schema, "uint16", context);
            case "int32":
                return tsIntFromSchema(schema, "int32", context);
            case "uint32":
                return tsIntFromSchema(schema, "uint32", context);
            case "int64":
                return tsBigIntFromSchema(schema, false, context);
            case "uint64":
                return tsBigIntFromSchema(schema, true, context);
        }
    }
    if (isSchemaFormEnum(schema)) {
        return tsEnumFromSchema(schema, context);
    }
    if (isSchemaFormProperties(schema)) {
        return tsObjectFromSchema(schema, context);
    }
    if (isSchemaFormElements(schema)) {
        return tsArrayFromSchema(schema, context);
    }
    if (isSchemaFormValues(schema)) {
        return tsRecordFromSchema(schema, context);
    }
    if (isSchemaFormDiscriminator(schema)) {
        return tsTaggedUnionFromSchema(schema, context);
    }
    if (isSchemaFormRef(schema)) {
        return tsRefFromSchema(schema, context);
    }
    return tsAnyFromSchema(schema, context);
}
