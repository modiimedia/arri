import { once } from 'node:events';
import type { IncomingMessage, ServerResponse } from 'node:http';

import {
    ArriHeaders,
    DEFAULT_CONTENT_TYPE,
    type ErrorCode,
    isValidReqId,
    type ServerMessage,
} from '@arrirpc/core';
import { kebabCase } from 'scule';

import type { ArriServerCore } from './core';
import { hasStreamedInput, hasStreamedOutput } from './procedures';

export interface HttpAdapterOptions {
    rpcPath?: (rpcName: string) => string;
}

/**
 * Sketch of the HTTP binding (see /specifications/arri_rpc_http.md) for node:http.
 *
 * TODO: split calls for input and bidirectional streams, GET procedures, body size limits.
 */
export function createHttpHandler(
    core: ArriServerCore,
    options: HttpAdapterOptions = {},
) {
    const rpcPath = options.rpcPath ?? defaultRpcPath;
    let rpcNamesByPath: Map<string, string> | undefined;

    return async function handleHttpRequest(
        req: IncomingMessage,
        res: ServerResponse,
    ): Promise<void> {
        rpcNamesByPath ??= new Map(
            [...core.procedures.keys()].map((name) => [rpcPath(name), name]),
        );
        const response = new HttpResponseWriter(res);
        const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
        const rpcName = rpcNamesByPath.get(pathname);
        const procedure = rpcName ? core.procedures.get(rpcName) : undefined;
        if (req.method !== 'POST' || !rpcName || !procedure) {
            response.writeErrorResponse('PROCEDURE_NOT_FOUND', 'Not found.');
            return;
        }
        if (hasStreamedInput(procedure)) {
            response.writeErrorResponse(
                'UNIMPLEMENTED',
                'Input streams over HTTP (split calls) are not implemented yet.',
            );
            return;
        }

        let headers: ArriHeaders;
        try {
            headers = toArriHeaders(req);
        } catch (err) {
            response.writeErrorResponse(
                'PROTOCOL_ERROR',
                err instanceof Error ? err.message : 'Invalid headers.',
            );
            return;
        }
        const reqId = singleHeader(req, 'req-id') ?? ASSIGNED_REQ_ID;
        if (!isValidReqId(reqId)) {
            response.writeErrorResponse(
                'PROTOCOL_ERROR',
                `Invalid req-id "${reqId}".`,
            );
            return;
        }
        const body = await readBody(req);

        const connection = core.openConnection({
            info: {
                name: 'http',
                remoteAddress: req.socket.remoteAddress,
                raw: req,
            },
            connectionMessages: hasStreamedOutput(procedure),
            send: (msg) => response.write(msg),
            close: () => res.end(),
        });
        res.on('close', () => connection.closed());

        // text/event-stream is the binding's framing, not the content type of the stream items
        const accept = hasStreamedOutput(procedure)
            ? undefined
            : singleHeader(req, 'accept');
        connection.receive({
            type: 'INVOCATION',
            rpcName,
            reqId,
            contentType: singleHeader(req, 'content-type'),
            accept,
            clientVersion: singleHeader(req, 'client-version'),
            lastMsgId: singleHeader(req, 'last-event-id'),
            headers,
            body: body.length > 0 ? body : undefined,
        });
    };
}

// Each HTTP request is its own connection, so the request ID only has to be unique within that request.
const ASSIGNED_REQ_ID = '1';

function defaultRpcPath(rpcName: string): string {
    return (
        '/' +
        rpcName
            .split('.')
            .map((part) => kebabCase(part))
            .join('/')
    );
}

class HttpResponseWriter {
    constructor(private readonly res: ServerResponse) {}

    write(msg: ServerMessage): void | Promise<void> {
        const res = this.res;
        switch (msg.type) {
            case 'OK':
                res.writeHead(200, {
                    ...toHttpHeaders(msg.headers),
                    'content-type': msg.contentType ?? DEFAULT_CONTENT_TYPE,
                });
                res.end(msg.body);
                return;
            case 'ERROR':
                if (!res.headersSent) {
                    res.writeHead(statusForErrorBody(msg.body), {
                        ...toHttpHeaders(msg.headers),
                        'content-type': msg.contentType ?? DEFAULT_CONTENT_TYPE,
                    });
                    res.end(msg.body);
                    return;
                }
                return this.writeEvent({ event: 'ERROR', data: msg.body }).then(
                    () => void res.end(),
                );
            case 'STREAM_START':
                res.writeHead(200, {
                    ...toHttpHeaders(msg.headers),
                    'content-type': 'text/event-stream',
                    'cache-control': 'no-cache',
                });
                res.flushHeaders();
                return;
            case 'STREAM_DATA':
                return this.writeEvent({ id: msg.msgId, data: msg.body });
            case 'STREAM_END':
                return this.writeEvent({
                    event: 'STREAM_END',
                    data: msg.reason,
                }).then(() => void res.end());
            case 'HEARTBEAT':
                if (!res.headersSent) return;
                return this.writeEvent({ event: 'HEARTBEAT' });
            case 'CONNECTION_START':
            case 'GOAWAY':
                return;
        }
    }

    writeErrorResponse(code: ErrorCode, message: string): void {
        this.res.writeHead(STATUS_BY_ERROR_CODE[code] ?? 500, {
            'content-type': DEFAULT_CONTENT_TYPE,
        });
        this.res.end(JSON.stringify({ code, message }));
    }

    private async writeEvent(event: {
        event?: string;
        id?: string;
        data?: Uint8Array | string;
    }): Promise<void> {
        let fields = '';
        if (event.event) fields += `event: ${event.event}\n`;
        if (event.id) fields += `id: ${event.id}\n`;
        fields += 'data: ';
        const chunk = Buffer.concat([
            Buffer.from(fields),
            event.data === undefined
                ? Buffer.alloc(0)
                : Buffer.from(event.data),
            Buffer.from('\n\n'),
        ]);
        if (!this.res.write(chunk)) await once(this.res, 'drain');
    }
}

const PROTECTED_HEADERS = new Set([
    'connection',
    'content-encoding',
    'content-length',
    'expect',
    'host',
    'keep-alive',
    'last-event-id',
    'proxy-authenticate',
    'proxy-authorization',
    'proxy-connection',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
]);

const HEADERS_MAPPED_TO_MESSAGE_FIELDS = new Set([
    'content-type',
    'accept',
    'req-id',
    'client-version',
]);

function toArriHeaders(req: IncomingMessage): ArriHeaders {
    const headers = new ArriHeaders();
    for (const [key, value] of Object.entries(req.headers)) {
        if (value === undefined) continue;
        if (PROTECTED_HEADERS.has(key)) continue;
        if (HEADERS_MAPPED_TO_MESSAGE_FIELDS.has(key)) continue;
        if (key.startsWith('arri-')) continue;
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
    return headers;
}

function toHttpHeaders(headers: ArriHeaders): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of headers) {
        if (PROTECTED_HEADERS.has(key)) continue;
        result[key] = value;
    }
    return result;
}

function singleHeader(req: IncomingMessage, key: string): string | undefined {
    const value = req.headers[key];
    return Array.isArray(value) ? value.join(', ') : value;
}

async function readBody(req: IncomingMessage): Promise<Uint8Array> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    return Buffer.concat(chunks);
}

const STATUS_BY_ERROR_CODE: Partial<Record<ErrorCode, number>> = {
    PROTOCOL_ERROR: 400,
    PROCEDURE_NOT_FOUND: 404,
    INVALID_INPUT: 400,
    UNSUPPORTED_CONTENT_TYPE: 415,
    NOT_ACCEPTABLE: 406,
    MESSAGE_TOO_LARGE: 413,
    OUTPUT_ENCODING_ERROR: 500,
    BAD_REQUEST: 400,
    UNAUTHENTICATED: 401,
    PERMISSION_DENIED: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    FAILED_PRECONDITION: 412,
    RATE_LIMITED: 429,
    INTERNAL: 500,
    UNIMPLEMENTED: 501,
    UNAVAILABLE: 503,
    TIMEOUT: 504,
    UNKNOWN: 500,
};

// TODO: avoid decoding the body just to find the status code (e.g. expose the code on ErrorMessage)
function statusForErrorBody(body: Uint8Array | undefined): number {
    try {
        const { code } = JSON.parse(Buffer.from(body ?? []).toString());
        return STATUS_BY_ERROR_CODE[code as ErrorCode] ?? 500;
    } catch {
        return 500;
    }
}
