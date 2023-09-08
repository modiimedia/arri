import { array } from "./array";
import { nullable } from "./modifiers";
import { int16 } from "./numbers";
import { object } from "./object";
import { string } from "./string";
import { timestamp } from "./timestamp";
import { type InferType } from "./typedefs";
import { safeParse } from "./validation";

const IntArraySchema = array(int16());
type IntArraySchema = InferType<typeof IntArraySchema>;
const ObjectArraySchema = array(
    object({
        id: string(),
        name: nullable(string()),
        metadata: object({
            createdAt: timestamp(),
            updatedAt: timestamp(),
        }),
    }),
);
type ObjectArraySchema = InferType<typeof ObjectArraySchema>;
test("Type Inference", () => {
    assertType<IntArraySchema>([1, 2, 3]);
    assertType<ObjectArraySchema>([
        {
            id: "12345",
            name: "John Doe",
            metadata: { createdAt: new Date(), updatedAt: new Date() },
        },
    ]);
});

test("Validation Tests", () => {
    expect(safeParse(IntArraySchema, [1, 2, 3, 4, 5]).success).toBe(true);
    expect(safeParse(IntArraySchema, [1.1, 2, 5, 0.1325]).success).toBe(false);
    expect(safeParse(IntArraySchema, "[1, 2, 3, 4, 5]").success).toBe(true);
    const objInput: ObjectArraySchema = [
        {
            id: "12345",
            name: "John Doe",
            metadata: {
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        },
    ];
    expect(safeParse(ObjectArraySchema, objInput).success).toBe(true);
    expect(safeParse(ObjectArraySchema, JSON.stringify(objInput)).success).toBe(
        true,
    );
    (objInput as any[]).push({ id: "12345", name: "John Doe 2" });
    expect(safeParse(ObjectArraySchema, objInput).success).toBe(false);
    expect(safeParse(ObjectArraySchema, JSON.stringify(objInput)).success).toBe(
        false,
    );
});
