import * as a from "./_index";

describe("parsing", () => {
    const parse = (input: unknown) => a.safeParse(a.string(), input).success;
    it("accepts valid input", () => {
        expect(parse("123453"));
        expect(parse("hello world"));
        expect(parse('{"message": "hello world"}'));
    });
    it("rejects bad input", () => {
        expect(!parse(1));
        expect(!parse(undefined));
        expect(!parse({ message: "hello world" }));
        expect(!parse(true));
    });
});
