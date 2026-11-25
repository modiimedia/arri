import { ArriHeaders, ErrorCode, ErrorMessage } from '@arrirpc/core';

import { textEncoder } from './utils';

interface ArriErrorOptions {
    message?: string;
    data?: any;
}

export class ArriError extends Error {
    code: ErrorCode;
    data?: any;
    includeTrace: boolean = false;
    constructor(code: ErrorCode, options: ArriErrorOptions = {}) {
        super(options.message ?? `${code}`);
        this.code = code;
        this.data = options.data;
    }

    toMessage(options: { reqId?: string; contentType?: string }): ErrorMessage {
        const headers = new ArriHeaders();
        const body = JSON.stringify(this);
        return {
            type: 'ERROR',
            headers: headers,
            reqId: options.reqId,
            contentType: options.contentType,
            body: textEncoder.encode(body),
        };
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message,
            data: this.data,
            trace: this.includeTrace ? this.stack?.split('\n') : undefined,
        };
    }

    static fromUnknown(err: unknown): ArriError {
        if (err instanceof Error) {
            return new ArriError('UNKNOWN', {
                message: err.message,
                data: err,
            });
        }
        return new ArriError('UNKNOWN', {
            message: `unknown error`,
            data: err,
        });
    }
}

export function defineError(
    code: ErrorCode,
    options?: ArriErrorOptions,
): ArriError {
    return new ArriError(code, options);
}
