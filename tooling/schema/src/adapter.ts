import {
    type ADiscriminatorSchema,
    type AObjectSchema,
    type ARecordSchema,
    type ASchema,
    isASchema,
    SCHEMA_METADATA,
    type SchemaMetadata,
    type SchemaValidator,
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

export interface AAdaptedObjectSchema<T> extends AObjectSchema<T> {
    metadata: AAdaptedSchemaMetadata<T>;
}

export interface AAdaptedRecordSchema<T> extends ARecordSchema<ASchema<T>> {
    metadata: AAdaptedSchemaMetadata<Record<string, T>>;
}

export interface AAdaptedDiscriminatorSchema<T>
    extends ADiscriminatorSchema<T> {
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
