import { ClientMessage } from '@arrirpc/core';

export interface MessageReceiver {
    receive(msg: ClientMessage): void;
}

export class NoopMessageReceiver implements MessageReceiver {
    receive(_: ClientMessage): void {}
}
