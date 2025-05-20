import { ArriError, parseArriError, serializeArriError } from './errors';
import { Result } from './helpers';

// TODO: make it so body can also be binary
export interface ClientMessage<T = string> {
    rpcName: string;
    reqId?: string;
    contentType: 'application/json';
    clientVersion?: string;
    customHeaders: Record<string, string>;
    body?: T;
}

// TODO: make it so body can also be binary
export type ServerMessage<T = string> =
    | ServerSuccessMessage<T>
    | ServerFailureMessage;
export interface ServerSuccessMessage<T = string> {
    success: true;
    reqId?: string;
    path?: string;
    method?: string;
    customHeaders: Record<string, string>;
    contentType: 'application/json';
    body?: T;
}
export interface ServerFailureMessage {
    success: false;
    reqId?: string;
    path?: string;
    method?: string;
    customHeaders: Record<string, string>;
    contentType: 'application/json';
    error: ArriError;
}
export interface ServerActionMessage {
    event: 'PING';
}
export interface ServerConnectionMessage {
    event: 'RESPONSE';
}

const msg = `
ARRIRPC/1.0 users.getUsers
event: response
success: true
req-id: 135
content-type: application/json

{"message":"hello world"}

ARRIRPC/1.0
event: ping

ARRIRPC/1.0
event: connection
ping-interval: 15
`;

export function parseClientMessage(
    input: string,
): Result<ClientMessage, string> {
    let procedure: string | undefined;
    let reqId: string | undefined;
    let clientVersion: string | undefined;
    let contentType: string | undefined;
    const customHeaders: Record<string, string> = {};
    let currentLine = '';
    let bodyStartIndex: number | undefined;

    function processLine() {
        if (!procedure) {
            const [arriVersion, rpcName] = currentLine.split(' ');
            if (!arriVersion || !rpcName) return;
            procedure = rpcName.trim();
            currentLine = '';
            return;
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
                clientVersion: clientVersion,
                customHeaders: customHeaders,
                contentType: contentType,
                body: undefined,
            },
        };
    }
    return {
        success: true,
        value: {
            rpcName: procedure,
            reqId: reqId,
            clientVersion: clientVersion,
            contentType: contentType,
            customHeaders: customHeaders,
            body: bodyStr.trim(),
        },
    };
}

export function encodeClientMessage(input: ClientMessage<string>): string {
    let output = `ARRIRPC/0.0.8 ${input.rpcName}`;
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
    let success: boolean | undefined;
    let contentType: string | undefined;
    const customHeaders: Record<string, string> = {};
    let currentLine = '';
    let bodyStartIndex: number | undefined;
    function processLine() {
        if (typeof success === 'undefined') {
            if (currentLine === 'ARRIRPC/0.0.8 SUCCESS') {
                success = true;
                currentLine = '';
                return;
            }
            success = false;
            currentLine = '';
            return;
        }
        const [key, value] = parseHeaderLine(currentLine);
        switch (key) {
            case 'req-id':
                reqId = value;
                break;
            case 'content-type':
                contentType = value;
                break;
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

    if (typeof success == 'undefined') {
        return {
            success: false,
            error: 'Invalid message. Must begin with success header.',
        };
    }
    if (typeof contentType == 'undefined') {
        return {
            success: false,
            error: 'Invalid message. Must include content-type error.',
        };
    }
    if (contentType !== 'application/json') {
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
    if (success && bodyStr.length === 0) {
        return {
            success: true,
            value: {
                reqId: reqId,
                success: success,
                customHeaders: customHeaders,
                contentType: contentType,
                body: undefined,
            },
        };
    }
    if (success) {
        return {
            success: true,
            value: {
                reqId: reqId,
                success: success,
                customHeaders: customHeaders,
                contentType: contentType,
                body: bodyStr,
            },
        };
    }
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
            reqId: reqId,
            success: success,
            customHeaders: customHeaders,
            contentType: contentType,
            error: err.value,
        },
    };
}
export function encodeServerMessage(
    input: ServerMessage,
    options?: { includeErrorStackTrack?: boolean },
): string {
    let output = `ARRIRPC/0.0.8`;
    if (input.success) {
        output += ` SUCCESS`;
    } else {
        output += ` FAILURE`;
    }
    output += `\ncontent-type: ${input.contentType}`;
    if (input.reqId) output += `\nreq-id: ${input.reqId}`;
    for (const [key, value] of Object.entries(input.customHeaders)) {
        output += `\n${key}: ${value}`;
    }
    output += `\n\n`;
    if (input.success) {
        if (input.body) output += input.body;
        return output;
    }
    output += serializeArriError(
        input.error,
        options?.includeErrorStackTrack ?? false,
    );
    return output;
}

export function parseHeaderLine(input: string): [string, string] {
    const [key, value] = input.split(':');
    return [key?.trim() ?? '', value?.trim() ?? ''];
}
