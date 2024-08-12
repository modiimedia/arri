import { pascalCase, Schema } from "@arrirpc/codegen-utils";

export interface GeneratorContext {
    clientVersion: string;
    clientName: string;
    typePrefix: string;
    instancePath: string;
    schemaPath: string;
    generatedTypes: string[];
    discriminatorParent?: string;
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

export function getTypeName(schema: Schema, context: GeneratorContext): string {
    if (schema.metadata?.id) {
        const typeName = pascalCase(schema.metadata.id, { normalize: true });
        return typeName;
    }
    if (context.discriminatorParent && context.discriminatorValue) {
        const typeName = pascalCase(
            `${context.discriminatorParent}_${context.discriminatorValue}`,
            { normalize: true },
        );
        return typeName;
    }
    const typeName = pascalCase(context.instancePath.split("/").join("_"), {
        normalize: true,
    });
    return typeName;
}
