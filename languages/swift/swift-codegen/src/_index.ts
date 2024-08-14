import {
    AppDefinition,
    defineGeneratorPlugin,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormType,
    Schema,
} from "@arrirpc/codegen-utils";

import { GeneratorContext, SwiftProperty } from "./_common";
import { swiftAnyFromSchema } from "./any";
import { swiftArrayFromSchema } from "./array";
import { swiftEnumFromSchema } from "./enum";
import { swiftObjectFromSchema } from "./object";
import {
    swiftBooleanFromSchema,
    swiftLargeIntFromSchema,
    swiftNumberFromSchema,
    swiftStringFromSchema,
    swiftTimestampFromSchema,
} from "./primitives";

export interface SwiftClientGeneratorOptions {
    clientName: string;
    outputFile: string;
    typePrefix?: string;
}

export const swiftClientGenerator = defineGeneratorPlugin(
    (options: SwiftClientGeneratorOptions) => {
        return {
            async generator(def, _isDevServer) {
                const _content = createSwiftClient(def, options);
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
            console.log("HAS CONTENT", subType.content.length);
            typeContent.push(subType.content);
        }
    }
    return `

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
                    "floatValue",
                    "0.0",
                );
            case "float64":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "Float64",
                    "doubleValue",
                    "0.0",
                );
            case "int8":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "Int8",
                    "int8Value",
                    "0",
                );
            case "uint8":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "UInt8",
                    "uint8Value",
                    "0",
                );
            case "int16":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "Int16",
                    "int16Value",
                    "0",
                );
            case "uint16":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "UInt16",
                    "uint16Value",
                    "0",
                );
            case "int32":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "Int32",
                    "int32Value",
                    "0",
                );
            case "uint32":
                return swiftNumberFromSchema(
                    schema,
                    context,
                    "UInt32",
                    "uint32Value",
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
    return swiftAnyFromSchema(schema, context);
}
