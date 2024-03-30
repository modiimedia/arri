import { type ArriError, ArriErrorInstance } from "arri-client";
import { ofetch } from "ofetch";
import { test, expect, describe } from "vitest";
import {
    TestClient,
    type ObjectWithEveryType,
    type ObjectWithEveryOptionalType,
    type ObjectWithEveryNullableType,
    type RecursiveObject,
    type RecursiveUnion,
    type TypeBoxObject,
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

test("[SSE] parses both 'message' and 'error' events", async () => {
    let timesConnected = 0;
    let messageCount = 0;
    let errorReceived: ArriError | undefined;
    const controller = client.tests.streamTenEventsThenError({
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
    expect(errorReceived?.code).toBe(400);
    expect(controller.signal.aborted).toBe(true);
    expect(timesConnected).toBe(1);
    expect(messageCount).toBe(10);
}, 2000);

test("[SSE] closes connection when receiving 'done' event", async () => {
    let timesConnected = 0;
    let messageCount = 0;
    let errorReceived: ArriError | undefined;
    const controller = client.tests.streamTenEventsThenEnd({
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

test("[SSE] auto-reconnects when connection is closed by server", async () => {
    let connectionCount = 0;
    let errorCount = 0;
    let messageCount = 0;
    const controller = client.tests.streamAutoReconnect(
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
