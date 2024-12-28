import { type ASchema, type ASchemaOptions, SCHEMA_METADATA } from '../schemas';

/**
 * Create a schema that accepts anything
 */
export function any(options: ASchemaOptions = {}): ASchema<any> {
    return {
        metadata: {
            id: options.id,
            description: options.description,
            isDeprecated: options.isDeprecated,
            [SCHEMA_METADATA]: {
                output: undefined as any,
                parse: (input, context) => {
                    if (
                        context.instancePath.length === 0 &&
                        typeof input === 'string'
                    ) {
                        try {
                            return JSON.parse(input);
                        } catch {
                            return input;
                        }
                    }
                    return input;
                },
                coerce: (input, context) => {
                    if (
                        context.instancePath.length === 0 &&
                        typeof input === 'string'
                    ) {
                        try {
                            return JSON.parse(input);
                        } catch {
                            return input;
                        }
                    }
                    return input;
                },
                validate: (input): input is any => true,
                serialize(input) {
                    return JSON.stringify(input);
                },
            },
        },
    };
}
