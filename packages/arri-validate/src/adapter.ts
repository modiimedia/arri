import {
    isASchema,
    type ASchema,
    type SchemaValidator,
    SCHEMA_METADATA,
    type SchemaMetadata,
} from "./schemas";

export interface AAdaptedSchemaValidator<T> extends SchemaValidator<T> {
    _isAdaptedSchema: true;
}

export interface AAdaptedSchemaMetadata<T> extends SchemaMetadata<T> {
    [SCHEMA_METADATA]: AAdaptedSchemaValidator<T>;
}

export interface AAdaptedSchema<T> extends ASchema<T> {
    metadata: AAdaptedSchemaMetadata<T>;
}

export function isAAdaptedSchema<T = any>(
    input: unknown,
): input is AAdaptedSchema<T> {
    return (
        isASchema(input) &&
        "_isAdaptedSchema" in input.metadata[SCHEMA_METADATA] &&
        input.metadata[SCHEMA_METADATA]._isAdaptedSchema === true
    );
}

export type ValidationAdapter = <T>(input: any) => AAdaptedSchema<T>;
