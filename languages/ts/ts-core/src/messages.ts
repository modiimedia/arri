import { Result } from './helpers';

export interface ClientMessage<T = string> {
    rpcName: string;
    reqId?: string;
    // path?: string;
    // method?: string;
    contentType: 'application/json';
    clientVersion?: string;
    customHeaders: Record<string, string>;
    body?: T;
}

export interface ServerMessage<T = string> {
    rpcName: string;
    success: boolean;
    reqId?: string;
    customHeaders: Record<string, string>;
    body?: T;
}

export function parseClientMessage(
    input: string,
): Result<ClientMessage, string> {
    let procedure: string | undefined;
    let reqId: string | undefined;
    let clientVersion: string | undefined;
    let contentType: string | undefined;
    const customHeaders: Record<string, string> = {};
    let currentLine = '';
    let previousChar = '';
    let bodyStartIndex: number | undefined;

    function processLine() {
        if (!procedure) {
            procedure = currentLine.trim();
            currentLine = '';
            return;
        }
        const [key, value] = parseHeaderLine(currentLine);
        switch (key) {
            // case 'path':
            //     path = value;
            //     break;
            // case 'method':
            //     method = value;
            //     break;
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
        if (char === '\n' && previousChar === '\n') {
            bodyStartIndex = i + 1;
            break;
        }
        if (char === '\n') {
            processLine();
            continue;
        }
        previousChar = char;
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
    let output = `ARRIRPC/1.0 ${input.rpcName}`;
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
    let rpcName: string | undefined;
    let reqId: string | undefined;
    let success: boolean | undefined;
    let clientVersion: string | undefined;
    const customHeaders: Record<string, string> = {};
    let currentLine = '';
    let previousChar = '';
    let bodyStartIndex: number | undefined;
    function processLine() {
        if (!rpcName) {
            rpcName = currentLine.trim();
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
            case 'success':
                success = value === 'true' || value === 'TRUE';
                break;
            default:
                customHeaders[key] = value;
                break;
        }
        currentLine = '';
    }

    for (let i = 0; i < input.length; i++) {
        const char = input[i]!;
        if (char === '\n' && previousChar === '\n') {
            bodyStartIndex = i + 1;
            break;
        }
        if (char === '\n') {
            processLine();
            continue;
        }
        previousChar = char;
        currentLine += char;
    }

    if (!rpcName || typeof success == 'undefined') {
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
    const bodyStr = input.slice(bodyStartIndex);
    if (bodyStr.length === 0) {
        return {
            success: true,
            value: {
                rpcName: rpcName,
                reqId: reqId,
                success: success,
                customHeaders: customHeaders,
                body: undefined,
            },
        };
    }
}

export function parseHeaderLine(input: string): [string, string] {
    const [key, value] = input.split(':');
    return [key?.trim() ?? '', value?.trim() ?? ''];
}
