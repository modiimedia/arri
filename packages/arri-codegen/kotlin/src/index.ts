import fs from "node:fs";
import {
    type AppDefinition,
    defineClientGeneratorPlugin,
} from "arri-codegen-utils";
import {
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormType,
    isSchemaFormValues,
    type Schema,
} from "jtd-utils";
import { kotlinAnyFromSchema } from "./any";
import {
    kotlinBooleanFromSchema,
    kotlinFloat32FromSchema,
    kotlinFloat64FromSchema,
    kotlinInt16FromSchema,
    kotlinInt32FromSchema,
    kotlinInt64FromSchema,
    kotlinInt8FromSchema,
    kotlinStringFromSchema,
    kotlinTimestampFromSchema,
    kotlinUint16FromSchema as kotlinUInt16FromSchema,
    kotlinUint32FromSchema as kotlinUInt32FromSchema,
    kotlinUint64FromSchema as kotlinUInt64FromSchema,
    kotlinUint8FromSchema as kotlinUInt8FromSchema,
} from "./primitives";

export interface ServiceContext {
    clientName: string;
    modelPrefix?: string;
    modelJsonInstances: Record<string, string>;
}

export interface KotlinClientOptions {
    clientName?: string;
    modelPrefix?: string;
    outputFile: string;
}

export const kotlinClientGenerator = defineClientGeneratorPlugin(
    (options: KotlinClientOptions) => {
        return {
            generator(def) {
                const client = kotlinClientFromDef(def, options);
                fs.writeFileSync(options.outputFile, client);
            },
            options,
        };
    },
);

// CLIENT GENERATION
export function kotlinClientFromDef(
    def: AppDefinition,
    options: KotlinClientOptions,
): string {}

export interface CodegenContext {
    modelPrefix: string;
    clientName: string;
    clientVersion: string;
    instancePath: string;
    schemaPath: string;
    existingTypeIds: string[];
    isOptional?: boolean;
    discriminatorKey?: string;
    discriminatorValue?: string;
}

export interface KotlinProperty {
    typeName: string;
    isNullable: boolean;
    content: string;
    defaultValue: string;
    fromJson: (input: string) => string;
    toJson: (input: string, target: string) => string;
    toQueryString: (input: string, target: string, key: string) => string;
}

export function kotlinTypeFromSchema(schema: Schema, context: CodegenContext) {
    if (isSchemaFormType(schema)) {
        switch (schema.type) {
            case "string":
                return kotlinStringFromSchema(schema, context);
            case "boolean":
                return kotlinBooleanFromSchema(schema, context);
            case "timestamp":
                return kotlinTimestampFromSchema(schema, context);
            case "float32":
                return kotlinFloat32FromSchema(schema, context);
            case "float64":
                return kotlinFloat64FromSchema(schema, context);
            case "int8":
                return kotlinInt8FromSchema(schema, context);
            case "int16":
                return kotlinInt16FromSchema(schema, context);
            case "int32":
                return kotlinInt32FromSchema(schema, context);
            case "int64":
                return kotlinInt64FromSchema(schema, context);
            case "uint8":
                return kotlinUInt8FromSchema(schema, context);
            case "uint16":
                return kotlinUInt16FromSchema(schema, context);
            case "uint32":
                return kotlinUInt32FromSchema(schema, context);
            case "uint64":
                return kotlinUInt64FromSchema(schema, context);
            default:
                schema.type satisfies never;
                throw new Error(`Unhandled schema.type case`);
        }
    }
    if (isSchemaFormEnum(schema)) {
        // TODO
    }
    if (isSchemaFormProperties(schema)) {
        // TODO
    }
    if (isSchemaFormElements(schema)) {
        // TODO
    }
    if (isSchemaFormValues(schema)) {
        // TODO
    }
    if (isSchemaFormDiscriminator(schema)) {
        // TODO
    }
    if (isSchemaFormRef(schema)) {
        // TODO
    }
    return kotlinAnyFromSchema(schema, context);
}
