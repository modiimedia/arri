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

export class MessageEncodingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MessageEncodingError';
    }
}

const textEncoder = new TextEncoder();
const verifiedAsciiDecoder = new TextDecoder();

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

const NOT_FOUND = -1;

function isValidHeadLineByte(byte: number): boolean {
    return byte === TAB || (byte >= 0x20 && byte <= 0x7e);
}

function scanHead(input: Uint8Array): {
    headEndIndex: number;
    firstInvalidByteIndex: number;
} {
    let firstInvalidByteIndex = NOT_FOUND;
    for (let i = 0; i < input.length; i++) {
        const byte = input[i]!;
        if (byte === LF) {
            if (input[i + 1] === LF) {
                return { headEndIndex: i, firstInvalidByteIndex };
            }
            continue;
        }
        if (firstInvalidByteIndex === NOT_FOUND && !isValidHeadLineByte(byte)) {
            firstInvalidByteIndex = i;
        }
    }
    return { headEndIndex: NOT_FOUND, firstInvalidByteIndex };
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
    const { headEndIndex, firstInvalidByteIndex } = scanHead(input);
    let reqId: ReqId | undefined;
    const err = (error: string): ParseResult<Message> =>
        reqId === undefined
            ? { success: false, error }
            : { success: false, error, reqId };

    if (headEndIndex === NOT_FOUND) {
        reqId = recoverReqId(input, input.length);
        return err('Invalid message. Missing empty line after headers.');
    }
    if (firstInvalidByteIndex !== NOT_FOUND) {
        reqId = recoverReqId(input, headEndIndex);
        return err(
            `Invalid message. Head contains a non-ASCII or control character at byte ${firstInvalidByteIndex}.`,
        );
    }
    const head = verifiedAsciiDecoder.decode(input.subarray(0, headEndIndex));
    const bodyStartIndex = headEndIndex + 2;
    const body =
        input.length > bodyStartIndex
            ? input.subarray(bodyStartIndex)
            : undefined;
    const lines = head.split('\n');

    const reserved = new Map<ReservedHeader, string>();
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
        if (isReservedHeader(key)) {
            if (reserved.has(key)) {
                headerError ??= `Duplicate header "${key}".`;
                continue;
            }
            reserved.set(key, value);
            continue;
        }
        if (isBindingHeader(key)) continue;
        if (custom.has(key)) {
            headerError ??= `Duplicate header "${key}".`;
            continue;
        }
        // key and value have already been validated, so this won't throw
        custom.set(key, value);
    }
    const rawReqId = reserved.get('req-id');
    if (rawReqId !== undefined) {
        if (!isValidReqId(rawReqId)) {
            return err(
                `Invalid req-id "${rawReqId}". Request ids must be 1-${MAX_REQ_ID_LENGTH} visible ASCII characters.`,
            );
        }
        reqId = rawReqId;
    }
    if (headerError) return err(headerError);

    const firstLineParts = lines[0]!.split(' ');
    const prefix = firstLineParts[0];
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
    const msgType = firstLineParts[1];
    if (!msgType || !MESSAGE_TYPES.has(msgType)) {
        return err(`Unsupported message type "${msgType ?? ''}".`);
    }
    let rpcName: string | undefined;
    if (msgType === 'INVOCATION') {
        rpcName = firstLineParts[2];
        if (!rpcName || firstLineParts.length !== 3) {
            return err(
                'Invalid INVOCATION message. Expected exactly one rpc name.',
            );
        }
    } else if (firstLineParts.length !== 2) {
        return err(
            `Invalid ${msgType} message. Unexpected content in first line.`,
        );
    }

    let heartbeatInterval: number | undefined;
    const rawHeartbeatInterval = reserved.get('heartbeat-interval');
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
                contentType: reserved.get('content-type'),
                accept: reserved.get('accept'),
                clientVersion: reserved.get('client-version'),
                lastMsgId: reserved.get('last-msg-id'),
                headers: custom,
                body,
            });
        case 'OK':
            return ok<OkMessage>({
                type: 'OK',
                reqId,
                contentType: reserved.get('content-type'),
                headers: custom,
                body,
            });
        case 'ERROR':
            return ok<ErrorMessage>({
                type: 'ERROR',
                reqId,
                contentType: reserved.get('content-type'),
                headers: custom,
                body,
            });
        case 'STREAM_START':
            return ok<StreamStartMessage>({
                type: 'STREAM_START',
                reqId,
                contentType: reserved.get('content-type'),
                headers: custom,
            });
        case 'STREAM_DATA':
            return ok<StreamDataMessage>({
                type: 'STREAM_DATA',
                reqId,
                msgId: reserved.get('msg-id'),
                body,
            });
        case 'STREAM_END':
            return ok<StreamEndMessage>({
                type: 'STREAM_END',
                reqId,
                reason: reserved.get('reason'),
            });
        case 'CANCEL':
            return ok<CancelMessage>({
                type: 'CANCEL',
                reqId,
                reason: reserved.get('reason'),
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
                reason: reserved.get('reason'),
            });
    }
}

const REQ_ID_HEADER_PREFIX = 'req-id:';

function recoverReqId(
    input: Uint8Array,
    searchEndIndex: number,
): ReqId | undefined {
    let lineStart = 0;
    for (let i = 0; i <= searchEndIndex; i++) {
        if (i !== searchEndIndex && input[i] !== LF) continue;
        const line = input.subarray(lineStart, i);
        lineStart = i + 1;
        if (line.length <= REQ_ID_HEADER_PREFIX.length) continue;
        if (!line.every(isValidHeadLineByte)) continue;
        const text = verifiedAsciiDecoder.decode(line);
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
