import { StandardSchemaV1 } from '@standard-schema/spec';

import * as a from './_namespace';

const DiscriminatorSchema = a.discriminator(
    'DiscriminatorSchema',
    'eventType',
    {
        USER_CREATED: a.object({
            id: a.string(),
        }),
        USER_PAYMENT_PLAN_CHANGED: a.object({
            id: a.string(),
            plan: a.stringEnum(['FREE', 'PAID']),
        }),
        USER_DELETED: a.object({
            id: a.string(),
            softDelete: a.boolean(),
        }),
    },
);
type DiscriminatorSchema = a.infer<typeof DiscriminatorSchema>;

describe('Type Inference', () => {
    it('infers discriminator schema type', () => {
        assertType<DiscriminatorSchema>({
            id: '12345',
            eventType: 'USER_CREATED',
        });
        assertType<DiscriminatorSchema>({
            eventType: 'USER_DELETED',
            id: '12345',
            softDelete: false,
        });
        assertType<DiscriminatorSchema>({
            eventType: 'USER_PAYMENT_PLAN_CHANGED',
            id: '123455',
            plan: 'FREE',
        });
    });
});

describe('Parsing', () => {
    const parse = (input: unknown) =>
        a.decode(DiscriminatorSchema, input).success;
    it('parses compliant objects', () => {
        const createdInput: DiscriminatorSchema = {
            eventType: 'USER_CREATED',
            id: '123451',
        };
        const deletedInput: DiscriminatorSchema = {
            eventType: 'USER_DELETED',
            id: '123455',
            softDelete: true,
        };
        const planChangedInput: DiscriminatorSchema = {
            eventType: 'USER_PAYMENT_PLAN_CHANGED',
            id: '131241513',
            plan: 'PAID',
        };
        expect(parse(createdInput));
        expect(parse(deletedInput));
        expect(parse(planChangedInput));
    });
    it('Rejects uncompliant objects', () => {
        const additionalFieldInput = {
            eventType: 'USER_CREATED',
            id: '123456',
            softDelete: false,
        };
        const missingFieldsInput = {
            id: '1234531',
        };
        expect(!parse(additionalFieldInput));
        expect(!parse(missingFieldsInput));
    });
});

test('overloaded functions produce the same result', () => {
    const SchemaA = a.discriminator(
        'msgType',
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
            id: 'Message',
        },
    );
    type SchemaA = a.infer<typeof SchemaA>;
    const SchemaB = a.discriminator('Message', 'msgType', {
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
        msgType: 'TEXT',
        userId: '1',
        content: '',
    };
    assertType<SchemaA>(input);
    assertType<SchemaB>(input);
    expect(JSON.stringify(SchemaA)).toBe(JSON.stringify(SchemaB));
    expect(a.validate(SchemaA, input)).toBe(a.validate(SchemaB, input));
    expect(a.encodeUnsafe(SchemaA, input)).toBe(a.encodeUnsafe(SchemaB, input));
});

it('produces valid ATD', () => {
    const result = JSON.parse(
        JSON.stringify(
            a.discriminator('Message', 'type', {
                TEXT: a.object({
                    content: a.string(),
                }),
                IMAGE: a.object({
                    url: a.string(),
                }),
                VIDEO: a.object({
                    url: a.string(),
                    length: a.uint64(),
                }),
            }),
        ),
    );
    expect(result).toStrictEqual({
        discriminator: 'type',
        mapping: {
            TEXT: {
                properties: {
                    content: {
                        type: 'string',
                        metadata: {},
                    },
                },
                metadata: {},
            },
            IMAGE: {
                properties: {
                    url: {
                        type: 'string',
                        metadata: {},
                    },
                },
                metadata: {},
            },
            VIDEO: {
                properties: {
                    url: {
                        type: 'string',
                        metadata: {},
                    },
                    length: {
                        type: 'uint64',
                        metadata: {},
                    },
                },
                metadata: {},
            },
        },
        metadata: {
            id: 'Message',
        },
    });
});

describe('standard-schema support', () => {
    const Message = a.discriminator('Message', 'msgType', {
        TEXT: a.object({
            userId: a.string(),
            content: a.string(),
        }),
        IMAGE: a.object({
            userId: a.string(),
            imageUrl: a.string(),
        }),
    });
    type Message = a.infer<typeof Message>;
    it('properly infers types', async () => {
        assertType<StandardSchemaV1<Message>>(Message);
        const result = await Message['~standard'].validate('');
        if (!result.issues) {
            assertType<Message>(result.value);
        }
    });
    it('produces the same result via the standard-schema interface', async () => {
        const input: Message = {
            msgType: 'IMAGE',
            userId: '12345',
            imageUrl: 'foo',
        };
        expect(a.validate(Message, input)).toBe(true);
        let standardResult = await Message['~standard'].validate(input);
        expect(typeof standardResult.issues).toBe('undefined');
        if (!standardResult.issues) {
            expect(standardResult.value).toStrictEqual(input);
        }
        (input as any).msgType = 'VIDEO';
        expect(a.validate(Message, input)).toBe(false);
        standardResult = await Message['~standard'].validate(input);
        expect(standardResult.issues?.length).toBe(1);
        expect(standardResult.issues?.[0]?.path).toStrictEqual(['msgType']);
    });
});
