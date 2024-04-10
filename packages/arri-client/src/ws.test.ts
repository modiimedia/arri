import { parsedWsResponse } from "./ws";

test("Parse WS Response", () => {
    const result = parsedWsResponse(
        `event: message\ndata: {"message":"hello world"}`,
    );
    expect(result).toStrictEqual({
        event: "message",
        data: `{"message":"hello world"}`,
    });

    const result2 = parsedWsResponse(
        `event: error\ndata: {"code": 1, "message": "there was an error"}`,
    );
    expect(result2).toStrictEqual({
        event: "error",
        data: `{"code": 1, "message": "there was an error"}`,
    });
});
