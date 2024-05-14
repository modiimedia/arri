import * as a from "./_namespace";

const DiscriminatorSchema = a.discriminator(
    "DiscriminatorSchema",
    "eventType",
    {
        USER_CREATED: a.object({
            id: a.string(),
        }),
        USER_PAYMENT_PLAN_CHANGED: a.object({
            id: a.string(),
            plan: a.stringEnum(["FREE", "PAID"]),
        }),
        USER_DELETED: a.object({
            id: a.string(),
            softDelete: a.boolean(),
        }),
    },
);
type DiscriminatorSchema = a.infer<typeof DiscriminatorSchema>;

describe("Type Inference", () => {
    it("infers discriminator schema type", () => {
        assertType<DiscriminatorSchema>({
            id: "12345",
            eventType: "USER_CREATED",
        });
        assertType<DiscriminatorSchema>({
            eventType: "USER_DELETED",
            id: "12345",
            softDelete: false,
        });
        assertType<DiscriminatorSchema>({
            eventType: "USER_PAYMENT_PLAN_CHANGED",
            id: "123455",
            plan: "FREE",
        });
    });
});

describe("Parsing", () => {
    const parse = (input: unknown) =>
        a.safeParse(DiscriminatorSchema, input).success;
    it("parses compliant objects", () => {
        const createdInput: DiscriminatorSchema = {
            eventType: "USER_CREATED",
            id: "123451",
        };
        const deletedInput: DiscriminatorSchema = {
            eventType: "USER_DELETED",
            id: "123455",
            softDelete: true,
        };
        const planChangedInput: DiscriminatorSchema = {
            eventType: "USER_PAYMENT_PLAN_CHANGED",
            id: "131241513",
            plan: "PAID",
        };
        expect(parse(createdInput));
        expect(parse(deletedInput));
        expect(parse(planChangedInput));
    });
    it("Rejects uncompliant objects", () => {
        const additionalFieldInput = {
            eventType: "USER_CREATED",
            id: "123456",
            softDelete: false,
        };
        const missingFieldsInput = {
            id: "1234531",
        };
        expect(!parse(additionalFieldInput));
        expect(!parse(missingFieldsInput));
    });
});

test("overloaded functions produce the same result", () => {
    const SchemaA = a.discriminator(
        "msgType",
        {
            TEXT: a.object({
                userId: a.string(),
                content: a.string(),
            }),
            IMAGE: a.object({
                userId: a.string(),
                imageUrl: a.string(),
            }),
        },
        {
            id: "Message",
        },
    );
    type SchemaA = a.infer<typeof SchemaA>;
    const SchemaB = a.discriminator("Message", "msgType", {
        TEXT: a.object({
            userId: a.string(),
            content: a.string(),
        }),
        IMAGE: a.object({
            userId: a.string(),
            imageUrl: a.string(),
        }),
    });
    type SchemaB = a.infer<typeof SchemaB>;
    const input: SchemaA = {
        msgType: "TEXT",
        userId: "1",
        content: "",
    };
    assertType<SchemaA>(input);
    assertType<SchemaB>(input);
    expect(JSON.stringify(SchemaA)).toBe(JSON.stringify(SchemaB));
    expect(a.validate(SchemaA, input)).toBe(a.validate(SchemaB, input));
    expect(a.serialize(SchemaA, input)).toBe(a.serialize(SchemaB, input));
});
