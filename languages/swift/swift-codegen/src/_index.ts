import {
    AppDefinition,
    defineGeneratorPlugin,
    isSchemaFormType,
    Schema,
} from "@arrirpc/codegen-utils";

import { GeneratorContext, SwiftProperty } from "./_common";
import { swiftAnyFromSchema } from "./any";
import {
    swiftBooleanFromSchema,
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
            case "float64":
            case "int8":
            case "uint8":
            case "int16":
            case "uint16":
            case "int32":
            case "uint32":
            case "int64":
            case "uint64":
                break;
            default:
                schema.type satisfies never;
                break;
        }
    }
    return swiftAnyFromSchema(schema, context);
}
