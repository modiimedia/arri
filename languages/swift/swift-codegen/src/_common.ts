import { Schema } from "@arrirpc/codegen-utils";

export interface GeneratorContext {
    clientVersion: string;
    clientName: string;
    typePrefix: string;
    instancePath: string;
    schemaPath: string;
    generatedTypes: string[];
    discriminatorKey?: string;
    discriminatorValue?: string;
    isOptional?: boolean;
}

export interface SwiftProperty {
    typeName: string;
    defaultValue: string;
    isNullable: boolean;
    fromJsonTemplate: (input: string, target: string) => string;
    toJsonTemplate: (input: string, target: string) => string;
    toQueryStringTemplate: (
        input: string,
        target: string,
        key: string,
    ) => string;
    content: string;
}

export function isNullableType(
    schema: Schema,
    context: GeneratorContext,
): boolean {
    return schema.nullable === true || context.isOptional === true;
}
