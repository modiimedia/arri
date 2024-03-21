import { type ArriRequestError, ArriRequestErrorInstance } from "arri-client";
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
    type UpdateAuthorData,
} from "./testClient.rpc";

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
    const result = await ofetch("/routes/authors/12345", {
        method: "post",
        baseURL: baseUrl,
        headers,
        body: {
            name: "John Doe",
        },
    });
    expect(result.id).toBe("12345");
    expect(result.name).toBe("John Doe");
});

describe("miscTests", () => {
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
    test("sendObject()", async () => {
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
        const result = await client.miscTests.sendObject(input);
        expect(result).toStrictEqual(input);
    });
    test("sendObject() unauthenticated", async () => {
        try {
            await unauthenticatedClient.miscTests.sendObject(input);
            expect(true).toBe(false);
        } catch (err) {
            expect(err instanceof ArriRequestErrorInstance);
            if (err instanceof ArriRequestErrorInstance) {
                expect(err.statusCode).toBe(401);
            }
        }
    });
    test("sendPartialObject()", async () => {
        const fullObjectResult =
            await client.miscTests.sendPartialObject(input);
        expect(fullObjectResult).toStrictEqual(input);
        const partialInput: ObjectWithEveryOptionalType = {
            string: "",
            int16: 0,
            int64: 0n,
        };
        const partialObjectResult =
            await client.miscTests.sendPartialObject(partialInput);
        expect(partialObjectResult).toStrictEqual(partialInput);
    });
    test("sendObjectWithNullableFields", async () => {
        const fullObjectResult =
            await client.miscTests.sendObjectWithNullableFields(input);
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
            await client.miscTests.sendObjectWithNullableFields(nullableInput);
        expect(nullableResult).toStrictEqual(nullableInput);
    });

    test("recursive object", async () => {
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
        const result = await client.miscTests.sendRecursiveObject(payload);
        expect(result).toStrictEqual(payload);
    });

    test("recursive union", async () => {
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
        const result = await client.miscTests.sendRecursiveUnion(payload);
        expect(result).toStrictEqual(payload);
    });
});

test("unauthorized route request", async () => {
    try {
        await ofetch("/routes/authors/12345", {
            method: "post",
            baseURL: baseUrl,
            body: {
                name: "John Doe",
            },
        });
    } catch (err) {
        expect(err instanceof ArriRequestErrorInstance);
        if (err instanceof ArriRequestErrorInstance) {
            expect(err.statusCode).toBe(401);
        }
    }
});

test("SSE request", async () => {
    let wasConnected = false;
    let receivedMessageCount = 0;
    const controller = client.miscTests.streamMessages(
        { channelId: "1" },
        {
            onData(data) {
                receivedMessageCount++;
                expect(data.channelId).toBe("1");
                switch (data.messageType) {
                    case "IMAGE":
                        expect(data.date instanceof Date).toBe(true);
                        expect(typeof data.image).toBe("string");
                        break;
                    case "TEXT":
                        expect(data.date instanceof Date).toBe(true);
                        expect(typeof data.text).toBe("string");
                        break;
                    case "URL":
                        expect(data.date instanceof Date).toBe(true);
                        expect(typeof data.url).toBe("string");
                        break;
                }
            },
            onOpen(response) {
                wasConnected = response.status === 200;
            },
        },
    );
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            controller.abort();
            resolve(true);
        }, 500);
    });
    expect(receivedMessageCount > 0).toBe(true);
    expect(wasConnected).toBe(true);
}, 2000);

test("SSE Request with errors", async () => {
    let timesConnected = 0;
    let messageCount = 0;
    let errorReceived: ArriRequestError | undefined;
    const controller = client.miscTests.streamTenEventsThenError({
        onData(_) {
            messageCount++;
        },
        onError(error) {
            errorReceived = error;
            controller.abort();
        },
        onOpen() {
            timesConnected++;
        },
    });
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 500);
    });
    expect(errorReceived?.statusCode).toBe(400);
    expect(controller.signal.aborted).toBe(true);
    expect(timesConnected).toBe(1);
    expect(messageCount).toBe(10);
}, 2000);

test("SSE Request with done event", async () => {
    let timesConnected = 0;
    let messageCount = 0;
    let errorReceived: ArriRequestError | undefined;
    const controller = client.miscTests.streamTenEventsThenEnd({
        onData(_) {
            messageCount++;
        },
        onError(error) {
            errorReceived = error;
        },
        onOpen() {
            timesConnected++;
        },
    });
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 500);
    });
    expect(errorReceived).toBe(undefined);
    expect(controller.signal.aborted).toBe(true);
    expect(timesConnected).toBe(1);
    expect(messageCount).toBe(10);
});

test("SSE Requests Auto-Reconnect", async () => {
    let connectionCount = 0;
    let errorCount = 0;
    let messageCount = 0;
    const controller = client.miscTests.streamAutoReconnect(
        {
            messageCount: 10,
        },
        {
            onOpen() {
                connectionCount++;
            },
            onData(data) {
                messageCount++;
                expect(data.count > 0).toBe(true);
            },
            onError(_) {
                errorCount++;
            },
        },
    );
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });
    expect(messageCount > 10).toBe(true);
    expect(connectionCount > 0).toBe(true);
    expect(errorCount).toBe(0);
    controller.abort();
});

test("Websocket Requests", async () => {
    let connectionCount = 0;
    let messageCount = 0;
    const errorCount = 0;
    const msgMap: Record<string, WsMessageResponse> = {};
    const controller = client.miscTests.websocketRpc({
        onMessage(msg) {
            messageCount++;
            msgMap[msg.entityId] = msg;
        },
        onConnectionError(err) {
            console.error(err);
            throw new ArriRequestErrorInstance({
                statusCode: err.statusCode,
                statusMessage: err.statusMessage,
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
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });
    controller.close();
    expect(connectionCount).toBe(1);
    expect(messageCount).toBe(3);
    expect(errorCount).toBe(0);
    expect(msgMap["1"].x).toBe(100);
    expect(msgMap["1"].y).toBe(200);
    expect(msgMap["2"].x).toBe(1);
    expect(msgMap["2"].y).toBe(2);
    expect(msgMap["3"].x).toBe(5);
    expect(msgMap["3"].y).toBe(-5);
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

describe("manually added rpcs", () => {
    test("updateAuthor()", async () => {
        const input: UpdateAuthorData = {
            name: "John Doe",
        };
        const result = await client.authors.updateAuthor({
            authorId: "1",
            data: input,
        });
        expect(result.id).toBe("1");
        expect(result.name).toBe("John Doe");
    });
});
