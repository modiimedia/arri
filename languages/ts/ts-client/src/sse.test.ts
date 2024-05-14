import { parseSseEvent, parseSseEvents } from "./sse";

it("parses an event string", () => {
    const input = `id: 1\nevent: message\ndata: hello world`;
    const result = parseSseEvent(input, (str) => str);
    expect(result).toStrictEqual({
        id: "1",
        event: "message",
        data: "hello world",
    });
    const input2 = `data: {"hello": "world"}`;
    const result2 = parseSseEvent<{ hello: "world" }>(input2, (str) =>
        JSON.parse(str),
    );
    expect(result2).toStrictEqual({
        id: undefined,
        event: undefined,
        data: { hello: "world" },
    });
});

it("parses an event list string", () => {
    const input = `
id: 1
event: message
data: {"name": "john doe"}

id: 2
event: message
data: {"name": "suzy q", "date": "2001-01-01"}

`;
    const result = parseSseEvents<{ name: string; date?: string }>(
        input,
        (str) => JSON.parse(str),
    );
    expect(result).toStrictEqual([
        {
            id: "1",
            event: "message",
            data: { name: "john doe" },
        },
        {
            id: "2",
            event: "message",
            data: {
                name: "suzy q",
                date: "2001-01-01",
            },
        },
    ]);
});
