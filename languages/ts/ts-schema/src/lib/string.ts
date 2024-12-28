import {
    type AScalarSchema,
    type ASchemaOptions,
    SCHEMA_METADATA,
    type ValidationContext as ValidationContext,
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
    return {
        type: 'string',
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
            [SCHEMA_METADATA]: {
                output: '',
                parse,
                coerce,
                validate,
                serialize(input, context) {
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
            },
        },
    };
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

function parse(input: unknown, context: ValidationContext) {
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
    return parse(input, context);
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
