import {
    Type,
    type TObject,
    type Static,
    type TSchema,
} from "@sinclair/typebox";
import type { H3Event, RouterMethod } from "h3";

const RpcMethods = ["get", "post", "put", "patch", "delete", "head"] as const;

export type RpcMethod = (typeof RpcMethods)[number];

export const isRpcMethod = (input: any): input is RpcMethod => {
    if (typeof input !== "string") {
        return false;
    }
    return RpcMethods.includes(input as any);
};

export interface ArriService {
    id: string;
    procedures: Record<string, any>;
}

interface RpcHandlerContext<TParams = any> {
    event: H3Event;
    params: TParams;
}

export interface ArriProcedureBase {
    method: RpcMethod;
    params?: any;
    response?: any;
    handler: (context: any) => any;
    postHandler?: () => any;
}

export interface ArriProcedure<
    TParams extends TObject | undefined,
    TResponse extends TSchema | undefined,
    TFallbackResponse = any
> extends ArriProcedureBase {
    method: RpcMethod;
    params?: TParams;
    response?: TResponse;
    handler: (
        context: RpcHandlerContext<
            Static<TParams extends TSchema ? TParams : any>
        >
    ) => TResponse extends TSchema
        ?
              | Static<TResponse extends TSchema ? TResponse : any>
              | Promise<Static<TResponse extends TSchema ? TResponse : any>>
        : TFallbackResponse;
    postHandler?: () => any;
}

export function isRpc(input: any): input is ArriProcedure<any, any> {
    if (typeof input !== "object") {
        return false;
    }
    const anyInput = input as Record<string, any>;
    if (!isRpcMethod(anyInput.method)) {
        return false;
    }
    if (typeof anyInput.handler !== "function") {
        return false;
    }
    return true;
}

export function defineRpc<
    TParams extends TObject,
    TResponse extends TSchema = any
>(
    config: Omit<ArriProcedure<TParams, TResponse>, "id">
): ArriProcedure<TParams, TResponse> {
    return { ...config };
}

export function defineService<TRpcMap extends Record<string, any>>(
    id: string,
    procedures: TRpcMap
) {
    return {
        id,
        procedures,
    };
}

export const getUser = defineRpc({
    method: "get",
    params: Type.Object({
        userId: Type.String(),
        isAdmin: Type.Boolean(),
    }),
    response: Type.Object({
        id: Type.String(),
        isAdmin: Type.Boolean(),
        isNotAdmin: Type.Optional(Type.Boolean()),
    }),
    async handler({ params }) {
        return {
            id: params.userId,
            isAdmin: params.isAdmin,
        };
    },
});

export interface ProcessedArriProcedure<TParams = any, TResponse = any> {
    id: string;
    method: RouterMethod;
    path: string;
    params: TParams;
    response: TResponse;
}
