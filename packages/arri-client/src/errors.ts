export interface ArriError {
    code: number;
    message: string;
    data?: any;
    stack?: string;
}

export function isArriError(input: unknown): input is ArriError {
    if (typeof input !== "object" || input === null) {
        return false;
    }
    return (
        "code" in input &&
        typeof input.code === "number" &&
        "message" in input &&
        typeof input.message === "string"
    );
}

export class ArriErrorInstance extends Error implements ArriError {
    code: number;
    data?: any;
    private readonly _internalMessage: string;

    constructor(input: {
        code: number;
        message: string;
        stack?: string;
        data?: any;
    }) {
        super(`ERROR ${input.code}: ${input.message}`);
        this.code = input.code;
        this._internalMessage = input.message;
        this.data = input.data;
        if (input.stack) {
            super.stack = input.stack;
        }
    }

    toJSON() {
        return {
            code: this.code,
            message: this._internalMessage,
            stack: this.stack?.split("\n").map((l) => l.trim()),
            data: this.data,
        };
    }

    static fromJson(json: unknown) {
        let parsedJson = json;
        if (typeof parsedJson === "string") {
            try {
                parsedJson = JSON.parse(parsedJson);
            } catch (_) {}
        }
        if (typeof parsedJson !== "object" || parsedJson === null) {
            return new ArriErrorInstance({
                code: 500,
                message: "Unknown error",
                data: parsedJson,
            });
        }
        return new ArriErrorInstance({
            code:
                "code" in parsedJson && typeof parsedJson.code === "number"
                    ? parsedJson.code
                    : 500,
            message:
                "message" in parsedJson &&
                typeof parsedJson.message === "string"
                    ? parsedJson.message
                    : "",
            stack:
                "stack" in parsedJson && Array.isArray(parsedJson.stack)
                    ? parsedJson.stack.join("\n")
                    : undefined,
            data: "data" in parsedJson ? parsedJson.data : undefined,
        });
    }
}
