import { ArriError, parseArriError, serializeArriError } from './errors';
import { Result } from './helpers';

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
export interface ClientMessage<T = string> {
    rpcName: string;
    reqId: string | undefined;
    action: ClientMessageAction | undefined;
    contentType: 'application/json';
    clientVersion: string | undefined;
    lastEventId: string | undefined;
    customHeaders: Record<string, string>;
    body: T | undefined;
}

export const ClientMessageActionValues = ['CLOSE'] as const;
export type ClientMessageAction = (typeof ClientMessageActionValues)[number];
export function isClientMessageAction(
    input: unknown,
): input is ClientMessageAction {
    return (
        typeof input === 'string' &&
        ClientMessageActionValues.includes(input as any)
    );
}

// TODO: make it so body can also be binary
export type ServerMessage<T = string> =
    | ServerSuccessMessage<T>
    | ServerFailureMessage
    | ServerHeartbeatMessage
    | ServerConnectionStartMessage
    | ServerEventStreamStartMessage
    | ServerEventStreamEventMessage<T>
    | ServerEventStreamEndMessage;
export interface ServerSuccessMessage<T = string> {
    type: 'SUCCESS';
    reqId?: string;
    path?: string;
    method?: string;
    customHeaders: Record<string, string>;
    contentType: 'application/json';
    body?: T;
}
export interface ServerFailureMessage {
    type: 'FAILURE';
    reqId?: string;
    path?: string;
    method?: string;
    customHeaders: Record<string, string>;
    contentType: 'application/json';
    error: ArriError;
}
export interface ServerHeartbeatMessage {
    type: 'HEARTBEAT';
    heartbeatInterval: number | undefined;
}
export interface ServerConnectionStartMessage {
    type: 'CONNECTION_START';
    heartbeatInterval: number | undefined;
}
export type ServerEventStreamMessage<T = string> =
    | ServerHeartbeatMessage
    | ServerEventStreamStartMessage
    | ServerEventStreamEventMessage<T>
    | ServerEventStreamEndMessage;
export interface ServerEventStreamStartMessage {
    type: 'ES_START';
    reqId: string | undefined;
    heartbeatInterval: number | undefined;
    customHeaders: Record<string, string>;
    contentType: 'application/json';
}
export interface ServerEventStreamEventMessage<T> {
    type: 'ES_EVENT';
    reqId: string | undefined;
    eventId: string | undefined;
    body?: T;
}
export interface ServerEventStreamEndMessage {
    type: 'ES_END';
    reqId: string | undefined;
    reason: string | undefined;
}

// const msg = `
// ARRIRPC/1.0 users.getUsers
// event: response
// success: true
// req-id: 135
// content-type: application/json

// {"message":"hello world"}

// ARRIRPC/1.0
// event: ping

// ARRIRPC/1.0
// event: connection
// ping-interval: 15
// `;

export function parseClientMessage(
    input: string,
): Result<ClientMessage, string> {
    let procedure: string | undefined;
    let reqId: string | undefined;
    let action: ClientMessage['action'];
    let clientVersion: string | undefined;
    let contentType: string | undefined;
    let lastEventId: string | undefined;
    const customHeaders: Record<string, string> = {};
    let currentLine = '';
    let bodyStartIndex: number | undefined;

    function processLine(): string | null {
        if (!procedure) {
            const [arriVersion, rpcName, rpcAction] = currentLine.split(' ');
            if (!arriVersion || !rpcName) return 'Invalid';
            if (!isCurrentArriVersionPrefix(arriVersion)) {
                return `Unsupported Arrirpc version. Expected "ARRIRPC/${ARRI_VERSION}". Got "${arriVersion}".`;
            }
            if (rpcAction) {
                if (!isClientMessageAction(rpcAction)) return 'Invalid action';
                action = rpcAction;
            }
            procedure = rpcName;
            currentLine = '';
            return null;
        }
        const [key, value] = parseHeaderLine(currentLine);
        switch (key) {
            case 'client-version':
                clientVersion = value;
                break;
            case 'req-id':
                reqId = value;
                break;
            case 'content-type':
                contentType = value;
                break;
            case 'last-event-id':
                lastEventId = value;
                break;
            default:
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
            if (err) {
                return {
                    success: false,
                    error: err,
                };
            }
            bodyStartIndex = i + 2;
            break;
        }
        if (char === '\n') {
            const err = processLine();
            if (err) {
                return {
                    success: false,
                    error: err,
                };
            }
            continue;
        }
        currentLine += char;
    }

    if (!procedure) {
        return {
            success: false,
            error: "Invalid message. Didn't contain procedure name.",
        };
    }
    if (typeof bodyStartIndex === 'undefined') {
        return {
            success: false,
            error: 'Invalid message. Missing "\\n\\n" delimiter indicating end of headers',
        };
    }
    if (contentType !== 'application/json') {
        return {
            success: false,
            error: `Invalid message. content-type header must be "application/json"`,
        };
    }
    const bodyStr = input.slice(bodyStartIndex);
    if (bodyStr.length === 0) {
        return {
            success: true,
            value: {
                rpcName: procedure,
                reqId: reqId,
                lastEventId: lastEventId,
                clientVersion: clientVersion,
                customHeaders: customHeaders,
                contentType: contentType,
                action: action,
                body: undefined,
            },
        };
    }
    return {
        success: true,
        value: {
            rpcName: procedure,
            reqId: reqId,
            lastEventId: lastEventId,
            clientVersion: clientVersion,
            contentType: contentType,
            customHeaders: customHeaders,
            action: action,
            body: bodyStr.trim(),
        },
    };
}

export function encodeClientMessage(input: ClientMessage<string>): string {
    let output = `ARRIRPC/0.0.8 ${input.rpcName}`;
    if (input.action) output += ` ${input.action}`;
    output += `\ncontent-type: ${input.contentType}`;
    if (input.reqId) output += `\nreq-id: ${input.reqId}`;
    if (input.clientVersion)
        output += `\nclient-version: ${input.clientVersion}`;
    for (const [key, value] of Object.entries(input.customHeaders)) {
        output += `\n${key}: ${value}`;
    }
    output += '\n\n';
    if (input.body) output += input.body;
    return output;
}

export function parseServerMessage(
    input: string,
): Result<ServerMessage, string> {
    let reqId: string | undefined;
    let msgType: ServerMessage<any>['type'] | 'UNKNOWN' | undefined;
    let contentType: 'application/json' | undefined;
    let eventId: string | undefined;
    let reason: string | undefined;
    const customHeaders: Record<string, string> = {};
    let currentLine = '';
    let bodyStartIndex: number | undefined;
    let heartbeatInterval: number | undefined;
    function processLine() {
        if (typeof msgType === 'undefined') {
            switch (currentLine) {
                case `ARRIRPC/${ARRI_VERSION} SUCCESS`: {
                    msgType = 'SUCCESS';
                    currentLine = '';
                    return;
                }
                case `ARRIRPC/${ARRI_VERSION} FAILURE`: {
                    msgType = 'FAILURE';
                    currentLine = '';
                    return;
                }
                case `ARRIRPC/${ARRI_VERSION} CONNECTION_START`: {
                    msgType = 'CONNECTION_START';
                    currentLine = '';
                    return;
                }
                case `ARRIRPC/${ARRI_VERSION} HEARTBEAT`: {
                    msgType = 'HEARTBEAT';
                    currentLine = '';
                    return;
                }
                case `ARRIRPC/${ARRI_VERSION} ES_START`: {
                    msgType = 'ES_START';
                    currentLine = '';
                    return;
                }
                case `ARRIRPC/${ARRI_VERSION} ES_EVENT`: {
                    msgType = 'ES_EVENT';
                    currentLine = '';
                    return;
                }
                case `ARRIRPC/${ARRI_VERSION} ES_END`: {
                    msgType = 'ES_END';
                    currentLine = '';
                    return;
                }
                default: {
                    msgType = 'UNKNOWN';
                    currentLine = '';
                    return;
                }
            }
        }
        const [key, value] = parseHeaderLine(currentLine);
        switch (key) {
            case 'req-id':
                reqId = value;
                break;
            case 'content-type':
                if (value == 'application/json') {
                    contentType = value;
                }
                break;
            case 'heartbeat-interval': {
                const val = Number(value);
                if (!Number.isNaN(val)) {
                    heartbeatInterval = val;
                }
                break;
            }
            case 'event-id': {
                eventId = value;
                break;
            }
            default:
                customHeaders[key] = value;
                break;
        }
        currentLine = '';
    }

    for (let i = 0; i < input.length; i++) {
        const char = input[i]!;
        if (char === '\n' && input[i + 1] === '\n') {
            processLine();
            bodyStartIndex = i + 2;
            break;
        }
        if (char === '\n') {
            processLine();
            continue;
        }
        currentLine += char;
    }

    if (msgType === 'UNKNOWN' || typeof msgType === 'undefined') {
        return {
            success: false,
            error: 'Invalid message. Must begin with a message type header. Ex: "ARRIRPC/{version} {msgType}"',
        };
    }
    if (contentType && contentType !== 'application/json') {
        return {
            success: false,
            error: 'Invalid message. Only "application/json" is supported as a content type.',
        };
    }
    if (typeof bodyStartIndex === 'undefined') {
        return {
            success: false,
            error: 'Invalid message. Missing "\\n\\n" delimiter indicating end of headers',
        };
    }
    const bodyStr = input.slice(bodyStartIndex);
    switch (msgType) {
        case 'SUCCESS': {
            return {
                success: true,
                value: {
                    type: 'SUCCESS',
                    reqId: reqId,
                    customHeaders: customHeaders,
                    contentType: contentType ?? 'application/json',
                    body: bodyStr.length ? bodyStr : undefined,
                },
            };
        }
        case 'FAILURE': {
            const err = parseArriError(JSON.parse(bodyStr));
            if (!err.success) {
                return {
                    success: false,
                    error: err.error,
                };
            }
            return {
                success: true,
                value: {
                    type: 'FAILURE',
                    reqId: reqId,
                    customHeaders: customHeaders,
                    contentType: contentType ?? 'application/json',
                    error: err.value,
                },
            };
        }
        case 'CONNECTION_START':
            return {
                success: true,
                value: {
                    type: 'CONNECTION_START',
                    heartbeatInterval: heartbeatInterval,
                },
            };
        case 'HEARTBEAT':
            return {
                success: true,
                value: {
                    type: 'HEARTBEAT',
                    heartbeatInterval: heartbeatInterval,
                },
            };
        case 'ES_START': {
            return {
                success: true,
                value: {
                    type: 'ES_START',
                    reqId: reqId,
                    heartbeatInterval: heartbeatInterval,
                    contentType: contentType ?? 'application/json',
                    customHeaders: customHeaders,
                },
            };
        }
        case 'ES_EVENT': {
            return {
                success: true,
                value: {
                    type: 'ES_EVENT',
                    reqId: reqId,
                    eventId: eventId,
                    body: bodyStr,
                },
            };
        }
        case 'ES_END': {
            return {
                success: true,
                value: {
                    type: 'ES_END',
                    reqId: reqId,
                    reason: reason,
                },
            };
        }
        default:
            msgType satisfies never;
            return {
                success: false,
                error: 'Unknown message type',
            };
    }
}
export function encodeServerMessage(
    input: ServerMessage,
    options?: { includeErrorStackTrack?: boolean },
): string {
    let output = `ARRIRPC/${ARRI_VERSION} ${input.type}\n`;
    switch (input.type) {
        case 'SUCCESS': {
            output += `content-type: ${input.contentType}\n`;
            if (input.reqId) output += `req-id: ${input.reqId}\n`;
            for (const [key, value] of Object.entries(input.customHeaders)) {
                output += `${key.toLowerCase()}: ${value}\n`;
            }
            output += '\n';
            if (input.body) output += input.body;
            return output;
        }
        case 'FAILURE':
            output += `content-type: ${input.contentType}\n`;
            if (input.reqId) output += `req-id: ${input.reqId}\n`;
            for (const [key, value] of Object.entries(input.customHeaders)) {
                output += `${key.toLowerCase()}: ${value}\n`;
            }
            output += '\n';
            output += serializeArriError(
                input.error,
                options?.includeErrorStackTrack ?? false,
            );
            return output;
        case 'CONNECTION_START':
        case 'HEARTBEAT': {
            if (input.heartbeatInterval) {
                output += `heartbeat-interval: ${input.heartbeatInterval}\n`;
            }
            output += '\n';
            return output;
        }
        case 'ES_START': {
            output += `content-type: ${input.contentType}\n`;
            if (input.reqId) output += `req-id: ${input.reqId}\n`;
            if (input.heartbeatInterval) {
                output += `heartbeat-interval: ${input.heartbeatInterval}\n`;
            }
            for (const [key, value] of Object.entries(input.customHeaders)) {
                output += `${key.toLowerCase()}: ${value}\n`;
            }
            output += '\n';
            return output;
        }
        case 'ES_EVENT': {
            if (input.reqId) output += `req-id: ${input.reqId}\n`;
            if (input.eventId) output += `event-id: ${input.eventId}\n`;
            output += '\n';
            if (input.body) {
                output += input.body;
            }
            return output;
        }
        case 'ES_END':
            if (input.reqId) output += `req-id: ${input.reqId}\n`;
            if (input.reason) output += `reason: ${input.reason}\n`;
            output += '\n';
            return output;
        default:
            input satisfies never;
            throw new Error(`Unsupported message type: ${(input as any).type}`);
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
