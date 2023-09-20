import * as a from "./_index";

const UserRolesSchema = a.stringEnum(["admin", "standard"]);
type UserRolesSchema = a.infer<typeof UserRolesSchema>;
test("type inference", () => {
    assertType<UserRolesSchema>("admin");
    assertType<UserRolesSchema>("standard");
});
describe("parsing", () => {
    const parse = (input: unknown) =>
        a.safeParse(UserRolesSchema, input).success;
    it("accepts good inputs", () => {
        expect(parse("admin"));
        expect(parse("standard"));
    });

    it("rejects bad inputs", () => {
        expect(!parse("ADMIN"));
        expect(!parse("STANDARD"));
        expect(!parse(0));
        expect(!parse("aldskjfa"));
    });
});
