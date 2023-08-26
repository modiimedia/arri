import {
    type Router,
    eventHandler,
    isPreflightRequest,
    getValidatedQuery,
    readValidatedBody,
    send,
    type H3Event,
    setResponseHeader,
} from "h3";
import { type RpcHandlerContext, type ArriProcedure } from "./arri-rpc";
import { type Static, type TSchema } from "@sinclair/typebox";
import { Value, type ValueError } from "@sinclair/typebox/value";
import { defineRpcError } from "./errors";

export function registerRpc(
    router: Router,
    path: string,
    procedure: ArriProcedure<any, any, any>,
    middleware: RpcMiddleware[]
) {
    const handler = eventHandler(async (event) => {
        let params: RpcHandlerContext["params"] = {};
        if (isPreflightRequest(event)) {
            return "ok";
        }
        if (middleware.length) {
            await Promise.all(middleware.map((m) => m(event)));
        }
        if (procedure.params) {
            switch (procedure.method) {
                case "get":
                case "head": {
                    const parsedParams = await getValidatedQuery(
                        event,
                        typeboxSafeValidate(procedure.params, true)
                    );
                    if (!parsedParams.success) {
                        const errorParts: string[] = [];
                        for (const err of parsedParams.errors) {
                            const propName = err.path.split("/");
                            propName.shift();
                            if (!errorParts.includes(propName.join("."))) {
                                errorParts.push(propName.join("."));
                            }
                        }
                        throw defineRpcError(400, {
                            statusMessage: `Missing or invalid url query parameters: [${errorParts.join(
                                ","
                            )}]`,
                            data: parsedParams.errors,
                        });
                    }
                    params = parsedParams.value;
                    break;
                }

                case "delete":
                case "patch":
                case "post":
                case "put": {
                    const parsedParams = await readValidatedBody(
                        event,
                        typeboxSafeValidate(procedure.params)
                    );
                    if (!parsedParams.success) {
                        throw defineRpcError(400, {
                            statusMessage: "Invalid request body",
                            data: parsedParams.errors,
                        });
                    }
                    params = parsedParams.value;
                    break;
                }
                default:
                    break;
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        const response = await procedure.handler({ params, event });
        if (typeof response === "object") {
            setResponseHeader(event, "Content-Type", "application/json");
            await send(event, JSON.stringify(response));
        } else {
            await send(event, response);
        }
        if (procedure.postHandler) {
            await procedure.postHandler({ params, response, event });
        }
        return null;
    });
    switch (procedure.method) {
        case "get":
            router.get(path, handler);
            break;
        case "head":
            router.head(path, handler);
            break;
        case "delete":
            router.delete(path, handler);
            break;
        case "patch":
            router.patch(path, handler);
            break;
        case "post":
            router.post(path, handler);
            break;
        case "put":
            router.put(path, handler);
            break;
    }
}

export type RpcMiddleware = (event: H3Event) => any | Promise<any>;
export const defineRpcMiddleware = (middleware: RpcMiddleware) => middleware;

function typeboxSafeValidate<T extends TSchema>(schema: T, coerce = false) {
    const fn = (
        input: any
    ):
        | { success: true; value: Static<T> }
        | { success: false; errors: ValueError[] } => {
        const finalInput = coerce ? Value.Convert(schema, input) : input;
        if (Value.Check(schema, finalInput)) {
            return { success: true, value: finalInput as Static<T> };
        }
        const errs = [...Value.Errors(schema, finalInput)];
        return {
            success: false,
            errors: errs,
        };
    };
    return fn;
}
