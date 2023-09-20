import { type ASchema, SCHEMA_METADATA, type ASchemaOptions } from "../schemas";

export function any(options: ASchemaOptions = {}): ASchema<any> {
    return {
        metadata: {
            id: options.id,
            description: options.description,
            [SCHEMA_METADATA]: {
                output: undefined as any,
                parse: (input, _) => input,
                coerce: (input, _) => input,
                validate: (input): input is any => true,
                serialize: (input) => JSON.stringify(input),
            },
        },
    };
}
