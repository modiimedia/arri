import { arriWebsocketRequest, type WsOptions } from "arri-client";

export class UserService {
    private readonly baseUrl: string;
    private readonly headers: Record<string, string>;

    createConnection(opts: WsOptions<ServerMessage>) {
        return arriWebsocketRequest<ClientMessage, ServerMessage>({
            url: `${this.baseUrl}/users/create-connection`,
            headers: this.headers,
            parser: (input) => $$ServerMessage.parse(input),
            serializer: (input) => $$ClientMessage.serialize(input),
            onOpen: opts.onOpen,
            onClose: opts.onClose,
            onError: opts.onError,
            onConnectionError: opts.onConnectionError,
            onMessage: opts.onMessage,
        });
    }
}

export interface ServerMessage {
    id: string;
    content: string;
}
const $$ServerMessage = {
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

const $$ClientMessage = {
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
