import { ofetch } from "ofetch";
import { type Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import type { Serialize } from "nitropack";

export interface ArriRequestOpts {
    url: string;
    method: string;
    headers?: any;
    params?: any;
}

export async function arriRequest<T>(
    opts: ArriRequestOpts,
): Promise<Serialize<T>> {
    let url = opts.url;
    let body: undefined | any;
    switch (opts.method) {
        case "get":
        case "head":
            if (typeof opts.params === "object") {
                const urlParts: string[] = [];
                Object.keys(opts.params).forEach((key) => {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    urlParts.push(`${key}=${opts.params[key]}`);
                });
                url = `${opts.url}?${urlParts.join("&")}`;
            }
            break;
        default:
            if (typeof opts.params === "object") {
                body = opts.params;
            }
            break;
    }
    const result = await ofetch<Serialize<T>>(url, {
        body,
        headers: opts.headers,
    });
    return result;
}

export async function arriSafeRequest<T>(
    opts: ArriRequestOpts,
): Promise<SafeResponse<Serialize<T>>> {
    try {
        const result = await arriRequest<T>(opts);
        return {
            success: true,
            value: result,
        };
    } catch (err) {
        if (Value.Check(ArriRequestError, err)) {
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

export const ArriRequestError = Type.Object({
    name: Type.String(),
    statusCode: Type.Number(),
    statusMessage: Type.String(),
    data: Type.Optional(Type.Any()),
});

export type ArriRequestError = Static<typeof ArriRequestError>;

export type SafeResponse<T> =
    | {
          success: true;
          value: T;
      }
    | { success: false; error: ArriRequestError };
