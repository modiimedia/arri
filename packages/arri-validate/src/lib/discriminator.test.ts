import * as a from "./_index";

const DiscriminatorSchema = a.discriminator("eventType", {
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
});
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
        const inputs = [createdInput, deletedInput, planChangedInput] as const;
        for (const input of inputs) {
            expect(a.safeParse(DiscriminatorSchema, input).success).toBe(true);
            expect(
                a.safeParse(DiscriminatorSchema, JSON.stringify(input)).success,
            ).toBe(true);
        }
    });
    it("Rejects uncompliant objects", () => {
        const inputs = [
            {
                eventType: "USER_CREATED",
                id: "123456",
                softDelete: false,
            },
            {
                id: "134561",
            },
        ];
        for (const input of inputs) {
            expect(a.safeParse(DiscriminatorSchema, input).success).toBe(false);
            expect(a.safeParse(DiscriminatorSchema, input).success).toBe(false);
        }
    });
});
