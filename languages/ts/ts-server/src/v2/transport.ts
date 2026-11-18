import { ServerMessage } from '@arrirpc/core';

export abstract class TransportAdapter {
    abstract get name(): string;
    abstract send(msg: ServerMessage): Promise<void> | void;
}
