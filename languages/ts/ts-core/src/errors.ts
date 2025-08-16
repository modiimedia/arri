export interface ArriErrorBase {
    code: number;
    message: string;
    get data(): any | undefined;
    get trace(): string[] | undefined;
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

export class ArriError extends Error implements ArriErrorBase {
    code: number;
    private body?: string;
    private hasParsedBody = false;
    private rawData?: any;
    private rawTrace?: string[];

    constructor(config: { code: number; message: string; body?: string }) {
        super(config.message);
        this.code = config.code;
        this.body = config.body;
    }

    private parseBody() {
        if (!this.body) {
            this.hasParsedBody = true;
            return;
        }
        try {
            const parsed = JSON.parse(this.body) as unknown;
            if (typeof parsed !== 'object' || !parsed) {
                this.hasParsedBody = true;
                return;
            }
            if ('data' in parsed) {
                this.rawData = parsed.data;
            }
            if (
                'trace' in parsed &&
                Array.isArray(parsed.trace) &&
                parsed.trace.every((item) => typeof item === 'string')
            ) {
                this.rawTrace = parsed.trace;
            }
        } catch (err) {
            console.error(`Unable to parse arri error body`, err);
        }
        this.hasParsedBody = true;
    }

    get data(): any | undefined {
        if (!this.hasParsedBody) this.parseBody();
        return this.rawData;
    }

    get trace(): string[] | undefined {
        if (!this.hasParsedBody) this.parseBody();
        return this.rawTrace;
    }

    static async fromHTTPResponse(input: Response): Promise<ArriError> {
        let code = Number.parseInt(input.headers.get('err-code') ?? '0');
        let msg = input.headers.get('err-msg') ?? '';
        try {
            const body = await input.text();
            return new ArriError({
                code: code,
                message: msg,
                body: body,
            });
        } catch (_) {
            let body: string | undefined;
            try {
                body = await input.text();
            } catch (_) {
                // do nothing
            }
            return new ArriError({
                code: code,
                message: msg,
                body: body,
            });
        }
    }
}
