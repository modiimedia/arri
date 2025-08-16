import { Err, Ok, Result } from './helpers';

export const ARRI_VERSION = '0.0.8' as const;
export function isCurrentArriVersion(
    input: unknown,
): input is typeof ARRI_VERSION {
    return input === ARRI_VERSION;
}
export function isCurrentArriVersionPrefix(input: string): boolean {
    return input === `ARRIRPC/${ARRI_VERSION}`;
}

// TODO: make it so body can also be binary
export type Message<T = string> =
    | InvocationMessage<T>
    | OkMessage<T>
    | ErrorMessage
    | HeartbeatMessage
    | ConnectionStartMessage
    | StreamDataMessage<T>
    | StreamEndMessage
    | StreamCancelMessage;

export type ContentType = 'application/json' | 'unknown';

export const ReservedHeaders = [
    'req-id',
    'content-type',
    'client-version',
    'msg-id',
    'last-msg-id',
    'error-code',
    'error-msg',
    'heartbeat-interval',
    'reason',
] as const;
export type ReservedHeader = (typeof ReservedHeaders)[number];

// TODO: make it so body can also be binary
export interface InvocationMessage<T = string> {
    type: 'INVOCATION';
    rpcName: string;
    reqId: string;
    contentType: ContentType;
    clientVersion: string | undefined;
    lastMsgId: string | undefined;
    customHeaders: Record<string, string>;
    path?: string;
    method?: string;
    body: T | undefined;
}

export interface OkMessage<T = string> {
    type: 'OK';
    reqId: string;
    customHeaders: Record<string, string>;
    contentType: ContentType;
    heartbeatInterval: number | undefined;
    body: T | undefined;
}
export interface ErrorMessage<T = string> {
    type: 'ERROR';
    reqId: string;
    customHeaders: Record<string, string>;
    contentType: ContentType;
    errorCode: number;
    errorMessage: string;
    body: T | undefined;
}
export interface HeartbeatMessage {
    type: 'HEARTBEAT';
    heartbeatInterval: number | undefined;
}
export interface ConnectionStartMessage {
    type: 'CONNECTION_START';
    heartbeatInterval: number | undefined;
}

export interface StreamDataMessage<T> {
    type: 'STREAM_DATA';
    reqId: string | undefined;
    msgId: string | undefined;
    body?: T;
}
export interface StreamEndMessage {
    type: 'STREAM_END';
    reqId: string | undefined;
    reason: string | undefined;
}
export interface StreamCancelMessage {
    type: 'STREAM_CANCEL';
    reqId: string | undefined;
    reason: string | undefined;
}

export function parseMessage(input: string): Result<Message<string>, string> {
    let msgType: Message['type'] | undefined;
    let reqId: string | undefined;
    let rpcName: string | undefined;
    let contentType: ContentType | undefined;
    let clientVersion: string | undefined;
    let msgId: string | undefined;
    let lastMsgId: string | undefined;
    let errorCode: number | undefined;
    let errorMessage: string | undefined;
    let heartbeatInterval: number | undefined;
    let reason: string | undefined;

    const customHeaders: Record<string, string> = {};
    let currentLine = '';
    let bodyStartIndex: number | undefined;

    function processLine(): string | null {
        if (!msgType) {
            const [arriVersion, typeIndicator] = currentLine.split(' ');
            if (!arriVersion || !typeIndicator) return 'Invalid';
            if (!isCurrentArriVersionPrefix(arriVersion)) {
                return `Unsupported Arrirpc version. Expected "ARRIRPC/${ARRI_VERSION}". Got "${arriVersion}".`;
            }
            const castedIndicator = typeIndicator as Exclude<
                Message['type'],
                'INVOCATION'
            >;
            switch (castedIndicator) {
                case 'CONNECTION_START':
                case 'OK':
                case 'ERROR':
                case 'HEARTBEAT':
                case 'STREAM_DATA':
                case 'STREAM_END':
                case 'STREAM_CANCEL':
                    msgType = castedIndicator;
                    break;
                default:
                    castedIndicator satisfies never;
                    msgType = 'INVOCATION';
                    rpcName = typeIndicator;
                    break;
            }
            currentLine = '';
            return null;
        }
        const [key, value] = parseHeaderLine(currentLine);
        const castedKey = key as ReservedHeader;
        switch (castedKey) {
            case 'client-version':
                clientVersion = value;
                break;
            case 'req-id':
                reqId = value;
                break;
            case 'content-type':
                switch (value) {
                    case 'application/json':
                        contentType = value;
                        break;
                    default:
                        contentType = 'unknown';
                        break;
                }
                break;
            case 'msg-id':
                msgId = value;
                break;
            case 'error-code':
                const code = Number.parseInt(value);
                if (Number.isNaN(code)) {
                    return 'Invalid error code. Must be an integer.';
                }
                errorCode = code;
                break;
            case 'error-msg':
                errorMessage = value;
                break;
            case 'heartbeat-interval':
                const parsedVal = Number.parseInt(value);
                if (Number.isNaN(parsedVal)) {
                    return 'Invalid heartbeat interval. Must be an integer.';
                }
                heartbeatInterval = parsedVal;
                break;
            case 'reason':
                reason = value;
                break;
            case 'last-msg-id':
                lastMsgId = value;
                break;
            default:
                castedKey satisfies never;
                customHeaders[key] = value;
                break;
        }
        currentLine = '';
        return null;
    }

    for (let i = 0; i < input.length; i++) {
        const char = input[i]!;
        if (char === '\n' && input[i + 1] === '\n') {
            const err = processLine();
            if (err) return Err(err);
            bodyStartIndex = i + 2;
            break;
        }
        if (char === '\n') {
            const err = processLine();
            if (err) return Err(err);
            continue;
        }
        currentLine += char;
    }
    if (typeof msgType === 'undefined') {
        return Err('Invalid message. Unable to determine message type.');
    }
    if (typeof bodyStartIndex === 'undefined' || bodyStartIndex < 0) {
        return Err(
            'Invalid message. End of headers must be designated with \n\n',
        );
    }
    let body: string | undefined;
    const bodyStr = input.slice(bodyStartIndex);
    if (bodyStr.length > 0) {
        body = bodyStr.trim();
    }
    switch (msgType) {
        case 'INVOCATION': {
            if (!rpcName) {
                return Err(
                    'RPC Invocation messages must begin with "ARRIRPC/{version} {rpc-name}"',
                );
            }
            if (!reqId) {
                return Err(
                    `req-id is a required header for INVOCATION messages`,
                );
            }
            if (!contentType || contentType === 'unknown') {
                return Err(
                    'Missing or invalid content-type header. Accepted values: ["application/json"]',
                );
            }
            const msg: InvocationMessage = {
                type: 'INVOCATION',
                rpcName: rpcName,
                reqId: reqId,
                contentType: contentType,
                clientVersion: clientVersion,
                lastMsgId: lastMsgId,
                customHeaders: customHeaders,
                body: body,
            };
            return Ok(msg);
        }
        case 'OK': {
            if (!reqId) {
                return Err('req-id is a required header for OK messages');
            }
            if (!contentType || contentType === 'unknown') {
                return Err(
                    'Missing or invalid content-type header. Accepted values: ["application/json"]',
                );
            }
            const msg: OkMessage = {
                type: 'OK',
                reqId: reqId,
                customHeaders: customHeaders,
                contentType: contentType,
                heartbeatInterval: heartbeatInterval,
                body: body,
            };
            return Ok(msg);
        }
        case 'ERROR': {
            if (!reqId) {
                return Err(`req-id is a required header for ERROR messages`);
            }
            if (!contentType || contentType === 'unknown') {
                return Err(
                    'Missing or invalid content-type header. Accepted values: ["application/json"]',
                );
            }
            if (
                typeof errorCode === 'undefined' ||
                typeof errorMessage === 'undefined'
            ) {
                return Err(
                    `Missing one or more required headers for ERROR message: ["error-code", "error-msg"]`,
                );
            }
            const msg: ErrorMessage = {
                type: 'ERROR',
                reqId: reqId,
                customHeaders: customHeaders,
                contentType: contentType,
                errorCode: errorCode,
                errorMessage: errorMessage,
                body: body,
            };
            return Ok(msg);
        }
        case 'CONNECTION_START': {
            const msg: ConnectionStartMessage = {
                type: 'CONNECTION_START',
                heartbeatInterval: heartbeatInterval,
            };
            return Ok(msg);
        }
        case 'HEARTBEAT': {
            const msg: HeartbeatMessage = {
                type: 'HEARTBEAT',
                heartbeatInterval: heartbeatInterval,
            };
            return Ok(msg);
        }
        case 'STREAM_DATA': {
            if (!reqId) {
                return Err(
                    `req-id is a required header for STREAM_DATA messages`,
                );
            }
            const msg: StreamDataMessage<string> = {
                type: 'STREAM_DATA',
                reqId: reqId,
                msgId: msgId,
                body: body,
            };
            return Ok(msg);
        }
        case 'STREAM_END': {
            if (!reqId) {
                return Err(
                    `req-id is a required header for STREAM_DATA messages`,
                );
            }
            const msg: StreamEndMessage = {
                type: 'STREAM_END',
                reqId: reqId,
                reason: reason,
            };
            return Ok(msg);
        }
        case 'STREAM_CANCEL': {
            if (!reqId) {
                return Err(
                    `req-id is a required header for STREAM_CANCEL messages`,
                );
            }
            const msg: StreamCancelMessage = {
                type: 'STREAM_CANCEL',
                reqId: reqId,
                reason: reason,
            };
            return Ok(msg);
        }
        default:
            return Err(`Unsupported message type: "${msgType}"`);
    }
}

export function encodeMessage(msg: Message<string>): string {
    let output = '';
    switch (msg.type) {
        case 'INVOCATION':
            output += `ARRIRPC/${ARRI_VERSION} ${msg.rpcName}\n`;
            output += `content-type: ${msg.contentType}\n`;
            output += `req-id: ${msg.reqId}\n`;
            if (msg.clientVersion) {
                output += `client-version: ${msg.clientVersion}\n`;
            }
            if (msg.lastMsgId) {
                output += `last-msg-id: ${msg.lastMsgId}\n`;
            }
            for (const [key, value] of Object.entries(msg.customHeaders)) {
                output += `${key}: ${value}\n`;
            }
            output += '\n';
            if (msg.body) output += msg.body;
            break;
        case 'OK':
            output += `ARRIRPC/${ARRI_VERSION} OK\n`;
            output += `content-type: ${msg.contentType}\n`;
            output += `req-id: ${msg.reqId}\n`;
            if (msg.heartbeatInterval) {
                output += `heartbeat-interval: ${msg.heartbeatInterval}\n`;
            }
            for (const [key, value] of Object.entries(msg.customHeaders)) {
                output += `${key}: ${value}\n`;
            }
            output += '\n';
            if (msg.body) output += msg.body;
            break;
        case 'ERROR':
            output += `ARRIRPC/${ARRI_VERSION} ERROR\n`;
            output += `content-type: ${msg.contentType}\n`;
            output += `req-id: ${msg.reqId}\n`;
            output += `error-code: ${msg.errorCode}\n`;
            output += `error-msg: ${msg.errorMessage}\n`;
            for (const [key, value] of Object.entries(msg.customHeaders)) {
                output += `${key}: ${value}\n`;
            }
            output += '\n';
            if (msg.body) output += msg.body;
            break;
        case 'CONNECTION_START':
            output += `ARRIRPC/${ARRI_VERSION} CONNECTION_START\n`;
            if (msg.heartbeatInterval) {
                output += `heartbeat-interval: ${msg.heartbeatInterval}\n`;
            }
            output += '\n';
            break;
        case 'HEARTBEAT':
            output += `ARRIRPC/${ARRI_VERSION} HEARTBEAT\n`;
            if (msg.heartbeatInterval) {
                output += `heartbeat-interval: ${msg.heartbeatInterval}\n`;
            }
            output += '\n';
            break;
        case 'STREAM_DATA':
            output += `ARRIRPC/${ARRI_VERSION} STREAM_DATA\n`;
            output += `req-id: ${msg.reqId}\n`;
            if (msg.msgId) output += `msg-id: ${msg.msgId}\n`;
            output += '\n';
            if (msg.body) output += msg.body;
            break;
        case 'STREAM_END':
            output += `ARRIRPC/${ARRI_VERSION} STREAM_END\n`;
            output += `req-id: ${msg.reqId}\n`;
            if (msg.reason) output += `reason: ${msg.reason}\n`;
            output += `\n`;
            break;
        case 'STREAM_CANCEL':
            output += `ARRIRPC/${ARRI_VERSION} STREAM_CANCEL\n`;
            output += `req-id: ${msg.reqId}\n`;
            if (msg.reason) output += `reason: ${msg.reason}\n`;
            output += `\n`;
            break;
        default:
            msg satisfies never;
    }
    return output;
}

export function encodeMessageAsSseMessage(message: Message<string>): string {
    switch (message.type) {
        case 'HEARTBEAT':
            return `event: heartbeat\ndata:\n\n`;
        case 'OK':
            return `event: start\ndata:\n\n`;
        case 'ERROR':
            const error = {
                code: message.errorCode,
                message: message.errorMessage,
                data: undefined as any | undefined,
                stack: undefined as string[] | undefined,
            };
            try {
                if (message.body) {
                    switch (message.contentType) {
                        case 'application/json':
                            const body = JSON.parse(message.body);
                            if (body.data) error.data = body;
                            if (
                                body.stack &&
                                Array.isArray(body.stack) &&
                                (body.stack as any[]).every(
                                    (val) => typeof val === 'string',
                                )
                            ) {
                                error.stack = body.stack;
                            }
                            break;
                        case 'unknown':
                            break;
                    }
                }
            } catch (err) {
                console.error(`Error serializing error body`, err);
            }
            return `event: error\ndata: ${JSON.stringify(error)}\n\n`;
        case 'STREAM_END':
            if (message.reason) {
                return `event: end\ndata: {"reason":"${message.reason}"}\n\n`;
            }
            return `event: end\ndata:\n\n`;
        case 'STREAM_DATA': {
            let output = `event: message\n`;
            if (message.msgId) {
                output += `id: ${message.msgId}\n`;
            }
            if (message.body) {
                output += `data: ${message.body}\n\n`;
            } else {
                output += `data:\n\n`;
            }
            return output;
        }
        case 'STREAM_CANCEL':
            if (message.reason) {
                return `event: cancel\ndata: {"reason":"${message.reason}"}\n\n`;
            }
            return `event: cancel\ndata:\n\n`;
        case 'CONNECTION_START':
        case 'INVOCATION':
            return '';
        default:
            message satisfies never;
            return '';
    }
}

export function parseHeaderLine(input: string): [string, string] {
    let keyFinished = false;
    let keyIndexEnd = -1;
    let valueIndexStart = -1;
    for (let i = 0; i < input.length; i++) {
        if (!keyFinished) {
            if (input[i] === ':') {
                keyIndexEnd = i;
                keyFinished = true;
                continue;
            }
            continue;
        }
        if (input[i] === ' ') continue;
        valueIndexStart = i;
        break;
    }
    if (keyIndexEnd < 0) return [input, ''];
    if (valueIndexStart < 0) return [input.substring(0, keyIndexEnd), ''];
    return [input.slice(0, keyIndexEnd), input.slice(valueIndexStart)];
}
