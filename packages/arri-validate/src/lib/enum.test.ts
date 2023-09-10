import * as a from "./_index";

const UserRolesSchema = a.stringEnum(["admin", "standard"]);
type UserRolesSchema = a.infer<typeof UserRolesSchema>;
test("Type Inference", () => {
    assertType<UserRolesSchema>("admin");
});
describe("Parsing", () => {
    it("accepts good inputs", () => {
        expect(a.safeParse(UserRolesSchema, "admin").success).toBe(true);
        expect(a.safeParse(UserRolesSchema, "standard").success).toBe(true);
    });

    it("rejects bad inputs", () => {
        expect(a.safeParse(UserRolesSchema, "ADMIN").success).toBe(false);
        expect(a.safeParse(UserRolesSchema, "STANDARD").success).toBe(false);
        expect(a.safeParse(UserRolesSchema, 0).success).toBe(false);
        expect(a.safeParse(UserRolesSchema, "laksjdf").success).toBe(false);
    });
});
