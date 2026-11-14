/**
 * Arri RPC message format (draft)
 *
 * Every message is a sequence of bytes in the following shape:
 *
 * ```txt
 * ARRIRPC/<protocol-version> <MESSAGE_TYPE>[ <rpc-name>]
 * <header-key>: <header-value>
 * <header-key>: <header-value>
 *
 * <body>
 * ```
 *
 * ## Head
 *
 * Everything before the first empty line is the "head".
 *
 * - The head is ASCII. Only tab (0x09), line feed (0x0A), and printable characters (0x20-0x7E) are allowed.
 * - The first line is always present. Only INVOCATION messages include an rpc name.
 * - Lines are delimited by `\n` (`\r\n` is not supported). The end of the head is marked by an empty
 *   line (`\n\n`). The empty line is required even when there is no body.
 * - Header keys are case-insensitive and are always encoded as lowercase. A key may only appear once
 *   per message (compared case-insensitively).
 * - Header values have leading and trailing whitespace removed by both encoders and parsers.
 *   "Whitespace" means space (0x20) and tab (0x09) only.
 *
 * ## Body
 *
 * Everything after the empty line is the body. The body is raw bytes and its format is
 * determined by the content type (see "Content types" below).
 *
 * Because the head can never contain `\n\n`, receivers can locate the body by scanning for the
 * first `\n\n` byte sequence without decoding anything.
 *
 * Bodies are always bytes. Transports should convert to/from bytes exactly once at the transport
 * boundary and avoid round trips through strings.
 *
 * ## Content types
 *
 * - Whenever a content type is not explicitly provided it is `application/json` ({@link DEFAULT_CONTENT_TYPE}).
 * - INVOCATION: `content-type` is the content type of that message's body. `accept` is the content type the
 *   client wants to receive. If `accept` is omitted the server responds using the invocation's content type.
 * - STREAM_START: `content-type` is the content type of every subsequent STREAM_DATA message sent by the same
 *   party with the same `req-id`.
 * - OK / ERROR: `content-type` is the content type of that message's body.
 * - If the server cannot produce the requested content type, or the requested content type is unknown,
 *   ERROR messages fall back to `application/json`.
 *
 * ## Call flows
 *
 * Every call is terminated by exactly one of: server OK, server ERROR, server STREAM_END, or client CANCEL.
 *
 * ```txt
 * unary:          C: INVOCATION                                     S: OK
 * output stream:  C: INVOCATION                                     S: STREAM_START, STREAM_DATA*, STREAM_END
 * input stream:   C: INVOCATION, STREAM_START, STREAM_DATA*, STREAM_END     S: OK
 * bidirectional:  C: INVOCATION, STREAM_START, STREAM_DATA*, STREAM_END     S: STREAM_START, STREAM_DATA*, STREAM_END
 * ```
 *
 * - When a procedure's input is a stream, the INVOCATION has no body. The client does not wait for an
 *   acknowledgement before streaming its input.
 * - The server may send ERROR at any point, which terminates the call. The client must then stop sending,
 *   and the server discards any in-flight client messages for that call.
 * - An ERROR without a `req-id` is a connection-level error (e.g. the server received a message it could
 *   not parse and could not determine which call it belonged to).
 *
 * ## Usage
 *
 * This encoding is used by transports that carry Arri messages directly (e.g. websockets, tcp).
 * Transports such as HTTP translate these messages into their own native constructs instead.
 */

import {
    ArriHeaders,
    isBindingHeader,
    isReservedHeader,
    isValidHeaderKey,
    isValidHeaderValue,
    normalizeHeaderKey,
    ReservedHeader,
    trimHeaderValue,
} from './headers';

/**
 * Version of the wire protocol. This is versioned independently from the app definition schema.
 *
 * Only the major version is sent over the wire. Optional features should be signaled through headers.
 */
export const PROTOCOL_VERSION = '0' as const;
export const PROTOCOL_PREFIX = `ARRIRPC/${PROTOCOL_VERSION}` as const;

/**
 * The content type used whenever a message does not explicitly specify one.
 */
export const DEFAULT_CONTENT_TYPE = 'application/json' as const;

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------

/**
 * A request id chosen by the client.
 *
 * It is an opaque identifier. Servers only compare it for equality and never interpret it.
 * It only needs to be unique for active calls within a single connection
 * (the server always scopes it by connection), so a per-connection counter is sufficient,
 * but clients are free to use any scheme (UUIDs, ULIDs, etc).
 *
 * Must be 1-128 visible ASCII characters (0x21-0x7E). See {@link isValidReqId}.
 *
 * Bindings where the transport already correlates requests and responses (e.g. a single HTTP request)
 * may omit it.
 */
export type ReqId = string;

export const MAX_REQ_ID_LENGTH = 128;

/**
 * Starts a call. (Client → Server)
 *
 * When the procedure's input is a stream, this message has no body.
 */
export interface InvocationMessage {
    type: 'INVOCATION';
    rpcName: string;
    reqId?: ReqId;
    /**
     * The content type of this message's body. Defaults to `application/json`.
     */
    contentType?: string;
    /**
     * The content type the client wants to receive. Uses the same syntax as the HTTP `Accept` header.
     * If omitted, the server responds using {@link contentType}.
     */
    accept?: string;
    clientVersion?: string;
    /**
     * The id of the last stream message the client received. Used to resume an output stream.
     */
    lastMsgId?: string;
    headers: ArriHeaders;
    body?: Uint8Array;
}

/**
 * The result of a call that does not have a streamed output. (Server → Client)
 *
 * Terminates the call.
 */
export interface OkMessage {
    type: 'OK';
    reqId?: ReqId;
    /**
     * The content type of this message's body. Defaults to `application/json`.
     */
    contentType?: string;
    headers: ArriHeaders;
    body?: Uint8Array;
}

/**
 * The call failed. Can be sent at any point in the call, including mid-stream. (Server → Client)
 *
 * Terminates the call. If `reqId` is omitted this is a connection-level error.
 *
 * The body contains the error details. See `ArriErrorPayload` in `./errors.ts`.
 */
export interface ErrorMessage {
    type: 'ERROR';
    reqId?: ReqId;
    /**
     * The content type of this message's body. Defaults to `application/json`.
     * Falls back to `application/json` if the requested content type cannot be produced.
     */
    contentType?: string;
    headers: ArriHeaders;
    body?: Uint8Array;
}

/**
 * Starts a stream. (Bidirectional)
 *
 * - Client → Server: sent after INVOCATION when the procedure's input is a stream.
 * - Server → Client: sent before any output STREAM_DATA messages. Gives transports such as HTTP
 *   a point at which to commit response status and headers.
 */
export interface StreamStartMessage {
    type: 'STREAM_START';
    reqId?: ReqId;
    /**
     * The content type of every subsequent STREAM_DATA message sent by the same party with the same `reqId`.
     * Defaults to `application/json`.
     */
    contentType?: string;
    headers: ArriHeaders;
}

/**
 * A single item in a stream. (Bidirectional)
 *
 * The body's content type is set by the STREAM_START message with the same `reqId`.
 */
export interface StreamDataMessage {
    type: 'STREAM_DATA';
    reqId?: ReqId;
    msgId?: string;
    body?: Uint8Array;
}

/**
 * Ends a stream. (Bidirectional)
 *
 * - Client → Server: the client is done sending input (half-close).
 * - Server → Client: the call is complete. Terminates the call.
 */
export interface StreamEndMessage {
    type: 'STREAM_END';
    reqId?: ReqId;
    reason?: string;
}

/**
 * The client is abandoning the call. Applies to any in-flight call, not only streams. (Client → Server)
 *
 * Terminates the call.
 */
export interface CancelMessage {
    type: 'CANCEL';
    reqId?: ReqId;
    reason?: string;
}

/**
 * Sent once when a connection is established. (Server → Client)
 */
export interface ConnectionStartMessage {
    type: 'CONNECTION_START';
    /**
     * How often (in milliseconds) the server will send HEARTBEAT messages
     */
    heartbeatInterval?: number;
}

/**
 * Keeps the connection alive. (Server → Client)
 */
export interface HeartbeatMessage {
    type: 'HEARTBEAT';
    heartbeatInterval?: number;
}

/**
 * The server is going away. Clients should stop sending new invocations over this connection,
 * let in-flight calls finish, and then reconnect. (Server → Client)
 */
export interface GoAwayMessage {
    type: 'GOAWAY';
    reason?: string;
}

export type ClientMessage =
    | InvocationMessage
    | StreamStartMessage
    | StreamDataMessage
    | StreamEndMessage
    | CancelMessage;

export type ServerMessage =
    | OkMessage
    | ErrorMessage
    | StreamStartMessage
    | StreamDataMessage
    | StreamEndMessage
    | ConnectionStartMessage
    | HeartbeatMessage
    | GoAwayMessage;

export type Message = ClientMessage | ServerMessage;
export type MessageType = Message['type'];

export const CLIENT_MESSAGE_TYPES = [
    'INVOCATION',
    'STREAM_START',
    'STREAM_DATA',
    'STREAM_END',
    'CANCEL',
] as const satisfies readonly ClientMessage['type'][];

export const SERVER_MESSAGE_TYPES = [
    'OK',
    'ERROR',
    'STREAM_START',
    'STREAM_DATA',
    'STREAM_END',
    'CONNECTION_START',
    'HEARTBEAT',
    'GOAWAY',
] as const satisfies readonly ServerMessage['type'][];

const MESSAGE_TYPES: ReadonlySet<string> = new Set<MessageType>([
    ...CLIENT_MESSAGE_TYPES,
    ...SERVER_MESSAGE_TYPES,
]);

export function isClientMessage(msg: Message): msg is ClientMessage {
    return (CLIENT_MESSAGE_TYPES as readonly string[]).includes(msg.type);
}

export function isServerMessage(msg: Message): msg is ServerMessage {
    return (SERVER_MESSAGE_TYPES as readonly string[]).includes(msg.type);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const REQ_ID_REGEX = /^[\x21-\x7E]+$/;

/**
 * Request ids are limited to visible ASCII so that they are safe to use as HTTP header values
 * and compare identically in every language. The length limit prevents clients from forcing
 * servers to store arbitrarily large keys for in-flight calls.
 */
export function isValidReqId(value: string): boolean {
    return value.length <= MAX_REQ_ID_LENGTH && REQ_ID_REGEX.test(value);
}

const RPC_NAME_REGEX = /^[\x21-\x7E]+$/;

/**
 * Rpc names must be non-empty visible ASCII (no whitespace)
 */
export function isValidRpcName(value: string): boolean {
    return RPC_NAME_REGEX.test(value);
}

// ---------------------------------------------------------------------------
// Encoding
// ---------------------------------------------------------------------------

export class MessageEncodingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MessageEncodingError';
    }
}

const textEncoder = new TextEncoder();
// only used after the head has been verified to be ASCII
const textDecoder = new TextDecoder();

/**
 * Encode a message into the Arri message format.
 *
 * Throws a {@link MessageEncodingError} if the rpc name or any reserved header value is invalid.
 */
export function encodeMessage(msg: Message): Uint8Array {
    let output: string;
    if (msg.type === 'INVOCATION') {
        if (!isValidRpcName(msg.rpcName)) {
            throw new MessageEncodingError(
                `Invalid rpc name "${msg.rpcName}". Rpc names must be non-empty visible ASCII characters.`,
            );
        }
        output = `${PROTOCOL_PREFIX} INVOCATION ${msg.rpcName}\n`;
    } else {
        output = `${PROTOCOL_PREFIX} ${msg.type}\n`;
    }
    const addHeader = (
        key: ReservedHeader,
        value: string | number | undefined,
    ) => {
        if (value === undefined) return;
        const strVal = trimHeaderValue(String(value));
        if (key === 'req-id' && !isValidReqId(strVal)) {
            throw new MessageEncodingError(
                `Invalid req-id "${strVal}". Request ids must be 1-${MAX_REQ_ID_LENGTH} visible ASCII characters.`,
            );
        }
        if (!isValidHeaderValue(strVal)) {
            throw new MessageEncodingError(
                `Invalid value for header "${key}". Header values may only contain printable ASCII characters and tabs.`,
            );
        }
        output += `${key}: ${strVal}\n`;
    };
    const addCustomHeaders = (headers: ArriHeaders) => {
        for (const [key, value] of headers) {
            output += `${key}: ${value}\n`;
        }
    };
    let body: Uint8Array | undefined;
    switch (msg.type) {
        case 'INVOCATION':
            addHeader('req-id', msg.reqId);
            addHeader('content-type', msg.contentType);
            addHeader('accept', msg.accept);
            addHeader('client-version', msg.clientVersion);
            addHeader('last-msg-id', msg.lastMsgId);
            addCustomHeaders(msg.headers);
            body = msg.body;
            break;
        case 'OK':
        case 'ERROR':
            addHeader('req-id', msg.reqId);
            addHeader('content-type', msg.contentType);
            addCustomHeaders(msg.headers);
            body = msg.body;
            break;
        case 'STREAM_START':
            addHeader('req-id', msg.reqId);
            addHeader('content-type', msg.contentType);
            addCustomHeaders(msg.headers);
            break;
        case 'STREAM_DATA':
            addHeader('req-id', msg.reqId);
            addHeader('msg-id', msg.msgId);
            body = msg.body;
            break;
        case 'STREAM_END':
        case 'CANCEL':
            addHeader('req-id', msg.reqId);
            addHeader('reason', msg.reason);
            break;
        case 'CONNECTION_START':
            addHeader('heartbeat-interval', msg.heartbeatInterval);
            break;
        case 'HEARTBEAT':
            addHeader('heartbeat-interval', msg.heartbeatInterval);
            break;
        case 'GOAWAY':
            addHeader('reason', msg.reason);
            break;
        default:
            msg satisfies never;
    }
    output += '\n';
    const head = textEncoder.encode(output);
    if (body === undefined || body.length === 0) return head;
    const result = new Uint8Array(head.length + body.length);
    result.set(head, 0);
    result.set(body, head.length);
    return result;
}

// ---------------------------------------------------------------------------
// Decoding
// ---------------------------------------------------------------------------

export type ParseResult<T> =
    | { success: true; value: T }
    | {
          success: false;
          error: string;
          /**
           * When a message fails to parse but its `req-id` could still be determined,
           * it is included here so the receiver can respond with an ERROR for that call
           * instead of leaving the call hanging.
           */
          reqId?: ReqId;
      };

function ok<T>(value: T): ParseResult<T> {
    return { success: true, value };
}

const LF = 0x0a;
const TAB = 0x09;

/**
 * Returns the index of the first `\n\n`, or -1 if there isn't one.
 * Also returns -1 for `invalidByteIndex` if every byte before the head end is a valid head byte.
 */
function scanHead(input: Uint8Array): {
    headEnd: number;
    invalidByteIndex: number;
} {
    let invalidByteIndex = -1;
    for (let i = 0; i < input.length; i++) {
        const byte = input[i]!;
        if (byte === LF) {
            if (input[i + 1] === LF) return { headEnd: i, invalidByteIndex };
            continue;
        }
        if (
            invalidByteIndex === -1 &&
            byte !== TAB &&
            (byte < 0x20 || byte > 0x7e)
        ) {
            invalidByteIndex = i;
        }
    }
    return { headEnd: -1, invalidByteIndex };
}

/**
 * Parse a message from the Arri message format.
 *
 * The returned body is a view into `input` (no copy is made). Copy it if `input` will be reused.
 *
 * Reserved headers that don't apply to the message type are ignored so that newer
 * senders can add headers without breaking older receivers. Unknown headers become
 * custom headers on message types that support them and are ignored otherwise.
 */
export function parseMessage(input: Uint8Array): ParseResult<Message> {
    const { headEnd, invalidByteIndex } = scanHead(input);
    let reqId: ReqId | undefined;
    const err = (error: string): ParseResult<Message> =>
        reqId === undefined
            ? { success: false, error }
            : { success: false, error, reqId };

    if (headEnd === -1) {
        reqId = recoverReqId(input, input.length);
        return err('Invalid message. Missing empty line after headers.');
    }
    if (invalidByteIndex !== -1) {
        reqId = recoverReqId(input, headEnd);
        return err(
            `Invalid message. Head contains a non-ASCII or control character at byte ${invalidByteIndex}.`,
        );
    }
    const head = textDecoder.decode(input.subarray(0, headEnd));
    const body =
        input.length > headEnd + 2 ? input.subarray(headEnd + 2) : undefined;
    const lines = head.split('\n');

    // headers
    // (parsed before the first line so that req-id is available for error reporting)
    // null prototype so that `key in reserved` doesn't match inherited keys like "constructor" or "__proto__"
    const reserved: Partial<Record<ReservedHeader, string>> =
        Object.create(null);
    const custom = new ArriHeaders();
    let headerError: string | undefined;
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i]!;
        const sepIndex = line.indexOf(':');
        if (sepIndex <= 0) {
            headerError ??= `Invalid header line "${line}".`;
            continue;
        }
        const rawKey = line.substring(0, sepIndex);
        if (!isValidHeaderKey(rawKey)) {
            headerError ??= `Invalid header key "${rawKey}".`;
            continue;
        }
        const key = normalizeHeaderKey(rawKey);
        const value = trimHeaderValue(line.substring(sepIndex + 1));
        if (key in reserved || custom.has(key)) {
            headerError ??= `Duplicate header "${key}".`;
            continue;
        }
        if (isReservedHeader(key)) {
            reserved[key] = value;
        } else if (isBindingHeader(key)) {
            // binding headers belong to the transport layer and are never part of a message
            continue;
        } else {
            // key and value have already been validated, so this won't throw
            custom.set(key, value);
        }
    }
    const rawReqId = reserved['req-id'];
    if (rawReqId !== undefined) {
        if (!isValidReqId(rawReqId)) {
            return err(
                `Invalid req-id "${rawReqId}". Request ids must be 1-${MAX_REQ_ID_LENGTH} visible ASCII characters.`,
            );
        }
        reqId = rawReqId;
    }
    if (headerError) return err(headerError);

    // first line
    const firstLine = lines[0]!.split(' ');
    const prefix = firstLine[0];
    if (!prefix?.startsWith('ARRIRPC/')) {
        return err(
            `Invalid message. Expected first line to start with "ARRIRPC/".`,
        );
    }
    if (prefix !== PROTOCOL_PREFIX) {
        return err(
            `Unsupported protocol version "${prefix.substring(8)}". Expected "${PROTOCOL_VERSION}".`,
        );
    }
    const msgType = firstLine[1];
    if (!msgType || !MESSAGE_TYPES.has(msgType)) {
        return err(`Unsupported message type "${msgType ?? ''}".`);
    }
    let rpcName: string | undefined;
    if (msgType === 'INVOCATION') {
        rpcName = firstLine[2];
        if (!rpcName || firstLine.length !== 3) {
            return err(
                'Invalid INVOCATION message. Expected exactly one rpc name.',
            );
        }
    } else if (firstLine.length !== 2) {
        return err(
            `Invalid ${msgType} message. Unexpected content in first line.`,
        );
    }

    let heartbeatInterval: number | undefined;
    const rawHeartbeatInterval = reserved['heartbeat-interval'];
    if (rawHeartbeatInterval !== undefined) {
        if (!/^\d+$/.test(rawHeartbeatInterval)) {
            return err(
                `Invalid heartbeat-interval "${rawHeartbeatInterval}". Expected a non-negative integer.`,
            );
        }
        heartbeatInterval = Number(rawHeartbeatInterval);
    }

    switch (msgType as MessageType) {
        case 'INVOCATION':
            return ok<InvocationMessage>({
                type: 'INVOCATION',
                rpcName: rpcName!,
                reqId,
                contentType: reserved['content-type'],
                accept: reserved.accept,
                clientVersion: reserved['client-version'],
                lastMsgId: reserved['last-msg-id'],
                headers: custom,
                body,
            });
        case 'OK':
            return ok<OkMessage>({
                type: 'OK',
                reqId,
                contentType: reserved['content-type'],
                headers: custom,
                body,
            });
        case 'ERROR':
            return ok<ErrorMessage>({
                type: 'ERROR',
                reqId,
                contentType: reserved['content-type'],
                headers: custom,
                body,
            });
        case 'STREAM_START':
            return ok<StreamStartMessage>({
                type: 'STREAM_START',
                reqId,
                contentType: reserved['content-type'],
                headers: custom,
            });
        case 'STREAM_DATA':
            return ok<StreamDataMessage>({
                type: 'STREAM_DATA',
                reqId,
                msgId: reserved['msg-id'],
                body,
            });
        case 'STREAM_END':
            return ok<StreamEndMessage>({
                type: 'STREAM_END',
                reqId,
                reason: reserved.reason,
            });
        case 'CANCEL':
            return ok<CancelMessage>({
                type: 'CANCEL',
                reqId,
                reason: reserved.reason,
            });
        case 'CONNECTION_START':
            return ok<ConnectionStartMessage>({
                type: 'CONNECTION_START',
                heartbeatInterval,
            });
        case 'HEARTBEAT':
            return ok<HeartbeatMessage>({
                type: 'HEARTBEAT',
                heartbeatInterval,
            });
        case 'GOAWAY':
            return ok<GoAwayMessage>({
                type: 'GOAWAY',
                reason: reserved.reason,
            });
    }
}

const REQ_ID_HEADER_PREFIX = 'req-id:';

/**
 * Best effort attempt to find a valid req-id in a message that otherwise failed to parse.
 * Only looks at lines made up entirely of valid head bytes.
 */
function recoverReqId(input: Uint8Array, end: number): ReqId | undefined {
    let lineStart = 0;
    for (let i = 0; i <= end; i++) {
        if (i !== end && input[i] !== LF) continue;
        const line = input.subarray(lineStart, i);
        lineStart = i + 1;
        if (line.length <= REQ_ID_HEADER_PREFIX.length) continue;
        let isAscii = true;
        for (const byte of line) {
            if (byte !== TAB && (byte < 0x20 || byte > 0x7e)) {
                isAscii = false;
                break;
            }
        }
        if (!isAscii) continue;
        const text = textDecoder.decode(line);
        if (
            text.substring(0, REQ_ID_HEADER_PREFIX.length).toLowerCase() !==
            REQ_ID_HEADER_PREFIX
        ) {
            continue;
        }
        const value = trimHeaderValue(
            text.substring(REQ_ID_HEADER_PREFIX.length),
        );
        return isValidReqId(value) ? value : undefined;
    }
    return undefined;
}

/**
 * Parse a message that was sent by a client. Fails if the message is a server-only message type.
 */
export function parseClientMessage(
    input: Uint8Array,
): ParseResult<ClientMessage> {
    const result = parseMessage(input);
    if (!result.success) return result;
    if (!isClientMessage(result.value)) {
        return {
            success: false,
            error: `${result.value.type} cannot be sent by a client.`,
            reqId: 'reqId' in result.value ? result.value.reqId : undefined,
        };
    }
    return ok(result.value);
}

/**
 * Parse a message that was sent by a server. Fails if the message is a client-only message type.
 */
export function parseServerMessage(
    input: Uint8Array,
): ParseResult<ServerMessage> {
    const result = parseMessage(input);
    if (!result.success) return result;
    if (!isServerMessage(result.value)) {
        return {
            success: false,
            error: `${result.value.type} cannot be sent by a server.`,
            reqId: 'reqId' in result.value ? result.value.reqId : undefined,
        };
    }
    return ok(result.value);
}
