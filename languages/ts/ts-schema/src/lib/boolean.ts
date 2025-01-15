import * as UValidator from '@arrirpc/schema-interface';

import {
    createStandardSchemaProperty,
    createUValidatorProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    type AScalarSchema,
    type ASchemaOptions,
    SchemaValidator,
    type ValidationContext,
    ValidationsKey,
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
    const validator: SchemaValidator<boolean> = {
        output: false,
        decode: parse,
        validate,
        encode: serialize,
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
    };
    const result: AScalarSchema<'boolean', boolean> = {
        type: 'boolean',
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
        },
        [ValidationsKey]: validator,
        [UValidator.v1]: createUValidatorProperty(validator),
        '~standard': createStandardSchemaProperty(validate, parse),
    };
    hideInvalidProperties(result);
    return result;
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
