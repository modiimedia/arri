import type { ClientMessage, ReqId, ServerMessage } from '@arrirpc/core';

export interface TransportInfo {
    name: string;
    remoteAddress?: string;
    /**
     * The transport's native request/socket object. An escape hatch for procedures that need transport specific details.
     */
    raw?: unknown;
}

/**
 * Implemented by transport adapters. This is how the server core talks to the transport.
 */
export interface TransportConnection {
    readonly info: TransportInfo;
    /**
     * Whether the core should send CONNECTION_START, HEARTBEAT, and GOAWAY messages.
     * Transports with native liveness checks (e.g. WebSocket ping frames) can opt out.
     * Adapters may also drop connection-level messages that their transport cannot express.
     */
    readonly connectionMessages: boolean;
    /**
     * Return a promise to apply backpressure. The core waits for it before sending more output for the same call.
     */
    send(msg: ServerMessage): void | Promise<void>;
    close(): void;
}

/**
 * Returned by the server core. This is how the transport talks to the core.
 */
export interface ConnectionHandle {
    receive(msg: ClientMessage): void;
    /**
     * Report a message that failed to parse. The core responds with a PROTOCOL_ERROR for the
     * call identified by `reqId`, or a connection-level error if there is no `reqId`.
     */
    receiveInvalid(failure: { error: string; reqId?: ReqId }): void;
    /**
     * The transport connection is gone. Every call on it is aborted.
     */
    closed(): void;
}
