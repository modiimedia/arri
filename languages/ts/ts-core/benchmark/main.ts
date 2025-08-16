import { a } from '@arrirpc/schema';
import * as b from 'benny';

import {
    InvocationMessage,
    encodeMessage,
    parseMessage,
    Message,
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

const okMessage: Message = {
    type: 'OK',
    reqId: '15',
    contentType: 'application/json',
    heartbeatInterval: undefined,
    customHeaders: {
        foo: 'foo',
    },
    body: $$MessageData.serializeUnsafe(msgDataInstance),
};
const okMessageString = encodeMessage(okMessage);
const errorMessage: Message = {
    type: 'ERROR',
    reqId: '15',
    contentType: 'application/json',
    customHeaders: {
        foo: 'foo',
    },
    errorCode: 150,
    errorMessage: 'failure',
    body: undefined,
};
const errorMessageString = encodeMessage(errorMessage);

const invocationMessage: InvocationMessage = {
    type: 'INVOCATION',
    reqId: '15',
    rpcName: 'example.foo',
    contentType: 'application/json',
    customHeaders: {
        foo: 'foo',
    },
    lastMsgId: undefined,
    clientVersion: undefined,
    body: $$MessageData.serializeUnsafe(msgDataInstance),
};
const clientMessageString = encodeMessage(invocationMessage);

b.suite(
    'parsing messages',
    b.add('parse server "ok" message', () => {
        const result = parseMessage(okMessageString);
        if (!result.ok) {
            throw new Error(`Received error. "${result.error}"`);
        }
    }),
    b.add('parse server "failure" message', () => {
        const result = parseMessage(errorMessageString);
        if (!result.ok) {
            throw new Error(`Received error. "${result.error}"`);
        }
    }),
    b.add('parse client message', () => {
        const result = parseMessage(clientMessageString);
        if (!result.ok) {
            throw new Error(`Received error. "${result.error}"`);
        }
    }),
    b.cycle(),
    b.save({ file: 'parsing-messages', format: 'chart.html' }),
);

b.suite(
    'encoding messages',
    b.add('server "success" message', () => {
        encodeMessage(okMessage);
    }),
    b.add('server "failure" message', () => {
        encodeMessage(errorMessage);
    }),
    b.add('client message', () => {
        encodeMessage(invocationMessage);
    }),
    b.cycle(),
    b.save({ file: 'encoding-messages', format: 'chart.html' }),
);
