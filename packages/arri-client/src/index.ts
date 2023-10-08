import { ofetch, type FetchError } from "ofetch";

export interface ArriRequestOpts<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
    TError extends Error = Error,
> {
    url: string;
    method: string;
    headers?: any;
    params?: TParams;
    parser: (input: Record<any, any>) => TType;
    errorParser: (input: Record<any, any>) => TError;
    serializer: (
        input: TParams,
    ) => TParams extends undefined ? undefined : string;
}

export async function arriRequest<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
    TError extends Error = Error,
>(opts: ArriRequestOpts<TType, TParams, TError>): Promise<TType> {
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
        const parsedError = opts.errorParser(error.data);
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw parsedError;
    }
}

export async function arriSafeRequest<
    TType,
    TParams extends Record<any, any> | undefined = undefined,
    TError extends Error = Error,
>(
    opts: ArriRequestOpts<TType, TParams, TError>,
): Promise<SafeResponse<TType, TError>> {
    try {
        const result = await arriRequest<TType, TParams>(opts);
        return {
            success: true,
            value: result,
        };
    } catch (err) {
        return {
            success: false,
            error: err as any as TError,
        };
    }
}

export type SafeResponse<T, E> =
    | {
          success: true;
          value: T;
      }
    | { success: false; error: E };
