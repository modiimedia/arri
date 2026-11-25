import { ClientMessage, ServerMessage } from '@arrirpc/core';

import { MessageReceiver, NoopMessageReceiver } from './receiver';
import { MaybePromise } from './utils';

export abstract class TransportAdapter {
    receiver: MessageReceiver = new NoopMessageReceiver();

    init(receiver: MessageReceiver) {
        this.receiver = receiver;
    }

    abstract get name(): string;

    /**
     * route a server output to the client
     */
    abstract send(msg: ServerMessage): MaybePromise<void>;

    /**
     * Enable core to start this transport.
     */
    abstract start(): MaybePromise<void>;

    /**
     * Enable core to stop this transport
     */
    abstract stop(): MaybePromise<void>;
}

/**
 * Simple test adapter that you can use to simulate receiving inputs from the client and sending outputs back
 */
export class TestAdapter extends TransportAdapter {
    constructor(hook?: (msg: ServerMessage) => MaybePromise<void>) {
        super();
        this.sendHook = hook;
    }

    get name(): string {
        return 'test-transport';
    }
    private sendHook?: (msg: ServerMessage) => MaybePromise<void>;

    async send(msg: ServerMessage) {
        if (typeof this.sendHook === 'undefined') {
            throw new Error(
                `Please register onSend before attempting to use the test transport`,
            );
        }
        await this.sendHook?.(msg);
    }

    onSend(hook: (msg: ServerMessage) => MaybePromise<void>) {
        this.sendHook = hook;
    }

    receive(msg: ClientMessage) {
        this.receiver.receive(msg);
    }

    start() {}
    stop() {}
}
