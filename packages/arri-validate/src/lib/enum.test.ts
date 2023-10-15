import * as a from "./_index";

const UserRolesSchema = a.stringEnum(["admin", "standard"]);
type UserRolesSchema = a.infer<typeof UserRolesSchema>;
test("type inference", () => {
    assertType<UserRolesSchema>("admin");
    assertType<UserRolesSchema>("standard");
});
describe("parsing", () => {
    const parse = (input: unknown) => a.safeParse(UserRolesSchema, input);
    it("accepts good inputs", () => {
        expect(parse("admin"));
        expect(parse("standard"));
    });

    it("rejects bad inputs", () => {
        const badInput1 = parse("ADMIN");
        expect(!badInput1.success && badInput1.error.errors.length > 0);
        expect(!parse("STANDARD").success);
        expect(!parse(0).success);
        expect(!parse("aldskjfa").success);
    });
});

describe("validation", () => {
    const validate = (input: unknown) => a.validate(UserRolesSchema, input);
    it("accepts good input", () => {
        expect(validate("admin"));
        expect(validate("standard"));
    });
    it("rejects bad input", () => {
        expect(!validate("ADMIN"));
        expect(!validate("STANDARD"));
        expect(!validate(0));
        expect(!validate({ j: 0 }));
    });
});
