import { validate, a } from "arri-validate";
import { ofetch } from "ofetch";

export { createRawJtdValidator } from "arri-validate";

export interface ArriRequestOpts<
    T,
    P extends Record<any, any> | undefined = undefined,
> {
    url: string;
    method: string;
    headers?: any;
    params?: P;
    parser: (input: string) => T;
    serializer: (input: P) => P extends undefined ? undefined : string;
}

export async function arriRequest<
    T,
    P extends Record<any, any> | undefined = undefined,
>(opts: ArriRequestOpts<T, P>): Promise<T> {
    let url = opts.url;
    let body: undefined | string;
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
            }
            break;
    }
    const result = await ofetch<T>(url, {
        method: opts.method,
        body,
        headers: { ...opts.headers, "Content-Type": "application/json" },
        parseResponse: opts.parser,
    });
    return result;
}

export async function arriSafeRequest<
    T,
    P extends Record<any, any> | undefined = undefined,
>(opts: ArriRequestOpts<T, P>): Promise<SafeResponse<T>> {
    try {
        const result = await arriRequest<T, P>(opts);
        return {
            success: true,
            value: result,
        };
    } catch (err) {
        if (validate({} as any, err)) {
            return {
                success: false,
                error: err,
            };
        }
        return {
            success: false,
            error: {
                name: "UNKNOWN",
                statusCode: 400,
                statusMessage: "Unknown error",
                data: err,
            } satisfies ArriRequestError,
        };
    }
}

export const ArriRequestError = a.object({
    name: a.string(),
    statusCode: a.int8(),
    statusMessage: a.string(),
    data: a.optional(a.any()),
});

export type ArriRequestError = a.infer<typeof ArriRequestError>;

export type SafeResponse<T> =
    | {
          success: true;
          value: T;
      }
    | { success: false; error: ArriRequestError };
