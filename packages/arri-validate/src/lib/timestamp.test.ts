import * as a from "./_namespace";

it("infers types", () => {
    const Timestamp = a.timestamp();
    type Timestamp = a.infer<typeof Timestamp>;
    assertType<Timestamp>(new Date());
});

describe("validation", () => {
    const validate = (input: unknown) => a.validate(a.timestamp(), input);
    it("accepts valid dates", () => {
        expect(validate(new Date()));
        expect(validate(new Date("01/01/2001")));
    });
    it("rejects invalid dates", () => {
        expect(!validate(45151));
        expect(!validate({ aldkjf: "asasldkfj" }));
        expect(!validate(true));
    });
});

describe("parsing", () => {
    const parse = (input: unknown) => a.safeParse(a.timestamp(), input).success;
    it("accepts valid input", () => {
        expect(parse(new Date()));
        expect(parse("2001-01-01T06:00:00.000Z"));
    });
    it("rejects valid input", () => {
        expect(!parse("hello world"));
        expect(!parse(13431531));
        expect(!parse({ hello: "hello" }));
    });
});
