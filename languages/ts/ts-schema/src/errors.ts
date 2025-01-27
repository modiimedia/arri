export interface ValueError {
    /**
     * Error message
     */
    message: string;
    /**
     * A JSON Pointer ([RFC 6901](https://datatracker.ietf.org/doc/html/rfc6901)) pointing to where in the input is invalid
     */
    instancePath: string;
    /**
     * A JSON Pointer ([RFC 6901](https://datatracker.ietf.org/doc/html/rfc6901)) pointing to the part of the schema that rejected the input
     */
    schemaPath?: string;
    /**
     * Arbitrary data that can be included with the error
     */
    data?: any;
}

export function isValueError(input: unknown): input is ValueError {
    if (typeof input !== 'object' || !input) {
        return false;
    }
    return (
        'message' in input &&
        typeof input.message === 'string' &&
        (typeof (input as any).instancePath === 'undefined' ||
            typeof (input as any).instancePath === 'string') &&
        (typeof (input as any).schemaPath === 'undefined' ||
            typeof (input as any).schemaPath === 'string')
    );
}

export function errorMessageFromErrors(errors: ValueError[]) {
    if (errors.length === 0) {
        return `Input failed validation`;
    }
    if (errors.length === 1) {
        return errors[0]!.message;
    }
    let propStr = '[';
    for (let i = 0; i < errors.length; i++) {
        const err = errors[i]!;
        if (i > 0) {
            propStr += ', ';
        }
        propStr += err.instancePath;
    }
    propStr += ']';
    return `Invalid input. Affected properties ${propStr}.`;
}

export class ValidationException extends Error {
    errors: ValueError[];

    constructor(options: { message?: string; errors: ValueError[] }) {
        super(options.message ?? errorMessageFromErrors(options.errors));
        this.errors = options.errors;
    }
}

export function isValidationException(
    input: unknown,
): input is ValidationException {
    return input instanceof ValidationException;
}

export type Result<T> = ResultSuccess<T> | ResultFailure;
export type ResultSuccess<T> = { success: true; value: T };
export type ResultFailure = { success: false; errors: ValueError[] };
