import { test, assertType } from "vitest";
import { float32, float64, int32 } from "./scalar";
import { type InferType } from "./typedefs";
import { safeParse } from "./validation";

describe("Type inference", () => {
    test("Float32", () => {
        const basic = float32();
        type basic = InferType<typeof basic>;
        assertType<basic>(0);
        const nullable = float32({ nullable: true });
        type nullable = InferType<typeof nullable>;
        assertType<nullable>(0);
        assertType<nullable>(null);
    });
    test("FLoat64", () => {
        const basic = float64();
        type basic = InferType<typeof basic>;
        assertType<basic>(0);
        const nullable = float64({ nullable: true });
        type nullable = InferType<typeof nullable>;
        assertType<nullable>(0);
        assertType<nullable>(null);
    });
});

describe("Parsing", () => {
    test("Numbers", () => {
        const inputStr = "12345asdfdas";
        const schema = int32();
        expect(safeParse(schema, inputStr).success).toBe(false);
        expect(safeParse(schema, 0).success).toBe(true);
    });
});
