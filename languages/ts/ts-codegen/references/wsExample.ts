/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
import { arriWsRequest, type WsOptions } from "@arrirpc/client";

export class UserService {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;

    constructor(opts: { baseUrl?: string; headers?: Record<string, string> }) {
        this.baseUrl = opts.baseUrl ?? "";
        this.headers = opts.headers ?? {};
    }

    createConnection(opts: WsOptions<ServerMessage>) {
        return arriWsRequest<ClientMessage, ServerMessage>({
            url: `${this.baseUrl}/users/create-connection`,
            headers: this.headers,
            parser: $$ClientMessage.parse,
            serializer: $$ClientMessage.serialize,
            onOpen: opts.onOpen,
            onClose: opts.onClose,
            onError: opts.onError,
            onConnectionError: opts.onConnectionError,
            onMessage: opts.onMessage,
            clientVersion: "1",
        });
    }
}

export interface ServerMessage {
    id: string;
    content: string;
}
export const $$ServerMessage = {
    parse(input: unknown): ServerMessage {
        return {
            id: "",
            content: "",
        };
    },
    serialize(input: ServerMessage): string {
        return "";
    },
};

export interface ClientMessage {
    id: string;
    content: string;
}

export const $$ClientMessage = {
    parse(input: unknown): ClientMessage {
        return {
            id: "",
            content: "",
        };
    },
    serialize(input: ClientMessage): string {
        return "";
    },
};
