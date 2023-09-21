import * as a from "./_index";

test("type inference", () => {
    const Num = a.number();
    type Num = a.infer<typeof Num>;
    const Int = a.int16();
    type Int = a.infer<typeof Int>;
    assertType<Num>(1);
    assertType<Int>(1);
});

describe("parsing", () => {
    it("parses floats", () => {
        const goodInputs = [
            -1341451,
            0.50051,
            -1,
            15415151,
            1241.5555,
            "13560",
            "-1351351.53135",
        ];
        for (const input of goodInputs) {
            expect(a.safeParse(a.number(), input).success).toBe(true);
            expect(a.safeParse(a.float32(), input).success).toBe(true);
            expect(a.safeParse(a.float64(), input).success).toBe(true);
        }
        const badInputs = [
            "hello world",
            "-1.0h",
            { helloWorld: "helloWorld" },
        ];
        for (const input of badInputs) {
            expect(a.safeParse(a.number(), input).success).toBe(false);
            expect(a.safeParse(a.float32(), input).success).toBe(false);
            expect(a.safeParse(a.float64(), input).success).toBe(false);
        }
    });
    it("parses int8", () => {
        const goodInputs = [0, -128, 127, 50, 10, "-128", "127", "0"];
        for (const input of goodInputs) {
            const result = a.safeParse(a.int8(), input);
            if (!result.success) {
                console.error("This should pass int8", input);
            }
            expect(result.success).toBe(true);
        }
        const badInputs = [-1000, 200000, 0.5, "hello world"];
        for (const input of badInputs) {
            const result = a.safeParse(a.int8(), input);
            if (result.success) {
                console.error("This should fail int8", input);
            }
            expect(result.success).toBe(false);
        }
    });
    it("parses int16", () => {
        const goodInputs = [0, 32767, -32768, "32767", 500];
        for (const input of goodInputs) {
            const result = a.safeParse(a.int16(), input);
            if (!result.success) {
                console.error("This should pass int16", input);
            }
            expect(result.success).toBe(true);
        }
        const badInputs = [0.5, -32769, 32768, "32767h", "hello world"];
        for (const input of badInputs) {
            const result = a.safeParse(a.int16(), input);
            if (result.success) {
                console.error("This should fail int16", input);
            }
            expect(result.success).toBe(false);
        }
    });
    it("parses int32", () => {
        const goodInputs = [0, -2147483648, 2147483647, "2147483647", "500"];
        for (const input of goodInputs) {
            const result = a.safeParse(a.int32(), input);
            if (!result.success) {
                console.error("This should pass int32", input);
            }
            expect(result.success).toBe(true);
        }
        const badInputs = [
            2147483648,
            -2147483649,
            [],
            {},
            null,
            undefined,
            "hello world",
        ];
        for (const input of badInputs) {
            const result = a.safeParse(a.int32(), input);
            if (result.success) {
                console.error("This should fail int32", input);
            }
            expect(result.success).toBe(false);
        }
    });
});