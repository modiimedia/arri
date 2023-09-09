import { stringEnum } from "./enum";
import { type InferType } from "./typedefs";
import { safeParse } from "./validation";

const UserRolesSchema = stringEnum(["admin", "standard"]);
type UserRolesSchema = InferType<typeof UserRolesSchema>;
test("Type Inference", () => {
    assertType<UserRolesSchema>("admin");
});
describe("Parsing", () => {
    it("accepts good inputs", () => {
        expect(safeParse(UserRolesSchema, "admin").success).toBe(true);
        expect(safeParse(UserRolesSchema, "standard").success).toBe(true);
    });

    it("rejects bad inputs", () => {
        expect(safeParse(UserRolesSchema, "ADMIN").success).toBe(false);
        expect(safeParse(UserRolesSchema, "STANDARD").success).toBe(false);
        expect(safeParse(UserRolesSchema, 0).success).toBe(false);
        expect(safeParse(UserRolesSchema, "laksjdf").success).toBe(false);
    });
});
