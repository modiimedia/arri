import { ArriErrorInstance } from "./errors";

test("Error Initialization", () => {
    const input = JSON.stringify({
        code: 404,
        message: "Not found",
        stack: ["./src/index.ts", "./src/modules/index.ts"],
    });
    const error = ArriErrorInstance.fromJson(input);
    expect(error.code).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.serverStack).toBe(`./src/index.ts\n./src/modules/index.ts`);
});
