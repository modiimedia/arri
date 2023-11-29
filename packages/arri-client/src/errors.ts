export interface ArriRequestError {
    statusCode: number;
    statusMessage: string;
    data?: any;
    stack?: string;
}

export function isArriRequestError(input: unknown): input is ArriRequestError {
    if (typeof input !== "object" || input === null) {
        return false;
    }
    return (
        "statusCode" in input &&
        typeof input.statusCode === "number" &&
        "statusMessage" in input &&
        typeof input.statusMessage === "string"
    );
}

export class ArriRequestErrorInstance
    extends Error
    implements ArriRequestError
{
    statusCode: number;
    statusMessage: string;
    data?: any;

    constructor(input: {
        statusCode: number;
        statusMessage: string;
        stack?: string;
        data?: any;
    }) {
        super(`ERROR ${input.statusCode}: ${input.statusMessage}`);
        this.statusCode = input.statusCode;
        this.statusMessage = input.statusMessage;
        this.data = input.data;
    }

    static fromJson(json: unknown) {
        let parsedJson = json;
        if (typeof parsedJson === "string") {
            try {
                parsedJson = JSON.parse(parsedJson);
            } catch (_) {}
        }
        if (typeof parsedJson !== "object" || parsedJson === null) {
            return new ArriRequestErrorInstance({
                statusCode: 500,
                statusMessage: "Unknown error",
                data: parsedJson,
            });
        }
        return new ArriRequestErrorInstance({
            statusCode:
                "statusCode" in parsedJson &&
                typeof parsedJson.statusCode === "number"
                    ? parsedJson.statusCode
                    : 500,
            statusMessage:
                "statusMessage" in parsedJson &&
                typeof parsedJson.statusMessage === "string"
                    ? parsedJson.statusMessage
                    : "",
            stack:
                "stack" in parsedJson && typeof parsedJson.stack === "string"
                    ? parsedJson.stack
                    : undefined,
            data: "data" in parsedJson ? parsedJson.data : undefined,
        });
    }
}
