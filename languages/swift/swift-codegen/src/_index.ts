import fs from "node:fs";

import {
    AppDefinition,
    defineGeneratorPlugin,
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormType,
    isSchemaFormValues,
    Schema,
    unflattenProcedures,
} from "@arrirpc/codegen-utils";

import { GeneratorContext, SwiftProperty } from "./_common";
import { swiftAnyFromSchema } from "./any";
import { swiftArrayFromSchema } from "./array";
import { swiftTaggedUnionFromSchema } from "./discriminator";
import { swiftEnumFromSchema } from "./enum";
import { swiftObjectFromSchema } from "./object";
import {
    swiftBooleanFromSchema,
    swiftLargeIntFromSchema,
    swiftNumberFromSchema,
    swiftStringFromSchema,
    swiftTimestampFromSchema,
} from "./primitives";
import { swiftServiceFromSchema } from "./procedures";
import { swiftDictionaryFromSchema } from "./record";
import { swiftRefFromSchema } from "./ref";

export interface SwiftClientGeneratorOptions {
    clientName: string;
    outputFile: string;
    typePrefix?: string;
}

export const swiftClientGenerator = defineGeneratorPlugin(
    (options: SwiftClientGeneratorOptions) => {
        return {
            async generator(def, _isDevServer) {
                const content = createSwiftClient(def, options);
                fs.writeFileSync(options.outputFile, content, "utf8");
            },
            options,
        };
    },
);

export function createSwiftClient(
    def: AppDefinition,
    options: SwiftClientGeneratorOptions,
) {
    const context: GeneratorContext = {
        clientVersion: def.info?.version ?? "",
        clientName: options.clientName,
        typePrefix: options.typePrefix ?? "",
        instancePath: "",
        schemaPath: "",
        generatedTypes: [],
    };
    const services = unflattenProcedures(def.procedures);
    const mainService = swiftServiceFromSchema(services, context);
    const typeContent: string[] = [];
    for (const key of Object.keys(def.definitions)) {
        const subSchema = def.definitions[key]!;
        const subType = swiftTypeFromSchema(subSchema, {
            clientVersion: context.clientVersion,
            clientName: context.clientName,
            typePrefix: context.typePrefix,
            instancePath: `/${key}`,
            schemaPath: `/${key}`,
            generatedTypes: context.generatedTypes,
        });
        if (subType.content) {
            typeContent.push(subType.content);
        }
    }
    return `import Foundation
import ArriClient

${mainService}
${typeContent.join("\n")}`;
}

export function swiftTypeFromSchema(
    schema: Schema,
    context: GeneratorContext,
): SwiftProperty {
    if (isSchemaFormType(schema)) {
        switch (schema.type) {
            case "string":
                return swiftStringFromSchema(schema, context);
            case "boolean":
                return swiftBooleanFromSchema(schema, context);
            case "timestamp":
                return swiftTimestampFromSchema(schema, context);
            case "float32":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "Float32",
                    "float",
                    "0.0",
                );
            case "float64":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "Float64",
                    "double",
                    "0.0",
                );
            case "int8":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "Int8",
                    "int8",
                    "0",
                );
            case "uint8":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "UInt8",
                    "uInt8",
                    "0",
                );
            case "int16":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "Int16",
                    "int16",
                    "0",
                );
            case "uint16":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "UInt16",
                    "uInt16",
                    "0",
                );
            case "int32":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "Int32",
                    "int32",
                    "0",
                );
            case "uint32":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "UInt32",
                    "uInt32",
                    "0",
                );
            case "int64":
                return swiftLargeIntFromSchema(schema, context, "Int64");
            case "uint64":
                return swiftLargeIntFromSchema(schema, context, "UInt64");
            default:
                schema.type satisfies never;
                break;
        }
    }
    if (isSchemaFormEnum(schema)) {
        return swiftEnumFromSchema(schema, context);
    }
    if (isSchemaFormProperties(schema)) {
        return swiftObjectFromSchema(schema, context);
    }
    if (isSchemaFormElements(schema)) {
        return swiftArrayFromSchema(schema, context);
    }
    if (isSchemaFormValues(schema)) {
        return swiftDictionaryFromSchema(schema, context);
    }
    if (isSchemaFormDiscriminator(schema)) {
        return swiftTaggedUnionFromSchema(schema, context);
    }
    if (isSchemaFormRef(schema)) {
        return swiftRefFromSchema(schema, context);
    }
    return swiftAnyFromSchema(schema, context);
}
