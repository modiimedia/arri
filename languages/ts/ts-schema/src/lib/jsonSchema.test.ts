import * as a from './_namespace';
import { type JsonSchema, toJsonSchema } from './jsonSchema';
import {
    int8Max,
    int8Min,
    int16Max,
    int16Min,
    int32Max,
    int32Min,
    uint8Max,
    uint8Min,
    uint16Max,
    uint16Min,
    uint32Max,
    uint32Min,
} from './numberConstants';

describe('toJsonSchema()', () => {
    describe('scalar types', () => {
        it('converts string type', () => {
            const schema = a.string();
            const result = toJsonSchema(schema);

            expect(result.type).toBe('string');
            expect(result.$schema).toBe(
                'https://json-schema.org/draft/2020-12/schema',
            );
        });

        it('converts boolean type', () => {
            const schema = a.boolean();
            const result = toJsonSchema(schema);

            expect(result.type).toBe('boolean');
        });

        it('converts timestamp type', () => {
            const schema = a.timestamp();
            const result = toJsonSchema(schema);

            expect(result.type).toBe('string');
            expect(result.format).toBe('date-time');
        });

        it('converts float32 type', () => {
            const schema = a.float32();
            const result = toJsonSchema(schema);

            expect(result.type).toBe('number');
        });

        it('converts float64 type', () => {
            const schema = a.float64();
            const result = toJsonSchema(schema);

            expect(result.type).toBe('number');
        });

        it('converts int8 type with bounds', () => {
            const schema = a.int8();
            const result = toJsonSchema(schema);

            expect(result.type).toBe('integer');
            expect(result.minimum).toBe(int8Min);
            expect(result.maximum).toBe(int8Max);
        });

        it('converts uint8 type with bounds', () => {
            const schema = a.uint8();
            const result = toJsonSchema(schema);

            expect(result.type).toBe('integer');
            expect(result.minimum).toBe(uint8Min);
            expect(result.maximum).toBe(uint8Max);
        });

        it('converts int16 type with bounds', () => {
            const schema = a.int16();
            const result = toJsonSchema(schema);

            expect(result.type).toBe('integer');
            expect(result.minimum).toBe(int16Min);
            expect(result.maximum).toBe(int16Max);
        });

        it('converts uint16 type with bounds', () => {
            const schema = a.uint16();
            const result = toJsonSchema(schema);

            expect(result.type).toBe('integer');
            expect(result.minimum).toBe(uint16Min);
            expect(result.maximum).toBe(uint16Max);
        });

        it('converts int32 type with bounds', () => {
            const schema = a.int32();
            const result = toJsonSchema(schema);

            expect(result.type).toBe('integer');
            expect(result.minimum).toBe(int32Min);
            expect(result.maximum).toBe(int32Max);
        });

        it('converts uint32 type with bounds', () => {
            const schema = a.uint32();
            const result = toJsonSchema(schema);

            expect(result.type).toBe('integer');
            expect(result.minimum).toBe(uint32Min);
            expect(result.maximum).toBe(uint32Max);
        });

        it('converts int64 type as string with pattern', () => {
            const schema = a.int64();
            const result = toJsonSchema(schema);

            expect(result.type).toBe('string');
            expect(result.pattern).toBe('^-?[0-9]+$');
        });

        it('converts uint64 type as string with pattern', () => {
            const schema = a.uint64();
            const result = toJsonSchema(schema);

            expect(result.type).toBe('string');
            expect(result.pattern).toBe('^[0-9]+$');
        });
    });

    describe('enum type', () => {
        it('converts string enum', () => {
            const schema = a.stringEnum(['FOO', 'BAR', 'BAZ']);
            const result = toJsonSchema(schema);

            expect(result.type).toBe('string');
            expect(result.enum).toStrictEqual(['FOO', 'BAR', 'BAZ']);
        });

        it('converts enumerator', () => {
            const schema = a.enumerator(['A', 'B', 'C']);
            const result = toJsonSchema(schema);

            expect(result.type).toBe('string');
            expect(result.enum).toStrictEqual(['A', 'B', 'C']);
        });
    });

    describe('array type', () => {
        it('converts array of strings', () => {
            const schema = a.array(a.string());
            const result = toJsonSchema(schema);

            expect(result.type).toBe('array');
            expect(result.items).toStrictEqual({ type: 'string' });
        });

        it('converts array of integers', () => {
            const schema = a.array(a.int32());
            const result = toJsonSchema(schema);

            expect(result.type).toBe('array');
            expect(result.items).toStrictEqual({
                type: 'integer',
                minimum: int32Min,
                maximum: int32Max,
            });
        });

        it('converts nested arrays', () => {
            const schema = a.array(a.array(a.boolean()));
            const result = toJsonSchema(schema);

            expect(result.type).toBe('array');
            expect(result.items).toStrictEqual({
                type: 'array',
                items: { type: 'boolean' },
            });
        });
    });

    describe('object type', () => {
        it('converts simple object', () => {
            const schema = a.object({
                id: a.string(),
                name: a.string(),
                count: a.int32(),
            });
            const result = toJsonSchema(schema);

            expect(result.type).toBe('object');
            expect(result.properties).toStrictEqual({
                id: { type: 'string' },
                name: { type: 'string' },
                count: {
                    type: 'integer',
                    minimum: int32Min,
                    maximum: int32Max,
                },
            });
            expect(result.required).toStrictEqual(['id', 'name', 'count']);
        });

        it('converts object with optional properties', () => {
            const schema = a.object({
                id: a.string(),
                name: a.optional(a.string()),
                email: a.optional(a.string()),
            });
            const result = toJsonSchema(schema);

            expect(result.type).toBe('object');
            expect(result.properties).toStrictEqual({
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
            });
            expect(result.required).toStrictEqual(['id']);
        });

        it('converts strict object with additionalProperties: false', () => {
            const schema = a.object(
                {
                    id: a.string(),
                },
                { isStrict: true },
            );
            const result = toJsonSchema(schema);

            expect(result.type).toBe('object');
            expect(result.additionalProperties).toBe(false);
        });

        it('converts nested objects', () => {
            const schema = a.object({
                user: a.object({
                    id: a.string(),
                    profile: a.object({
                        name: a.string(),
                    }),
                }),
            });
            const result = toJsonSchema(schema);

            expect(result.type).toBe('object');
            expect(result.properties?.user).toStrictEqual({
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    profile: {
                        type: 'object',
                        properties: { name: { type: 'string' } },
                        required: ['name'],
                    },
                },
                required: ['id', 'profile'],
            });
        });
    });

    describe('record type', () => {
        it('converts record of strings', () => {
            const schema = a.record(a.string());
            const result = toJsonSchema(schema);

            expect(result.type).toBe('object');
            expect(result.additionalProperties).toStrictEqual({
                type: 'string',
            });
        });

        it('converts record of booleans', () => {
            const schema = a.record(a.boolean());
            const result = toJsonSchema(schema);

            expect(result.type).toBe('object');
            expect(result.additionalProperties).toStrictEqual({
                type: 'boolean',
            });
        });

        it('converts record of objects', () => {
            const schema = a.record(a.object({ id: a.string() }));
            const result = toJsonSchema(schema);

            expect(result.type).toBe('object');
            expect(result.additionalProperties).toStrictEqual({
                type: 'object',
                properties: { id: { type: 'string' } },
                required: ['id'],
            });
        });
    });

    describe('discriminator type', () => {
        it('converts discriminated union to oneOf', () => {
            const schema = a.discriminator('type', {
                USER: a.object({ name: a.string() }),
                ADMIN: a.object({
                    name: a.string(),
                    permissions: a.array(a.string()),
                }),
            });
            const result = toJsonSchema(schema);

            expect(result.oneOf).toBeDefined();
            expect(result.oneOf?.length).toBe(2);

            const userVariant = result.oneOf?.find(
                (s) => s.properties?.type?.const === 'USER',
            );
            expect(userVariant).toBeDefined();
            expect(userVariant?.properties?.name).toStrictEqual({
                type: 'string',
            });
            expect(userVariant?.required).toContain('type');
            expect(userVariant?.required).toContain('name');

            const adminVariant = result.oneOf?.find(
                (s) => s.properties?.type?.const === 'ADMIN',
            );
            expect(adminVariant).toBeDefined();
            expect(adminVariant?.properties?.permissions).toStrictEqual({
                type: 'array',
                items: { type: 'string' },
            });
        });

        it('converts complex discriminated union', () => {
            const schema = a.discriminator('eventType', {
                USER_CREATED: a.object({ id: a.string() }),
                USER_PAYMENT_PLAN_CHANGED: a.object({
                    id: a.string(),
                    plan: a.stringEnum(['FREE', 'PAID']),
                }),
                USER_DELETED: a.object({
                    id: a.string(),
                    softDelete: a.boolean(),
                }),
            });
            const result = toJsonSchema(schema);

            expect(result.oneOf?.length).toBe(3);

            for (const variant of result.oneOf ?? []) {
                expect(variant.properties?.eventType).toBeDefined();
                expect(variant.required).toContain('eventType');
            }
        });
    });

    describe('nullable types', () => {
        it('converts nullable string', () => {
            const schema = a.nullable(a.string());
            const result = toJsonSchema(schema);

            expect(result.type).toStrictEqual(['string', 'null']);
        });

        it('converts nullable integer', () => {
            const schema = a.nullable(a.int32());
            const result = toJsonSchema(schema);

            expect(result.type).toStrictEqual(['integer', 'null']);
            expect(result.minimum).toBe(int32Min);
            expect(result.maximum).toBe(int32Max);
        });

        it('converts nullable object', () => {
            const schema = a.nullable(a.object({ id: a.string() }));
            const result = toJsonSchema(schema);

            expect(result.type).toStrictEqual(['object', 'null']);
            expect(result.properties).toStrictEqual({
                id: { type: 'string' },
            });
        });

        it('converts nullable array', () => {
            const schema = a.nullable(a.array(a.string()));
            const result = toJsonSchema(schema);

            expect(result.type).toStrictEqual(['array', 'null']);
            expect(result.items).toStrictEqual({ type: 'string' });
        });

        it('converts nullable discriminator with anyOf', () => {
            const schema = a.nullable(
                a.discriminator('type', {
                    A: a.object({ a: a.string() }),
                    B: a.object({ b: a.string() }),
                }),
            );
            const result = toJsonSchema(schema);

            expect(result.anyOf).toBeDefined();
            expect(result.anyOf?.length).toBe(2);

            const oneOfPart = result.anyOf?.find((s) => s.oneOf);
            expect(oneOfPart?.oneOf?.length).toBe(2);

            const nullPart = result.anyOf?.find((s) => s.type === 'null');
            expect(nullPart).toBeDefined();
        });
    });

    describe('metadata', () => {
        it('applies id as title', () => {
            const schema = a.object(
                { id: a.string() },
                { id: 'User', description: 'A user object' },
            );
            const result = toJsonSchema(schema);

            expect(result.title).toBe('User');
            expect(result.description).toBe('A user object');
        });

        it('applies deprecated flag', () => {
            const schema = a.object({ id: a.string() }, { isDeprecated: true });
            const result = toJsonSchema(schema);

            expect(result.deprecated).toBe(true);
        });

        it('applies property-level metadata', () => {
            const schema = a.object({
                id: a.string({ description: 'Unique identifier' }),
                oldField: a.string({ isDeprecated: true }),
            });
            const result = toJsonSchema(schema);

            expect(result.properties?.id?.description).toBe(
                'Unique identifier',
            );
            expect(result.properties?.oldField?.deprecated).toBe(true);
        });
    });

    describe('any type', () => {
        it('converts any to empty schema', () => {
            const schema = a.any();
            const result = toJsonSchema(schema);

            // Empty schema (no type constraint) represents any
            expect(result.type).toBeUndefined();
            expect(result.$schema).toBe(
                'https://json-schema.org/draft/2020-12/schema',
            );
        });
    });

    describe('recursive types', () => {
        it('converts ref schema to $ref', () => {
            type BinaryTree = {
                left: BinaryTree | null;
                right: BinaryTree | null;
            };

            const BinaryTree = a.recursive<BinaryTree>('BinaryTree', (self) =>
                a.object({
                    left: a.nullable(self),
                    right: a.nullable(self),
                }),
            );

            const result = toJsonSchema(BinaryTree);

            expect(result.type).toBe('object');
            expect(result.title).toBe('BinaryTree');
            expect(result.properties?.left).toStrictEqual({
                anyOf: [{ $ref: '#/$defs/BinaryTree' }, { type: 'null' }],
            });
            expect(result.properties?.right).toStrictEqual({
                anyOf: [{ $ref: '#/$defs/BinaryTree' }, { type: 'null' }],
            });
        });
    });

    describe('options', () => {
        it('applies custom $id', () => {
            const schema = a.string();
            const result = toJsonSchema(schema, {
                $id: 'https://example.com/schemas/string.json',
            });

            expect(result.$id).toBe('https://example.com/schemas/string.json');
        });

        it('applies custom title and description', () => {
            const schema = a.object({ id: a.string() });
            const result = toJsonSchema(schema, {
                title: 'MyObject',
                description: 'A custom object schema',
            });

            expect(result.title).toBe('MyObject');
            expect(result.description).toBe('A custom object schema');
        });

        it('applies custom $schema', () => {
            const schema = a.string();
            const result = toJsonSchema(schema, {
                $schema: 'https://json-schema.org/draft/2019-09/schema',
            });

            expect(result.$schema).toBe(
                'https://json-schema.org/draft/2019-09/schema',
            );
        });

        it('allows disabling definitions collection', () => {
            const schema = a.object({ id: a.string() }, { id: 'User' });
            const result = toJsonSchema(schema, { definitions: false });

            expect(result.$defs).toBeUndefined();
        });
    });

    describe('complex schemas', () => {
        it('converts a complex user schema', () => {
            const UserSchema = a.object(
                {
                    id: a.string({ description: 'Unique user identifier' }),
                    name: a.string(),
                    email: a.nullable(a.string()),
                    age: a.optional(a.uint8()),
                    role: a.stringEnum(['USER', 'ADMIN', 'MODERATOR']),
                    tags: a.array(a.string()),
                    metadata: a.record(a.any()),
                    createdAt: a.timestamp(),
                },
                { id: 'User', description: 'Represents a user in the system' },
            );

            const result = toJsonSchema(UserSchema);

            expect(result.title).toBe('User');
            expect(result.description).toBe('Represents a user in the system');
            expect(result.type).toBe('object');

            expect(result.properties?.id?.type).toBe('string');
            expect(result.properties?.id?.description).toBe(
                'Unique user identifier',
            );

            expect(result.properties?.email?.type).toStrictEqual([
                'string',
                'null',
            ]);

            expect(result.properties?.role?.enum).toStrictEqual([
                'USER',
                'ADMIN',
                'MODERATOR',
            ]);

            expect(result.properties?.tags?.type).toBe('array');
            expect(result.properties?.tags?.items).toStrictEqual({
                type: 'string',
            });

            expect(result.properties?.metadata?.type).toBe('object');

            expect(result.properties?.createdAt?.type).toBe('string');
            expect(result.properties?.createdAt?.format).toBe('date-time');

            expect(result.required).toContain('id');
            expect(result.required).toContain('name');
            expect(result.required).not.toContain('age');
        });

        it('converts API response with discriminated unions', () => {
            const ApiResponse = a.discriminator('status', {
                success: a.object({
                    data: a.object({
                        users: a.array(
                            a.object({
                                id: a.string(),
                                name: a.string(),
                            }),
                        ),
                    }),
                }),
                error: a.object({
                    code: a.int32(),
                    message: a.string(),
                }),
            });

            const result = toJsonSchema(ApiResponse);

            expect(result.oneOf).toBeDefined();
            expect(result.oneOf?.length).toBe(2);

            const successVariant = result.oneOf?.find(
                (s) => s.properties?.status?.const === 'success',
            );
            expect(successVariant?.properties?.data?.type).toBe('object');
            expect(
                successVariant?.properties?.data?.properties?.users?.type,
            ).toBe('array');

            const errorVariant = result.oneOf?.find(
                (s) => s.properties?.status?.const === 'error',
            );
            expect(errorVariant?.properties?.code?.type).toBe('integer');
            expect(errorVariant?.properties?.message?.type).toBe('string');
        });
    });

    describe('edge cases', () => {
        it('handles object with no required properties', () => {
            const schema = a.object({
                a: a.optional(a.string()),
                b: a.optional(a.string()),
            });
            const result = toJsonSchema(schema);

            expect(result.required).toBeUndefined();
        });

        it('handles empty object', () => {
            const schema = a.object({});
            const result = toJsonSchema(schema);

            expect(result.type).toBe('object');
            expect(result.properties).toStrictEqual({});
            expect(result.required).toBeUndefined();
        });

        it('handles deeply nested arrays and objects', () => {
            const schema = a.object({
                level1: a.object({
                    level2: a.array(
                        a.object({
                            level3: a.record(a.array(a.string())),
                        }),
                    ),
                }),
            });
            const result = toJsonSchema(schema);

            const level1 = result.properties?.level1 as JsonSchema;
            expect(level1.type).toBe('object');

            const level2 = level1.properties?.level2 as JsonSchema;
            expect(level2.type).toBe('array');

            const level2Items = level2.items as JsonSchema;
            expect(level2Items.type).toBe('object');

            const level3 = level2Items.properties?.level3 as JsonSchema;
            expect(level3.type).toBe('object');
            expect((level3.additionalProperties as JsonSchema).type).toBe(
                'array',
            );
        });
    });
});
