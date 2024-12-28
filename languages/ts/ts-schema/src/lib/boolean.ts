import {
    type AScalarSchema,
    type ASchemaOptions,
    SCHEMA_METADATA,
    type ValidationContext,
} from '../schemas';

/**
 * @example
 * const Schema = a.boolean();
 * a.validate(Schema, true) // true;
 * a.validate(Schema, false) // true;
 */
export function boolean(
    opts: ASchemaOptions = {},
): AScalarSchema<'boolean', boolean> {
    return {
        type: 'boolean',
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
            [SCHEMA_METADATA]: {
                output: false,
                parse,
                validate,
                serialize,
                coerce(input, context) {
                    if (validate(input)) {
                        return input;
                    }
                    switch (input) {
                        case 'true':
                        case 'TRUE':
                        case '1':
                        case 1:
                            return true;
                        case 'false':
                        case 'FALSE':
                        case '0':
                        case 0:
                            return false;
                        default:
                            break;
                    }
                    context.errors.push({
                        instancePath: context.instancePath,
                        schemaPath: context.schemaPath,
                        message: `Error at ${
                            context.instancePath
                        }. Unable to coerce ${input as any} to boolean.`,
                    });
                    return undefined;
                },
            },
        },
    };
}

function validate(input: unknown): input is boolean {
    return typeof input === 'boolean';
}
function parse(input: unknown, data: ValidationContext): boolean | undefined {
    if (validate(input)) {
        return input;
    }
    if (data.instancePath.length === 0 && typeof input === 'string') {
        if (input === 'true') {
            return true;
        }
        if (input === 'false') {
            return false;
        }
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: `${data.schemaPath}/type`,
            message: `Error at ${
                data.instancePath
            }. Expected boolean. Got ${typeof input}.`,
        });
        return undefined;
    }

    data.errors.push({
        instancePath: data.instancePath,
        schemaPath: `${data.schemaPath}/type`,
        message: `Error at ${
            data.instancePath
        }. Expected boolean. Got ${typeof input}.`,
    });
    return undefined;
}
function serialize(input: boolean) {
    return `${input}`;
}
