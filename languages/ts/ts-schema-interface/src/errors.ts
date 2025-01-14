export interface ValueError {
    instancePath: string;
    schemaPath?: string;
    message?: string;
    data?: any;
}

export function isValueError(input: unknown): input is ValueError {
    if (typeof input !== 'object' || !input) {
        return false;
    }
    return (
        'instancePath' in input &&
        typeof input.instancePath === 'string' &&
        (typeof (input as any).schemaPath === 'undefined' ||
            typeof (input as any).schemaPath === 'string') &&
        (typeof (input as any).message === 'undefined' ||
            typeof (input as any).message === 'string')
    );
}

export class ValidationError extends Error {
    errors: ValueError[];

    constructor(options: { message: string; errors: ValueError[] }) {
        super(options.message);
        this.errors = options.errors;
    }
}

export function isValidationError(input: unknown): input is ValidationError {
    if (typeof input !== 'object' || !input) {
        return false;
    }
    return (
        'message' in input &&
        typeof input.message === 'string' &&
        'errors' in input &&
        Array.isArray(input.errors)
    );
}
