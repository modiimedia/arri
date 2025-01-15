export interface ValueError {
    message: string;
    instancePath?: string;
    schemaPath?: string;
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

export class ValidationException extends Error {
    errors: ValueError[];

    constructor(options: { message: string; errors: ValueError[] }) {
        super(options.message);
        this.errors = options.errors;
    }
}

export function isValidationException(
    input: unknown,
): input is ValidationException {
    return input instanceof ValidationException;
}
