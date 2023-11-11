import { ofetch, FetchError } from "ofetch";

export interface ArriRequestOpts<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
> {
    url: string;
    method: string;
    headers?: any;
    params?: TParams;
    parser: (input: Record<any, any>) => TType;
    serializer: (
        input: TParams,
    ) => TParams extends undefined ? undefined : string;
}

export async function arriRequest<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
>(opts: ArriRequestOpts<TType, TParams>): Promise<TType> {
    let url = opts.url;
    let body: undefined | string;
    let contentType: undefined | string;
    switch (opts.method) {
        case "get":
        case "head":
            if (opts.params && typeof opts.params === "object") {
                const urlParts: string[] = [];
                Object.keys(opts.params).forEach((key) => {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    urlParts.push(`${key}=${(opts.params as any)[key]}`);
                });
                url = `${opts.url}?${urlParts.join("&")}`;
            }
            break;
        default:
            if (opts.params && typeof opts.params === "object") {
                body = opts.serializer(opts.params);
                contentType = "application/json";
            }
            break;
    }
    try {
        const result = await ofetch(url, {
            method: opts.method,
            body,
            headers: { ...opts.headers, "Content-Type": contentType },
        });
        return opts.parser(result);
    } catch (err) {
        const error = err as any as FetchError;
        if (isArriRequestErrorResponse(error.data)) {
            throw new ArriRequestError(error.data);
        } else {
            throw new ArriRequestError({
                statusCode: error.statusCode ?? 500,
                statusMessage:
                    error.statusMessage ??
                    error.message ??
                    `Error connecting to ${url}`,
                data: error.data,
                stack: error.stack,
            });
        }
    }
}

export async function arriSafeRequest<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
>(opts: ArriRequestOpts<TType, TParams>): Promise<SafeResponse<TType>> {
    try {
        const result = await arriRequest<TType, TParams>(opts);
        return {
            success: true,
            value: result,
        };
    } catch (err) {
        if (err instanceof ArriRequestError) {
            return {
                success: false,
                error: err,
            };
        }
        if (err instanceof FetchError) {
            return {
                success: false,
                error: new ArriRequestError({
                    statusCode: err.statusCode ?? 0,
                    statusMessage: err.statusMessage ?? "",
                    stack: err.stack,
                    data: err.data,
                }),
            };
        }
        return {
            success: false,
            error: new ArriRequestError({
                statusCode: 500,
                statusMessage: `Unknown error connecting to ${opts.url}`,
                data: err,
            }),
        };
    }
}

export type SafeResponse<T> =
    | {
          success: true;
          value: T;
      }
    | { success: false; error: ArriRequestError };

export interface ArriRequestErrorResponse {
    statusCode: number;
    statusMessage: string;
    data?: any;
    stack?: string;
}

export function isArriRequestErrorResponse(
    input: unknown,
): input is ArriRequestErrorResponse {
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

export class ArriRequestError
    extends Error
    implements ArriRequestErrorResponse
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
        if (typeof json !== "object" || json === null) {
            return new ArriRequestError({
                statusCode: 500,
                statusMessage: "Unknown error",
            });
        }
        return new ArriRequestError({
            statusCode:
                "statusCode" in json && typeof json.statusCode === "number"
                    ? json.statusCode
                    : 500,
            statusMessage:
                "statusMessage" in json &&
                typeof json.statusMessage === "string"
                    ? json.statusMessage
                    : "",
            stack:
                "stack" in json && typeof json.stack === "string"
                    ? json.stack
                    : undefined,
            data: "data" in json ? json.data : undefined,
        });
    }
}
