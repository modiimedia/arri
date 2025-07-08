import { serializeString } from '@arrirpc/schema';

import { Result } from './helpers';

export interface ArriErrorBase {
    code: number;
    message: string;
    data?: any;
    stack?: string[];
}

export function isArriErrorBase(input: unknown): input is ArriErrorBase {
    if (typeof input !== 'object' || input === null) {
        return false;
    }
    if (
        'stack' in input &&
        typeof input.stack !== 'undefined' &&
        (!Array.isArray(input.stack) ||
            !input.stack.every((val) => typeof val === 'string'))
    ) {
        return false;
    }
    return (
        'code' in input &&
        typeof input.code === 'number' &&
        'message' in input &&
        typeof input.message === 'string'
    );
}

export class ArriError extends Error {
    code: number;
    data?: any;
    stackList?: string[];

    constructor(config: {
        code: number;
        message: string;
        stackList?: string[];
        data?: any;
    }) {
        super(config.message);
        this.code = config.code;
        this.data = config.data;
        this.stackList = config.stackList ?? this.stack?.split('\n');
    }

    toJSON() {
        let output = '{';
        output += `'"code":${this.code}`;
        output += `,"message":${serializeString(this.message)}`;
        if (this.data) output += `,"data":${JSON.stringify(this.data)}`;
        output += '}';
        return output;
    }

    static fromJSON(input: Map<string, unknown>) {
        return parseArriError(input);
    }

    static fromJSONString(input: string) {
        return parseArriError(JSON.parse(input));
    }

    static async fromHTTPResponse(input: Response): Promise<ArriError> {
        try {
            const body = await input.json();
            const result = ArriError.fromJSON(body);
            if (!result.success) {
                return new ArriError({
                    code: input.status,
                    message: input.statusText,
                    data: body,
                });
            }
            return result.value;
        } catch (_) {
            let data: string | undefined;
            try {
                data = await input.text();
            } catch (_) {
                // do nothing
            }
            return new ArriError({
                code: input.status,
                message: input.statusText,
                data: data,
            });
        }
    }
}

export function serializeArriError(
    error: ArriError,
    includeStack: boolean,
): string {
    let output = '{';
    output += `"code":${error.code}`;
    output += `,"message":${serializeString(error.message)}`;
    if (error.data) output += `,"data":${JSON.stringify(error.data)}`;
    if (includeStack) output += `,"stack":${JSON.stringify(error.stackList)}`;
    output += '}';
    return output;
}

export function parseArriError(
    input: Record<any, any>,
): Result<ArriError, string> {
    const code = input['code'];
    const message = input['message'];
    const data = input['data'];
    const stack = input['stack'];
    if (typeof code !== 'number') {
        return {
            success: false,
            error: 'code is a required field',
        };
    }
    if (typeof message !== 'string') {
        return {
            success: false,
            error: 'message is a required field',
        };
    }
    if (
        typeof stack !== 'undefined' &&
        (!Array.isArray(stack) ||
            !stack.every((input) => typeof input === 'string'))
    ) {
        return {
            success: false,
            error: 'stack must be an array of strings',
        };
    }
    return {
        success: true,
        value: new ArriError({
            code: code,
            message: message,
            data: data,
            stackList: stack,
        }),
    };
}
