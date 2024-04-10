import { parsedWsResponse } from "./ws";

test("Parse WS Response", () => {
    const result = parsedWsResponse(
        `type: message\ndata: {"message":"hello world"}`,
    );
    expect(result).toStrictEqual({
        type: "message",
        data: `{"message":"hello world"}`,
    });

    const result2 = parsedWsResponse(
        `type: error\ndata: {"code": 1, "message": "there was an error"}`,
    );
    expect(result2).toStrictEqual({
        type: "error",
        data: `{"code": 1, "message": "there was an error"}`,
    });
});
