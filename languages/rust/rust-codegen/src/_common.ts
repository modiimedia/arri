import path from "pathe";

export interface GeneratorContext {
    clientName: string;
    typeNamePrefix: string;
    instancePath: string;
    schemaPath: string;
    generatedTypes: string[];
    discriminatorKey?: string;
    discriminatorValue?: string;
}

export interface RustProperty {
    typeName: string;
    defaultValue: string;
    fromJsonTemplate: (input: string) => string;
    toJsonTemplate: (input: string, target: string) => string;
    toQueryStringTemplate: (
        input: string,
        target: string,
        key: string,
    ) => string;
}

export const tmpDir = path.resolve(__dirname, "../.temp");
