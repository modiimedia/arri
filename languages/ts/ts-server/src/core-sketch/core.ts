import {
    type ArriErrorPayload,
    ArriHeaders,
    type ClientMessage,
    DEFAULT_CONTENT_TYPE,
    type ErrorCode,
    type InvocationMessage,
    isValidRpcName,
    type ReqId,
    type ServerMessage,
} from '@arrirpc/core';

import { AsyncQueue } from './async-queue';
import {
    type CallContext,
    hasStreamedInput,
    type OutputStream,
    type Procedure,
    RpcError,
} from './procedures';
import type { ConnectionHandle, TransportConnection } from './transport';

export interface ArriServerCoreOptions {
    /**
     * Only applies to connections with `connectionMessages` enabled.
     */
    heartbeatIntervalMs?: number;
}

export class ArriServerCore {
    private readonly procedureMap = new Map<string, Procedure>();
    private readonly connections = new Set<ServerConnection>();
    private isShuttingDownFlag = false;

    constructor(readonly options: ArriServerCoreOptions = {}) {}

    register(rpcName: string, procedure: Procedure): this {
        if (!isValidRpcName(rpcName)) {
            throw new Error(`Invalid rpc name "${rpcName}".`);
        }
        this.procedureMap.set(rpcName, procedure);
        return this;
    }

    /**
     * Lets adapters that route natively (e.g. HTTP paths) build their own routing tables.
     */
    get procedures(): ReadonlyMap<string, Procedure> {
        return this.procedureMap;
    }

    get isShuttingDown(): boolean {
        return this.isShuttingDownFlag;
    }

    openConnection(transport: TransportConnection): ConnectionHandle {
        const connection = new ServerConnection(this, transport, () =>
            this.connections.delete(connection),
        );
        this.connections.add(connection);
        connection.start();
        return connection;
    }

    /**
     * Stop accepting new calls, send GOAWAY, wait for in-flight calls to finish, then close every connection.
     */
    async shutdown(): Promise<void> {
        this.isShuttingDownFlag = true;
        await Promise.all(
            [...this.connections].map((connection) =>
                connection.goAwayAndDrain(),
            ),
        );
    }
}

class ServerConnection implements ConnectionHandle {
    private readonly calls = new Map<string, Call>();
    private heartbeatTimer?: ReturnType<typeof setInterval>;
    private isClosed = false;
    private resolveDrained?: () => void;

    constructor(
        readonly core: ArriServerCore,
        readonly transport: TransportConnection,
        private readonly onClosed: () => void,
    ) {}

    start(): void {
        if (!this.transport.connectionMessages) return;
        const heartbeatInterval = this.core.options.heartbeatIntervalMs;
        void this.send({ type: 'CONNECTION_START', heartbeatInterval });
        if (heartbeatInterval) {
            this.heartbeatTimer = setInterval(
                () => void this.send({ type: 'HEARTBEAT', heartbeatInterval }),
                heartbeatInterval,
            );
            this.heartbeatTimer.unref?.();
        }
    }

    receive(msg: ClientMessage): void {
        if (this.isClosed) return;
        if (msg.type === 'INVOCATION') {
            this.startCall(msg);
            return;
        }
        this.calls.get(msg.reqId)?.receive(msg);
    }

    receiveInvalid(failure: { error: string; reqId?: ReqId }): void {
        if (this.isClosed) return;
        const call =
            failure.reqId === undefined
                ? undefined
                : this.calls.get(failure.reqId);
        const payload: ArriErrorPayload = {
            code: 'PROTOCOL_ERROR',
            message: failure.error,
        };
        if (call) {
            void call.fail(payload);
            return;
        }
        void this.sendError(failure.reqId, payload);
    }

    closed(): void {
        if (this.isClosed) return;
        this.isClosed = true;
        clearInterval(this.heartbeatTimer);
        for (const call of this.calls.values()) {
            call.abort(new RpcError('CONNECTION_ERROR', 'Connection closed.'));
        }
        this.calls.clear();
        this.resolveDrained?.();
        this.onClosed();
    }

    async goAwayAndDrain(): Promise<void> {
        if (this.isClosed) return;
        if (this.transport.connectionMessages) {
            await this.send({ type: 'GOAWAY', reason: 'server shutting down' });
        }
        if (this.calls.size > 0) {
            await new Promise<void>((resolve) => {
                this.resolveDrained = resolve;
            });
        }
        this.transport.close();
        this.closed();
    }

    async send(msg: ServerMessage): Promise<void> {
        if (this.isClosed) return;
        try {
            await this.transport.send(msg);
        } catch {
            this.closed();
        }
    }

    sendError(reqId: ReqId | undefined, payload: ArriErrorPayload) {
        return this.send({
            type: 'ERROR',
            reqId,
            contentType: DEFAULT_CONTENT_TYPE,
            headers: new ArriHeaders(),
            body: encodeErrorPayload(payload),
        });
    }

    removeCall(reqId: ReqId): void {
        this.calls.delete(reqId);
        if (this.calls.size === 0) this.resolveDrained?.();
    }

    private startCall(invocation: InvocationMessage): void {
        const reject = (code: ErrorCode, message: string) =>
            void this.sendError(invocation.reqId, { code, message });

        if (this.core.isShuttingDown) {
            return reject('UNAVAILABLE', 'Server is shutting down.');
        }
        if (this.calls.has(invocation.reqId)) {
            return reject(
                'PROTOCOL_ERROR',
                `req-id "${invocation.reqId}" is already in use.`,
            );
        }
        const procedure = this.core.procedures.get(invocation.rpcName);
        if (!procedure) {
            return reject(
                'PROCEDURE_NOT_FOUND',
                `Procedure "${invocation.rpcName}" does not exist.`,
            );
        }
        if (!isSupportedContentType(invocation.contentType)) {
            return reject(
                'UNSUPPORTED_CONTENT_TYPE',
                `Unsupported content type "${invocation.contentType}".`,
            );
        }
        if (!acceptsJson(invocation.accept)) {
            return reject(
                'NOT_ACCEPTABLE',
                `Cannot produce a response matching "${invocation.accept}".`,
            );
        }
        if (hasStreamedInput(procedure) && invocation.body) {
            return reject(
                'PROTOCOL_ERROR',
                'INVOCATION must not have a body when the procedure input is a stream.',
            );
        }
        const call = new Call(this, invocation, procedure);
        this.calls.set(invocation.reqId, call);
        void call.run();
    }
}

type ClientStreamState = 'awaiting-stream-start' | 'streaming' | 'ended';

class Call {
    private readonly abortController = new AbortController();
    private readonly context: CallContext;
    private readonly inputs?: AsyncQueue<unknown>;
    private clientStreamState: ClientStreamState = 'awaiting-stream-start';
    private hasEnded = false;
    private hasStartedOutputStream = false;

    constructor(
        private readonly connection: ServerConnection,
        private readonly invocation: InvocationMessage,
        private readonly procedure: Procedure,
    ) {
        this.context = {
            rpcName: invocation.rpcName,
            headers: invocation.headers,
            responseHeaders: new ArriHeaders(),
            signal: this.abortController.signal,
            transport: connection.transport.info,
        };
        if (hasStreamedInput(procedure)) this.inputs = new AsyncQueue();
    }

    private get reqId() {
        return this.invocation.reqId;
    }

    receive(msg: Exclude<ClientMessage, InvocationMessage>): void {
        if (this.hasEnded) return;
        switch (msg.type) {
            case 'CANCEL':
                this.abort(new RpcError('CANCELLED', 'Call was cancelled.'));
                return;
            case 'STREAM_START':
                if (
                    !this.inputs ||
                    this.clientStreamState !== 'awaiting-stream-start'
                ) {
                    return this.protocolError('Unexpected STREAM_START.');
                }
                if (!isSupportedContentType(msg.contentType)) {
                    void this.fail({
                        code: 'UNSUPPORTED_CONTENT_TYPE',
                        message: `Unsupported content type "${msg.contentType}".`,
                    });
                    return;
                }
                this.clientStreamState = 'streaming';
                return;
            case 'STREAM_DATA': {
                if (!this.inputs || this.clientStreamState !== 'streaming') {
                    return this.protocolError(
                        'STREAM_DATA must be sent between STREAM_START and STREAM_END.',
                    );
                }
                let value: unknown;
                try {
                    value = this.procedure.input.decode(msg.body);
                } catch (err) {
                    void this.fail(invalidInputPayload(err));
                    return;
                }
                this.inputs.push(value);
                return;
            }
            case 'STREAM_END':
                if (!this.inputs || this.clientStreamState !== 'streaming') {
                    return this.protocolError('Unexpected STREAM_END.');
                }
                this.clientStreamState = 'ended';
                this.inputs.end();
                return;
        }
    }

    async run(): Promise<void> {
        try {
            switch (this.procedure.kind) {
                case 'unary': {
                    const output = await this.procedure.handler(
                        this.decodeInvocationBody(),
                        this.context,
                    );
                    await this.finishWithOk(output);
                    return;
                }
                case 'outputStream':
                    await this.procedure.handler(
                        this.decodeInvocationBody(),
                        this.createOutputStream(),
                        this.context,
                    );
                    await this.finishOutputStream();
                    return;
                case 'inputStream': {
                    const output = await this.procedure.handler(
                        this.inputs!,
                        this.context,
                    );
                    await this.finishWithOk(output);
                    return;
                }
                case 'bidirectional':
                    await this.procedure.handler(
                        this.inputs!,
                        this.createOutputStream(),
                        this.context,
                    );
                    await this.finishOutputStream();
                    return;
            }
        } catch (err) {
            await this.fail(toErrorPayload(err));
        }
    }

    abort(reason: RpcError): void {
        if (this.hasEnded) return;
        this.end();
        this.inputs?.fail(reason);
        this.abortController.abort(reason);
    }

    async fail(payload: ArriErrorPayload): Promise<void> {
        if (this.hasEnded) return;
        this.end();
        this.inputs?.fail(new RpcError('CANCELLED', 'Call has ended.'));
        this.abortController.abort(
            new RpcError('CANCELLED', 'Call failed: ' + payload.message),
        );
        await this.connection.send({
            type: 'ERROR',
            reqId: this.reqId,
            contentType: DEFAULT_CONTENT_TYPE,
            headers: this.context.responseHeaders,
            body: encodeErrorPayload(payload),
        });
    }

    private protocolError(message: string): void {
        void this.fail({ code: 'PROTOCOL_ERROR', message });
    }

    private end(): void {
        this.hasEnded = true;
        this.connection.removeCall(this.reqId);
    }

    private decodeInvocationBody(): unknown {
        try {
            return this.procedure.input.decode(this.invocation.body);
        } catch (err) {
            throw new RpcError(
                'INVALID_INPUT',
                invalidInputPayload(err).message,
            );
        }
    }

    private encodeOutput(value: unknown): Uint8Array {
        try {
            return this.procedure.output.encode(value);
        } catch {
            throw new RpcError(
                'OUTPUT_ENCODING_ERROR',
                'Failed to encode output.',
            );
        }
    }

    private async finishWithOk(output: unknown): Promise<void> {
        if (this.hasEnded) return;
        const body = this.encodeOutput(output);
        this.end();
        this.inputs?.end();
        await this.connection.send({
            type: 'OK',
            reqId: this.reqId,
            contentType: DEFAULT_CONTENT_TYPE,
            headers: this.context.responseHeaders,
            body,
        });
    }

    private createOutputStream(): OutputStream<unknown> {
        return {
            send: async (value, options) => {
                if (this.hasEnded) return;
                const body = this.encodeOutput(value);
                await this.startOutputStream();
                await this.connection.send({
                    type: 'STREAM_DATA',
                    reqId: this.reqId,
                    msgId: options?.msgId,
                    body,
                });
            },
            start: () => this.startOutputStream(),
        };
    }

    private async startOutputStream(): Promise<void> {
        if (this.hasStartedOutputStream || this.hasEnded) return;
        this.hasStartedOutputStream = true;
        await this.connection.send({
            type: 'STREAM_START',
            reqId: this.reqId,
            contentType: DEFAULT_CONTENT_TYPE,
            headers: this.context.responseHeaders,
        });
    }

    private async finishOutputStream(): Promise<void> {
        if (this.hasEnded) return;
        await this.startOutputStream();
        this.end();
        this.inputs?.end();
        await this.connection.send({ type: 'STREAM_END', reqId: this.reqId });
    }
}

function isSupportedContentType(contentType: string | undefined): boolean {
    if (contentType === undefined) return true;
    return mediaType(contentType) === DEFAULT_CONTENT_TYPE;
}

function acceptsJson(accept: string | undefined): boolean {
    if (accept === undefined) return true;
    return accept
        .split(',')
        .map(mediaType)
        .some(
            (type) =>
                type === DEFAULT_CONTENT_TYPE ||
                type === 'application/*' ||
                type === '*/*',
        );
}

function mediaType(headerValue: string): string {
    return headerValue.split(';')[0]!.trim().toLowerCase();
}

function invalidInputPayload(err: unknown): ArriErrorPayload {
    return {
        code: 'INVALID_INPUT',
        message: err instanceof Error ? err.message : 'Invalid input.',
    };
}

function toErrorPayload(err: unknown): ArriErrorPayload {
    if (err instanceof RpcError) {
        return {
            code: err.code,
            message: err.message,
            type: err.type,
            data: err.data,
        };
    }
    return { code: 'INTERNAL', message: 'Internal server error.' };
}

const textEncoder = new TextEncoder();

function encodeErrorPayload(payload: ArriErrorPayload): Uint8Array {
    return textEncoder.encode(JSON.stringify(payload));
}
