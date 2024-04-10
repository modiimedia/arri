import { randomUUID } from "crypto";
import { ArriErrorInstance } from "arri-client";
import { ofetch } from "ofetch";
import { test, expect, describe } from "vitest";
import {
    TestClient,
    type ObjectWithEveryType,
    type ObjectWithEveryOptionalType,
    type ObjectWithEveryNullableType,
    type WsMessageResponse,
    type RecursiveObject,
    type RecursiveUnion,
    type TypeBoxObject,
} from "./testClient.rpc";

function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, ms);
    });
}

const baseUrl = "http://127.0.0.1:2020";
const headers = {
    "x-test-header": "test",
};

const client = new TestClient({
    baseUrl,
    headers,
});
const unauthenticatedClient = new TestClient({
    baseUrl,
});

test("route request", async () => {
    const result = await ofetch("/routes/hello-world", {
        method: "post",
        baseURL: baseUrl,
        headers,
        body: {
            name: "John Doe",
        },
    });
    expect(result).toBe("hello world");
});

test("route request (unauthorized)", async () => {
    try {
        await ofetch("/routes/hello-world", {
            method: "post",
            baseURL: baseUrl,
        });
    } catch (err) {
        expect(err instanceof ArriErrorInstance);
        if (err instanceof ArriErrorInstance) {
            expect(err.code).toBe(401);
        }
    }
});

test("can handle RPCs with no params", async () => {
    const result = await client.tests.emptyParamsGetRequest();
    const result2 = await client.tests.emptyParamsPostRequest();
    expect(typeof result.message).toBe("string");
    expect(typeof result2.message).toBe("string");
});
test("can handle RPCs with no response", async () => {
    await client.tests.emptyResponseGetRequest({ message: "ok" });
    await client.tests.emptyResponsePostRequest({ message: "ok" });
});
const input: ObjectWithEveryType = {
    any: {
        blah: "blah",
        blah2: "blah2",
        blah3: true,
    },
    boolean: true,
    string: "hello world",
    timestamp: new Date(),
    float32: 0,
    float64: 0,
    int8: 0,
    uint8: 0,
    int16: 0,
    uint16: 0,
    int32: 0,
    uint32: 0,
    int64: 0n,
    uint64: 0n,
    enumerator: "B",
    array: [true, false, false],
    object: {
        string: "",
        boolean: false,
        timestamp: new Date(),
    },
    record: {
        A: true,
        B: false,
    },
    discriminator: {
        type: "B",
        title: "Hello World",
        description: "",
    },
    nestedObject: {
        id: "",
        timestamp: new Date(),
        data: {
            id: "",
            timestamp: new Date(),
            data: {
                id: "",
                timestamp: new Date(),
            },
        },
    },
    nestedArray: [
        [
            { id: "", timestamp: new Date() },
            { id: "", timestamp: new Date() },
        ],
    ],
};
test("can send/receive object every field type", async () => {
    const result = await client.tests.sendObject(input);
    expect(result).toStrictEqual(input);
});
test("unauthenticated RPC request returns a 401 error", async () => {
    try {
        await unauthenticatedClient.tests.sendObject(input);
        expect(true).toBe(false);
    } catch (err) {
        expect(err instanceof ArriErrorInstance);
        if (err instanceof ArriErrorInstance) {
            expect(err.code).toBe(401);
        }
    }
});
test("can send/receive partial objects", async () => {
    const fullObjectResult = await client.tests.sendPartialObject(input);
    expect(fullObjectResult).toStrictEqual(input);
    const partialInput: ObjectWithEveryOptionalType = {
        string: "",
        int16: 0,
        int64: 0n,
    };
    const partialObjectResult =
        await client.tests.sendPartialObject(partialInput);
    expect(partialObjectResult).toStrictEqual(partialInput);
});
test("can send/receive object with nullable fields", async () => {
    const fullObjectResult =
        await client.tests.sendObjectWithNullableFields(input);
    expect(fullObjectResult).toStrictEqual(input);
    const nullableInput: ObjectWithEveryNullableType = {
        any: null,
        boolean: null,
        string: null,
        timestamp: null,
        float32: null,
        float64: null,
        int8: null,
        uint8: null,
        int16: null,
        uint16: null,
        int32: null,
        uint32: null,
        int64: null,
        uint64: null,
        enumerator: null,
        array: null,
        object: null,
        record: null,
        discriminator: null,
        nestedObject: {
            id: null,
            timestamp: null,
            data: {
                id: null,
                timestamp: null,
                data: null,
            },
        },
        nestedArray: [null],
    };
    const nullableResult =
        await client.tests.sendObjectWithNullableFields(nullableInput);
    expect(nullableResult).toStrictEqual(nullableInput);
});

test("can send/receive recursive objects", async () => {
    const payload: RecursiveObject = {
        left: {
            left: {
                left: null,
                right: null,
                value: "depth3",
            },
            right: {
                left: null,
                right: {
                    left: null,
                    right: null,
                    value: "depth4",
                },
                value: "depth3",
            },
            value: "depth2",
        },
        right: null,
        value: "depth1",
    };
    const result = await client.tests.sendRecursiveObject(payload);
    expect(result).toStrictEqual(payload);
});

test("can send/receive recursive unions", async () => {
    const payload: RecursiveUnion = {
        type: "CHILDREN",
        data: [
            {
                type: "CHILD",
                data: {
                    type: "TEXT",
                    data: "Hello world",
                },
            },
            {
                type: "SHAPE",
                data: {
                    width: 1,
                    height: 2,
                    color: "blue",
                },
            },
            {
                type: "CHILDREN",
                data: [
                    {
                        type: "TEXT",
                        data: "Hello world",
                    },
                ],
            },
        ],
    };
    const result = await client.tests.sendRecursiveUnion(payload);
    expect(result).toStrictEqual(payload);
});

test("[SSE] supports server sent events", async () => {
    let wasConnected = false;
    let receivedMessageCount = 0;
    const controller = client.tests.streamMessages(
        { channelId: "1" },
        {
            onMessage(msg) {
                receivedMessageCount++;
                expect(msg.channelId).toBe("1");
                switch (msg.messageType) {
                    case "IMAGE":
                        expect(msg.date instanceof Date).toBe(true);
                        expect(typeof msg.image).toBe("string");
                        break;
                    case "TEXT":
                        expect(msg.date instanceof Date).toBe(true);
                        expect(typeof msg.text).toBe("string");
                        break;
                    case "URL":
                        expect(msg.date instanceof Date).toBe(true);
                        expect(typeof msg.url).toBe("string");
                        break;
                }
            },
            onResponse({ response }) {
                wasConnected = response.status === 200;
            },
        },
    );
    await wait(500);
    controller.abort();
    expect(receivedMessageCount > 0).toBe(true);
    expect(wasConnected).toBe(true);
}, 2000);

test("[SSE] parses both 'message' and 'error' events", async () => {
    let timesConnected = 0;
    let messageCount = 0;
    let errorReceived: ArriErrorInstance | undefined;
    let otherErrorCount = 0;
    const controller = client.tests.streamTenEventsThenError({
        onMessage(_) {
            messageCount++;
        },
        onErrorMessage(error) {
            errorReceived = error;
            controller.abort();
        },
        onRequestError() {
            otherErrorCount++;
        },
        onResponseError() {
            otherErrorCount++;
        },
        onRequest() {
            timesConnected++;
        },
    });
    await wait(500);
    expect(errorReceived?.code).toBe(400);
    expect(otherErrorCount).toBe(0);
    expect(controller.signal.aborted).toBe(true);
    expect(timesConnected).toBe(1);
    expect(messageCount).toBe(10);
}, 2000);

test("[SSE] closes connection when receiving 'done' event", async () => {
    let timesConnected = 0;
    let messageCount = 0;
    let errorReceived: ArriErrorInstance | undefined;
    const controller = client.tests.streamTenEventsThenEnd({
        onMessage(_) {
            messageCount++;
        },
        onRequestError({ error }) {
            errorReceived = error;
        },
        onResponseError({ error }) {
            errorReceived = error;
        },
        onRequest() {
            timesConnected++;
        },
    });
    await wait(500);
    expect(errorReceived).toBe(undefined);
    expect(controller.signal.aborted).toBe(true);
    expect(timesConnected).toBe(1);
    expect(messageCount).toBe(10);
});

test("[SSE] auto-reconnects when connection is closed by server", async () => {
    let connectionCount = 0;
    let errorCount = 0;
    let messageCount = 0;
    const controller = client.tests.streamAutoReconnect(
        {
            messageCount: 10,
        },
        {
            onRequest() {
                connectionCount++;
            },
            onMessage(data) {
                messageCount++;
                expect(data.count > 0).toBe(true);
            },
            onResponseError(_) {
                errorCount++;
            },
        },
    );
    await wait(2000);
    expect(messageCount > 10).toBe(true);
    expect(connectionCount > 0).toBe(true);
    expect(errorCount).toBe(0);
    controller.abort();
});

test("[SSE] reconnect with new credentials", async () => {
    const dynamicClient = new TestClient({
        baseUrl,
        headers() {
            return {
                "x-test-header": randomUUID(),
            };
        },
    });
    let msgCount = 0;
    let openCount = 0;
    let errorCount = 0;
    const controller = dynamicClient.tests.streamRetryWithNewCredentials({
        onMessage(_) {
            msgCount++;
        },
        onRequestError(context) {
            errorCount++;
        },
        onResponse(context) {
            openCount++;
        },
        onResponseError(context) {
            errorCount++;
        },
    });
    await wait(2000);
    controller.abort();
    expect(msgCount > 1).toBe(true);
    expect(openCount > 1).toBe(true);
    expect(errorCount).toBe(0);
});

test("[ws] support websockets", async () => {
    let connectionCount = 0;
    let messageCount = 0;
    const errorCount = 0;
    const msgMap: Record<string, WsMessageResponse> = {};
    const controller = client.tests.websocketRpc({
        onMessage(msg) {
            messageCount++;
            msgMap[msg.entityId] = msg;
        },
        onConnectionError(err) {
            throw new ArriErrorInstance({
                code: err.code,
                message: err.message,
                data: err.data,
                stack: err.stack,
            });
        },
    });
    controller.onOpen = () => {
        connectionCount++;
        controller.send({
            type: "CREATE_ENTITY",
            entityId: "1",
            x: 100,
            y: 200,
        });
        controller.send({
            type: "UPDATE_ENTITY",
            entityId: "2",
            x: 1,
            y: 2,
        });
        controller.send({
            type: "UPDATE_ENTITY",
            entityId: "3",
            x: 5,
            y: -5,
        });
    };
    controller.connect();
    await wait(500);
    controller.close();
    expect(connectionCount).toBe(1);
    expect(messageCount).toBe(3);
    expect(errorCount).toBe(0);
    expect(msgMap["1"]!.x).toBe(100);
    expect(msgMap["1"]!.y).toBe(200);
    expect(msgMap["2"]!.x).toBe(1);
    expect(msgMap["2"]!.y).toBe(2);
    expect(msgMap["3"]!.x).toBe(5);
    expect(msgMap["3"]!.y).toBe(-5);
});

test("[ws] connection errors", async () => {
    let connectionCount = 0;
    let messageCount = 0;
    let errorCount = 0;
    const controller = new TestClient({
        baseUrl: "http://127.0.0.1:2021",
    }).tests.websocketRpc({
        onOpen() {
            connectionCount++;
        },
        onMessage() {
            messageCount++;
        },
        onConnectionError() {
            errorCount++;
        },
        onClose() {},
    });
    controller.connect();
    await wait(500);
    expect(connectionCount).toBe(0);
    expect(errorCount).toBe(1);
    expect(messageCount).toBe(0);
});

describe("arri adapters", () => {
    test("typebox adapter", async () => {
        const input: TypeBoxObject = {
            string: "hello world",
            boolean: false,
            integer: 100,
            number: 10.5,
            enumField: "B",
            object: {
                string: "hello world",
            },
            array: [true, false],
        };
        const result = await client.adapters.typebox(input);
        expect(result).toStrictEqual(input);
    });
});
