import {
    type ASchema,
    type ASchemaOptions,
    SCHEMA_METADATA,
    ValidationContext,
} from '../schemas';
import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../standardSchema';

/**
 * Create a schema that accepts anything
 */
export function any(options: ASchemaOptions = {}): ASchema<any> {
    const validate = (input: unknown): input is any => true;
    const parse = (
        input: unknown,
        context: ValidationContext,
    ): any | undefined => {
        if (context.instancePath.length === 0 && typeof input === 'string') {
            try {
                return JSON.parse(input);
            } catch {
                return input;
            }
        }
        return input;
    };
    const result: ASchema<any> = {
        metadata: {
            id: options.id,
            description: options.description,
            isDeprecated: options.isDeprecated,
            [SCHEMA_METADATA]: {
                output: undefined as any,
                parse,
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
                validate,
                serialize(input) {
                    return JSON.stringify(input);
                },
            },
        },
        '~standard': createStandardSchemaProperty(validate, parse),
    };
    hideInvalidProperties(result);
    return result;
}
