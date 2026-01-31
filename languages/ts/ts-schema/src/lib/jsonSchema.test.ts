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

const UserSchema = a.object(
    {
        id: a.string({ description: 'Unique ID' }),
        name: a.string(),
        email: a.nullable(a.string()),
        age: a.optional(a.uint8()),
        role: a.stringEnum(['USER', 'ADMIN']),
        tags: a.array(a.string()),
        createdAt: a.timestamp(),
    },
    { id: 'User', description: 'A user in the system' },
);

const ApiResponseSchema = a.discriminator('status', {
    success: a.object({ data: a.object({ id: a.string() }) }),
    error: a.object({ code: a.int32(), message: a.string() }),
});

describe('toJsonSchema()', () => {
    describe('scalar types', () => {
        it('converts string', () => {
            expect(toJsonSchema(a.string())).toMatchObject({ type: 'string' });
        });

        it('converts boolean', () => {
            expect(toJsonSchema(a.boolean())).toMatchObject({
                type: 'boolean',
            });
        });

        it('converts timestamp', () => {
            expect(toJsonSchema(a.timestamp())).toMatchObject({
                type: 'string',
                format: 'date-time',
            });
        });

        it('converts float32/float64', () => {
            expect(toJsonSchema(a.float32())).toMatchObject({ type: 'number' });
            expect(toJsonSchema(a.float64())).toMatchObject({ type: 'number' });
        });

        it('converts integer types with bounds', () => {
            expect(toJsonSchema(a.int8())).toMatchObject({
                type: 'integer',
                minimum: int8Min,
                maximum: int8Max,
            });
            expect(toJsonSchema(a.uint8())).toMatchObject({
                type: 'integer',
                minimum: uint8Min,
                maximum: uint8Max,
            });
            expect(toJsonSchema(a.int16())).toMatchObject({
                type: 'integer',
                minimum: int16Min,
                maximum: int16Max,
            });
            expect(toJsonSchema(a.uint16())).toMatchObject({
                type: 'integer',
                minimum: uint16Min,
                maximum: uint16Max,
            });
            expect(toJsonSchema(a.int32())).toMatchObject({
                type: 'integer',
                minimum: int32Min,
                maximum: int32Max,
            });
            expect(toJsonSchema(a.uint32())).toMatchObject({
                type: 'integer',
                minimum: uint32Min,
                maximum: uint32Max,
            });
        });

        it('converts int64/uint64 as string with pattern', () => {
            expect(toJsonSchema(a.int64())).toMatchObject({
                type: 'string',
                pattern: '^-?[0-9]+$',
            });
            expect(toJsonSchema(a.uint64())).toMatchObject({
                type: 'string',
                pattern: '^[0-9]+$',
            });
        });

        it('includes $schema by default', () => {
            expect(toJsonSchema(a.string()).$schema).toBe(
                'https://json-schema.org/draft/2020-12/schema',
            );
        });
    });

    describe('enum type', () => {
        it('converts stringEnum', () => {
            const result = toJsonSchema(a.stringEnum(['FOO', 'BAR']));
            expect(result.type).toBe('string');
            expect(result.enum).toStrictEqual(['FOO', 'BAR']);
        });

        it('converts enumerator', () => {
            const result = toJsonSchema(a.enumerator(['A', 'B', 'C']));
            expect(result.type).toBe('string');
            expect(result.enum).toStrictEqual(['A', 'B', 'C']);
        });
    });

    describe('array type', () => {
        it('converts array of strings', () => {
            const result = toJsonSchema(a.array(a.string()));
            expect(result.type).toBe('array');
            expect(result.items).toStrictEqual({ type: 'string' });
        });

        it('converts array of integers', () => {
            const result = toJsonSchema(a.array(a.int32()));
            expect(result.items).toStrictEqual({
                type: 'integer',
                minimum: int32Min,
                maximum: int32Max,
            });
        });

        it('converts nested arrays', () => {
            const result = toJsonSchema(a.array(a.array(a.boolean())));
            expect(result.items).toStrictEqual({
                type: 'array',
                items: { type: 'boolean' },
            });
        });
    });

    describe('object type', () => {
        it('converts simple object', () => {
            const result = toJsonSchema(
                a.object({ id: a.string(), name: a.string() }),
            );

            expect(result.type).toBe('object');
            expect(result.properties).toStrictEqual({
                id: { type: 'string' },
                name: { type: 'string' },
            });
            expect(result.required).toStrictEqual(['id', 'name']);
        });

        it('handles optional properties', () => {
            const result = toJsonSchema(
                a.object({ id: a.string(), name: a.optional(a.string()) }),
            );
            expect(result.required).toStrictEqual(['id']);
        });

        it('handles strict mode', () => {
            const result = toJsonSchema(
                a.object({ id: a.string() }, { isStrict: true }),
            );
            expect(result.additionalProperties).toBe(false);
        });

        it('handles nested objects', () => {
            const result = toJsonSchema(
                a.object({ user: a.object({ id: a.string() }) }),
            );
            expect(result.properties?.user).toStrictEqual({
                type: 'object',
                properties: { id: { type: 'string' } },
                required: ['id'],
            });
        });

        it('handles empty object', () => {
            const result = toJsonSchema(a.object({}));
            expect(result.properties).toStrictEqual({});
            expect(result.required).toBeUndefined();
        });
    });

    describe('record type', () => {
        it('converts record of strings', () => {
            const result = toJsonSchema(a.record(a.string()));
            expect(result.type).toBe('object');
            expect(result.additionalProperties).toStrictEqual({
                type: 'string',
            });
        });

        it('converts record of objects', () => {
            const result = toJsonSchema(a.record(a.object({ id: a.string() })));
            expect(result.additionalProperties).toStrictEqual({
                type: 'object',
                properties: { id: { type: 'string' } },
                required: ['id'],
            });
        });
    });

    describe('discriminator type', () => {
        it('converts to oneOf with discriminator property', () => {
            const result = toJsonSchema(ApiResponseSchema);

            expect(result.oneOf?.length).toBe(2);

            const success = result.oneOf?.find(
                (s) => s.properties?.status?.const === 'success',
            );
            expect(success?.properties?.data?.type).toBe('object');
            expect(success?.required).toContain('status');

            const error = result.oneOf?.find(
                (s) => s.properties?.status?.const === 'error',
            );
            expect(error?.properties?.code?.type).toBe('integer');
        });
    });

    describe('nullable types', () => {
        it('converts nullable scalar', () => {
            expect(toJsonSchema(a.nullable(a.string())).type).toStrictEqual([
                'string',
                'null',
            ]);
            expect(toJsonSchema(a.nullable(a.int32())).type).toStrictEqual([
                'integer',
                'null',
            ]);
        });

        it('converts nullable object', () => {
            const result = toJsonSchema(
                a.nullable(a.object({ id: a.string() })),
            );
            expect(result.type).toStrictEqual(['object', 'null']);
            expect(result.properties).toStrictEqual({ id: { type: 'string' } });
        });

        it('converts nullable array', () => {
            const result = toJsonSchema(a.nullable(a.array(a.string())));
            expect(result.type).toStrictEqual(['array', 'null']);
            expect(result.items).toStrictEqual({ type: 'string' });
        });

        it('uses anyOf for nullable discriminator', () => {
            const result = toJsonSchema(a.nullable(ApiResponseSchema));

            expect(result.anyOf?.length).toBe(2);
            expect(result.anyOf?.some((s) => s.oneOf)).toBe(true);
            expect(result.anyOf?.some((s) => s.type === 'null')).toBe(true);
        });
    });

    describe('metadata', () => {
        it('applies id as title and description', () => {
            const result = toJsonSchema(UserSchema);
            expect(result.title).toBe('User');
            expect(result.description).toBe('A user in the system');
        });

        it('applies deprecated flag', () => {
            const result = toJsonSchema(
                a.object({ id: a.string() }, { isDeprecated: true }),
            );
            expect(result.deprecated).toBe(true);
        });

        it('applies property-level metadata', () => {
            const result = toJsonSchema(UserSchema);
            expect(result.properties?.id?.description).toBe('Unique ID');
        });
    });

    describe('special types', () => {
        it('converts any to empty schema', () => {
            expect(toJsonSchema(a.any()).type).toBeUndefined();
        });

        it('converts nullable any to anyOf with null', () => {
            const result = toJsonSchema(a.nullable(a.any()));
            expect(result.anyOf).toStrictEqual([{}, { type: 'null' }]);
        });

        it('converts recursive ref to $ref', () => {
            type Tree = { left: Tree | null; right: Tree | null };
            const Tree = a.recursive<Tree>('Tree', (self) =>
                a.object({ left: a.nullable(self), right: a.nullable(self) }),
            );

            const result = toJsonSchema(Tree);
            expect(result.properties?.left).toStrictEqual({
                anyOf: [{ $ref: '#/$defs/Tree' }, { type: 'null' }],
            });
        });
    });

    describe('options', () => {
        it('applies custom $id', () => {
            const result = toJsonSchema(a.string(), {
                $id: 'https://example.com/schema.json',
            });
            expect(result.$id).toBe('https://example.com/schema.json');
        });

        it('applies custom title and description', () => {
            const result = toJsonSchema(a.string(), {
                title: 'MySchema',
                description: 'A schema',
            });
            expect(result.title).toBe('MySchema');
            expect(result.description).toBe('A schema');
        });

        it('applies custom $schema', () => {
            const result = toJsonSchema(a.string(), {
                $schema: 'https://json-schema.org/draft/2019-09/schema',
            });
            expect(result.$schema).toBe(
                'https://json-schema.org/draft/2019-09/schema',
            );
        });
    });

    describe('complex schemas', () => {
        it('converts complex user schema', () => {
            const result = toJsonSchema(UserSchema);

            expect(result.title).toBe('User');
            expect(result.properties?.id?.description).toBe('Unique ID');
            expect(result.properties?.email?.type).toStrictEqual([
                'string',
                'null',
            ]);
            expect(result.properties?.role?.enum).toStrictEqual([
                'USER',
                'ADMIN',
            ]);
            expect(result.properties?.tags?.type).toBe('array');
            expect(result.properties?.createdAt?.format).toBe('date-time');
        });

        it('converts discriminated union API response', () => {
            const result = toJsonSchema(ApiResponseSchema);

            expect(result.oneOf?.length).toBe(2);

            const success = result.oneOf?.find(
                (s) => s.properties?.status?.const === 'success',
            );
            expect(success?.properties?.data?.type).toBe('object');

            const error = result.oneOf?.find(
                (s) => s.properties?.status?.const === 'error',
            );
            expect(error?.properties?.code?.type).toBe('integer');
        });

        it('handles deeply nested structures', () => {
            const DeepSchema = a.object({
                l1: a.object({
                    l2: a.array(
                        a.object({ l3: a.record(a.array(a.string())) }),
                    ),
                }),
            });
            const result = toJsonSchema(DeepSchema);

            const l1 = result.properties?.l1 as JsonSchema;
            const l2 = l1.properties?.l2 as JsonSchema;
            const l3 = (l2.items as JsonSchema).properties?.l3 as JsonSchema;

            expect(l1.type).toBe('object');
            expect(l2.type).toBe('array');
            expect(l3.type).toBe('object');
            expect((l3.additionalProperties as JsonSchema).type).toBe('array');
        });
    });
});
