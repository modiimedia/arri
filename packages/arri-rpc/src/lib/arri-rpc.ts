import { z, type AnyZodObject } from "zod";
import type { H3Event, RouterMethod } from "h3";

export interface ArriService {
    id: string;
    procedures: Record<string, any>;
}

interface RpcHandlerContext<TParams extends Record<any, any> = any> {
    event: H3Event;
    params: TParams;
}

export interface ArriProcedureBase {
    method: Lowercase<RouterMethod>;
    params?: any;
    output?: any;
    handler: (context: any) => any;
    postHandler?: () => any;
}

export interface ArriProcedure<TParams extends AnyZodObject, TResponse = any>
    extends ArriProcedureBase {
    method: Lowercase<RouterMethod>;
    params?: TParams;
    output?: TResponse;
    handler: (
        context: RpcHandlerContext<TParams["_output"]>
    ) => TResponse | Promise<TResponse>;
    postHandler?: () => any;
}

export function defineRpc<TParams extends AnyZodObject, TResponse = any>(
    config: Omit<ArriProcedure<TParams, TResponse>, "id">
): ArriProcedure<TParams, TResponse> {
    return { ...config };
}

export function defineService(id: string, procedures: Record<string, any>) {
    return {
        id,
        procedures,
    };
}

const getUser = defineRpc({
    method: "get",
    params: z.object({
        userId: z.string(),
        isAdmin: z.boolean(),
    }),
    async handler({ params }) {},
});

const updateUser = defineRpc({
    method: "post",
    params: z.object({
        userId: z.string(),
    }),
    handler() {},
});

defineService("users", {
    getUser,
    updateUser,
});
