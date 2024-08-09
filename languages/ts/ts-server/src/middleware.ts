import { type H3Event } from "h3";

import { type MiddlewareEventContext } from "./context";

export interface MiddlewareEvent extends H3Event {
    context: MiddlewareEventContext;
}

export type Middleware = (event: MiddlewareEvent) => void | Promise<void>;
export const defineMiddleware = (middleware: Middleware) => middleware;

export type ExtractParam<Path, NextPart> = Path extends `:${infer Param}`
    ? Record<Param, string> & NextPart
    : NextPart;

export type ExtractParams<Path> = Path extends `${infer Segment}/${infer Rest}`
    ? ExtractParam<Segment, ExtractParams<Rest>>
    : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      ExtractParam<Path, {}>;
