import * as UValidator from '@arrirpc/schema-interface';

import {
    createStandardSchemaProperty,
    createUValidatorProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    type AScalarSchema,
    type ASchemaOptions,
    type ValidationContext as ValidationContext,
    ValidationsKey,
} from '../schemas';

/**
 * @example
 * const StringSchema = a.string();
 * a.validate(StringSchema, "hello world") // true
 * a.validate(StringSchema, 10) // false
 */
export function string(
    opts: ASchemaOptions = {},
): AScalarSchema<'string', string> {
    const validator: AScalarSchema<'string', string>[typeof ValidationsKey] = {
        output: '',
        decode: decode,
        coerce,
        validate,
        encode(input, context) {
            if (context.instancePath.length === 0) {
                return input;
            }
            if (input.length < 42) {
                return serializeSmallString(input);
            }
            if (input.length < 5000 && !STR_ESCAPE.test(input)) {
                return `"${input}"`;
            }
            return JSON.stringify(input);
        },
    };
    const result: AScalarSchema<'string', string> = {
        type: 'string',
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
        },
        [ValidationsKey]: validator,
        [UValidator.v1]: createUValidatorProperty(validator),
        '~standard': createStandardSchemaProperty<string>(validate, decode),
    };
    hideInvalidProperties(result);
    return result;
}

export function serializeString(input: string) {
    if (input.length < 42) {
        return serializeSmallString(input);
    }
    if (input.length < 5000 && !STR_ESCAPE.test(input)) {
        return `"${input}"`;
    }
    return JSON.stringify(input);
}

function validate(input: unknown): input is string {
    return typeof input === 'string';
}

function decode(input: unknown, context: ValidationContext) {
    if (validate(input)) {
        return input;
    }
    context.errors.push({
        instancePath: context.instancePath,
        schemaPath: `${context.schemaPath}/type`,
        message: `Error at ${
            context.instancePath
        }. Expected 'string' got ${typeof input}.`,
    });
    return undefined;
}

function coerce(input: unknown, context: ValidationContext) {
    return decode(input, context);
}

// Everything below was taken from https://github.com/fastify/fast-json-stringify in "./lib/serializer.js"
// I was having trouble figuring out a performant way to check if string values need escaping and fortunately they've already solved it.
export const STR_ESCAPE =
    // eslint-disable-next-line no-control-regex
    /[\u0000-\u001f\u0022\u005c\ud800-\udfff]|[\ud800-\udbff](?![\udc00-\udfff])|(?:[^\ud800-\udbff]|^)[\udc00-\udfff]/;
export function serializeSmallString(input: string) {
    const len = input.length;
    let result = '';
    let last = -1;
    let point = 255;

    for (let i = 0; i < len; i++) {
        point = input.charCodeAt(i);
        if (point < 32 || (point >= 0xd800 && point <= 0xdfff)) {
            // The current character is non-printable characters or a surrogate.
            return JSON.stringify(input);
        }
        if (
            point === 0x22 || // '"'
            point === 0x5c // '\'
        ) {
            if (last === -1) {
                last = 0;
            }
            result += input.slice(last, i) + '\\';
            last = i;
        }
    }
    if (last === -1) {
        return `"${input}"`;
    }
    return `"${result}${input.slice(last)}"`;
}
