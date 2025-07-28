import { a } from '@arrirpc/schema';
import * as b from 'benny';

import {
    ArriError,
    ClientMessage,
    encodeClientMessage,
    encodeServerMessage,
    parseClientMessage,
    parseServerMessage,
    ServerMessage,
} from '../src/_index';

const MessageData = a.object('MessageData', {
    message: a.string(),
    uint32: a.uint32(),
    boolean: a.boolean(),
});
const $$MessageData = a.compile(MessageData);
type MessageData = a.infer<typeof MessageData>;
const msgDataInstance: MessageData = {
    boolean: true,
    message: 'hello world',
    uint32: 15,
};

const successServerMessage: ServerMessage = {
    type: 'SUCCESS',
    reqId: '15',
    contentType: 'application/json',
    customHeaders: {
        foo: 'foo',
    },
    body: $$MessageData.serializeUnsafe(msgDataInstance),
};
const successServerMessageString = encodeServerMessage(successServerMessage);
const failureServerMessage: ServerMessage = {
    type: 'FAILURE',
    reqId: '15',
    contentType: 'application/json',
    customHeaders: {
        foo: 'foo',
    },
    error: new ArriError({ code: 150, message: 'failure' }),
};
const failureServerMessageString = encodeServerMessage(failureServerMessage);

const clientMessage: ClientMessage = {
    reqId: '15',
    rpcName: 'example.foo',
    contentType: 'application/json',
    customHeaders: {
        foo: 'foo',
    },
    lastMsgId: undefined,
    action: undefined,
    clientVersion: undefined,
    body: $$MessageData.serializeUnsafe(msgDataInstance),
};
const clientMessageString = encodeClientMessage(clientMessage);

b.suite(
    'parsing messages',
    b.add('parse server "success" message', () => {
        const result = parseServerMessage(successServerMessageString);
        if (!result.success) {
            throw new Error(`Received error. "${result.error}"`);
        }
        $$MessageData.parse((result.value as any).body);
    }),
    b.add('parse server "failure" message', () => {
        const result = parseServerMessage(failureServerMessageString);
        if (!result.success) {
            throw new Error(`Received error. "${result.error}"`);
        }
    }),
    b.add('parse client message', () => {
        const result = parseClientMessage(clientMessageString);
        if (!result.success) {
            throw new Error(`Received error. "${result.error}"`);
        }
        $$MessageData.parse(result.value.body);
    }),
    b.cycle(),
    b.save({ file: 'parsing-messages', format: 'chart.html' }),
);

b.suite(
    'encoding messages',
    b.add('server "success" message', () => {
        encodeServerMessage(successServerMessage);
    }),
    b.add('server "failure" message', () => {
        encodeServerMessage(failureServerMessage);
    }),
    b.add('client message', () => {
        encodeClientMessage(clientMessage);
    }),
    b.cycle(),
    b.save({ file: 'encoding-messages', format: 'chart.html' }),
);
