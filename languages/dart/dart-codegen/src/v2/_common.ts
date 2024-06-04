import { Schema } from "@arrirpc/codegen-utils";

export interface CodegenContext {
    clientName: string;
    modelPrefix: string;
    generatedTypes: string[];
    instancePath: string;
    schemaPath: string;
    isOptional?: boolean;
    discriminatorParentId?: string;
    discriminatorValue?: string;
    discriminatorKey?: string;
}

export interface DartProperty {
    typeName: string;
    isNullable: boolean;
    content: string;
    defaultValue: string;
    fromJson: (input: string, key?: string) => string;
    toJson: (input: string, target: string, key: string) => string;
    toQueryString: (input: string, target: string, key: string) => string;
}

export function outputIsNullable(schema: Schema, context: CodegenContext) {
    if (schema.nullable) {
        return true;
    }
    if (context.isOptional) {
        return true;
    }
    return false;
}
