import { encodeMessage, parseClientMessage } from '@arrirpc/core';

import type { ArriServerCore } from './core';
import type { TransportInfo } from './transport';

/**
 * A transport that carries encoded Arri messages directly (WebSockets, TCP, stdio, MessagePort, etc).
 * Framing (if the transport needs it) is the adapter's job.
 */
export interface MessageTransport {
    info: TransportInfo;
    sendBytes(bytes: Uint8Array): void | Promise<void>;
    close(): void;
    connectionMessages?: boolean;
}

export interface MessageTransportHandle {
    receiveBytes(bytes: Uint8Array): void;
    closed(): void;
}

export function connectMessageTransport(
    core: ArriServerCore,
    transport: MessageTransport,
): MessageTransportHandle {
    const connection = core.openConnection({
        info: transport.info,
        connectionMessages: transport.connectionMessages ?? true,
        send: (msg) => transport.sendBytes(encodeMessage(msg)),
        close: () => transport.close(),
    });
    return {
        receiveBytes(bytes) {
            const result = parseClientMessage(bytes);
            if (result.ok) connection.receive(result.value);
            else connection.receiveInvalid(result.error);
        },
        closed: () => connection.closed(),
    };
}
