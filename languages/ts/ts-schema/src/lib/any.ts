import * as UValidator from '@arrirpc/schema-interface';

import {
    createStandardSchemaProperty,
    createUValidatorProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    type ASchema,
    type ASchemaOptions,
    SchemaValidator,
    ValidationContext,
    ValidationsKey,
} from '../schemas';

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
    const validator: SchemaValidator<any> = {
        output: undefined as any,
        parse: parse,
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
    };
    const result: ASchema<any> = {
        metadata: {
            id: options.id,
            description: options.description,
            isDeprecated: options.isDeprecated,
        },
        [ValidationsKey]: validator,
        [UValidator.v1]: createUValidatorProperty(validator),
        '~standard': createStandardSchemaProperty(validate, parse),
    };
    hideInvalidProperties(result);
    return result;
}
