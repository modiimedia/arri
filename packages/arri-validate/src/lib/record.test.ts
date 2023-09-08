import { stringEnum } from "./enum";
import { int32 } from "./numbers";
import { object } from "./object";
import { record } from "./record";
import { string } from "./string";
import { type InferType } from "./typedefs";

const NumberRecordSchema = record(int32());
type NumberRecordSchema = InferType<typeof NumberRecordSchema>;
const StringRecordSchema = record(string());
type StringRecordSchema = InferType<typeof StringRecordSchema>;
const ObjectRecordSchema = record(
    object({
        id: string(),
        type: stringEnum(["notification", "alert"]),
    }),
);
type ObjectRecordSchema = InferType<typeof ObjectRecordSchema>;
test("Type Inference", () => {
    assertType<NumberRecordSchema>({ "1": 1, "2": 2 });
    assertType<StringRecordSchema>({ a: "a", b: "b" });
    assertType<ObjectRecordSchema>({
        a: {
            id: "12345",
            type: "notification",
        },
        b: {
            id: "123456",
            type: "alert",
        },
    });
});
