import {
    type Router,
    eventHandler,
    isPreflightRequest,
    getValidatedQuery,
    readValidatedBody,
    send,
    type H3Event,
} from "h3";
import { type RpcHandlerContext, type ArriProcedure } from "./arri-rpc";
import { type Static, type TSchema } from "@sinclair/typebox";
import { Value, type ValueError } from "@sinclair/typebox/value";
import { defineRpcError } from "./errors";

const typeboxSafeValidate = <T extends TSchema>(schema: T) => {
    const fn = (
        input: any
    ):
        | { success: true; value: Static<T> }
        | { success: false; errors: ValueError[] } => {
        if (Value.Check(schema, input)) {
            return { success: true, value: input as Static<T> };
        }
        const errs = [...Value.Errors(schema, input)];
        return {
            success: false,
            errors: errs,
        };
    };
    return fn;
};

export function registerProcedure(
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
                        typeboxSafeValidate(procedure.params)
                    );
                    if (!parsedParams.success) {
                        throw defineRpcError(400, {
                            message: `Missing or invalid url query parameters: [${parsedParams.errors
                                .map((err) => err.path)
                                .join(", ")}]`,
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
                            message: "Invalid request body",
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
        const response = await procedure.handler({ params, event });
        await send(event, response);
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

export function initializeProcedures(
    _router: Router,
    _middleware: RpcMiddleware[]
) {
    // Doesn't actually do anything we swap this out with the "registerProcedures"
    // function at build time
}

export function registerProcedures(
    router: Router,
    middleware: RpcMiddleware[],
    procedures: Record<string, ArriProcedure<any, any, any>>
) {
    Object.keys(procedures).forEach((key) => {
        registerProcedure(router, key, procedures[key], middleware);
    });
}

export type RpcMiddleware = (event: H3Event) => any | Promise<any>;
export const defineRpcMiddleware = (middleware: RpcMiddleware) => middleware;
