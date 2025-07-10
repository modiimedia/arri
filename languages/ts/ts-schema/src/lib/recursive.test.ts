import { StandardSchemaV1 } from '@standard-schema/spec';

import { a } from '../_index';

interface BinaryTree {
    left: BinaryTree | null;
    right: BinaryTree | null;
}
const BinaryTree = a.recursive<BinaryTree>(
    (self) =>
        a.object({
            left: a.nullable(self),
            right: a.nullable(self),
        }),
    {
        id: 'BinaryTree',
    },
);

type RecursiveUnion =
    | { type: 'CHILD'; data: RecursiveUnion }
    | { type: 'CHILDREN'; data: RecursiveUnion[] }
    | { type: 'TEXT'; data: string }
    | {
          type: 'SHAPE';
          data: {
              width: number;
              height: number;
              color: string;
          };
      };
const RecursiveUnion = a.recursive<RecursiveUnion>(
    (self) =>
        a.discriminator('type', {
            CHILD: a.object({
                data: self,
            }),
            CHILDREN: a.object({
                data: a.array(self),
            }),
            TEXT: a.object({
                data: a.string(),
            }),
            SHAPE: a.object({
                data: a.object({
                    width: a.float64(),
                    height: a.float64(),
                    color: a.string(),
                }),
            }),
        }),
    {
        id: 'RecursiveUnion',
    },
);
test('type inference', () => {
    // TODO: figure out how to infer recursive type without needing to pass in type parameter
    const value: a.infer<typeof RecursiveUnion> = {
        type: 'CHILD',
        data: {
            type: 'CHILDREN',
            data: [
                {
                    type: 'TEXT',
                    data: '',
                },
                {
                    type: 'SHAPE',
                    data: {
                        width: 1,
                        height: 1,
                        color: '',
                    },
                },
            ],
        },
    };
    assertType<RecursiveUnion>(value);
    assertType<a.infer<typeof RecursiveUnion>>(value);
});

describe('validation', () => {
    test('Binary Tree', () => {
        const input: BinaryTree = {
            left: {
                left: {
                    left: null,
                    right: null,
                },
                right: {
                    left: null,
                    right: {
                        left: null,
                        right: null,
                    },
                },
            },
            right: null,
        };
        expect(a.validate(BinaryTree, input)).toBe(true);
        const input2 = {
            left: {
                left: {
                    left: false,
                    right: null,
                },
                right: {
                    left: null,
                    right: {
                        left: null,
                        right: null,
                    },
                },
            },
            right: null,
        };
        expect(a.validate(BinaryTree, input2)).toBe(false);
    });
    test('Recursive Union', () => {
        const input: RecursiveUnion = {
            type: 'CHILDREN',
            data: [
                {
                    type: 'CHILD',
                    data: {
                        type: 'TEXT',
                        data: 'Hello world',
                    },
                },
                {
                    type: 'SHAPE',
                    data: {
                        width: 1,
                        height: 1,
                        color: 'red',
                    },
                },
                {
                    type: 'CHILDREN',
                    data: [
                        {
                            type: 'SHAPE',
                            data: {
                                width: 2,
                                height: 2,
                                color: 'blue',
                            },
                        },
                    ],
                },
            ],
        };
        expect(a.validate(RecursiveUnion, input)).toBe(true);
        const badInput = {
            type: 'CHILDREN',
            data: [
                {
                    type: 'CHILD',
                    data: {
                        type: 'TEXT',
                        data: 'Hello world',
                    },
                },
                {
                    type: 'SHAPE',
                    data: {
                        width: 1,
                        height: 1,
                        color: 'red',
                    },
                },
                {
                    type: 'CHILDREN',
                    data: [
                        {
                            type: 'BLOCK',
                            data: {
                                width: 2,
                                height: 2,
                                color: 'blue',
                            },
                        },
                    ],
                },
            ],
        };
        expect(a.validate(RecursiveUnion, badInput)).toBe(false);
    });
});

describe('parsing', () => {
    test('Binary Tree', () => {
        const input: BinaryTree = {
            left: {
                left: {
                    left: null,
                    right: null,
                },
                right: {
                    left: null,
                    right: {
                        left: null,
                        right: null,
                    },
                },
            },
            right: {
                left: null,
                right: null,
            },
        };
        a.parseUnsafe(BinaryTree, input);
        const result = a.parse(BinaryTree, input);
        const jsonResult = a.parse(BinaryTree, JSON.stringify(input));
        if (!result.success) {
            console.error(result.errors);
        }
        if (!jsonResult.success) {
            console.error(jsonResult.errors);
        }
        expect(result.success).toBe(true);
        expect(jsonResult.success).toBe(true);
        if (result.success) {
            expect(result.value).toStrictEqual(input);
        }
        if (jsonResult.success) {
            expect(jsonResult.value).toStrictEqual(input);
        }
    });
});

test('overloaded functions produce the same result', () => {
    const SchemaA = a.recursive<BinaryTree>(
        (self) => a.object({ left: a.nullable(self), right: a.nullable(self) }),
        {
            id: 'BTree',
        },
    );
    const SchemaB = a.recursive<BinaryTree>('BTree', (self) =>
        a.object({ left: a.nullable(self), right: a.nullable(self) }),
    );
    expect(JSON.stringify(SchemaA)).toEqual(JSON.stringify(SchemaB));
    const input: BinaryTree = {
        left: {
            left: null,
            right: {
                left: null,
                right: null,
            },
        },
        right: null,
    };
    expect(a.validate(SchemaA, input)).toBe(a.validate(SchemaB, input));
    expect(a.parseUnsafe(SchemaA, input)).toStrictEqual(
        a.parseUnsafe(SchemaB, input),
    );
});

it('produces valid ATD', () => {
    const result = JSON.parse(JSON.stringify(BinaryTree));
    expect(result).toStrictEqual({
        properties: {
            left: {
                ref: 'BinaryTree',
                isNullable: true,
                metadata: {},
            },
            right: {
                ref: 'BinaryTree',
                isNullable: true,
                metadata: {},
            },
        },
        metadata: {
            id: 'BinaryTree',
        },
    });
});

describe('standard schema support', () => {
    const SchemaA = a.recursive<BinaryTree>(
        (self) => a.object({ left: a.nullable(self), right: a.nullable(self) }),
        {
            id: 'BTree',
        },
    );
    it('properly infers types', async () => {
        assertType<StandardSchemaV1<BinaryTree>>(SchemaA);
        const result = await SchemaA['~standard'].validate('');
        if (!result.issues) {
            assertType<BinaryTree>(result.value);
        }
    });
});
