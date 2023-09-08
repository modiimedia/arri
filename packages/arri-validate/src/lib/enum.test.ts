import { stringEnum } from "./enum";
import { type InferType } from "./typedefs";
import { safeParse } from "./validation";

const UserRolesSchema = stringEnum(["admin", "standard"]);
type UserRolesSchema = InferType<typeof UserRolesSchema>;
test("Type Inference", () => {
    assertType<UserRolesSchema>("admin");
});
test("Parsing Tests", () => {
    const input = "admin";
    const badInput = "admi";
    expect(safeParse(UserRolesSchema, input).success).toBe(true);
    expect(safeParse(UserRolesSchema, badInput).success).toBe(false);
});
