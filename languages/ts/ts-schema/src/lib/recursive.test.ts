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
        a.parse(BinaryTree, input);
        const result = a.safeParse(BinaryTree, input);
        const jsonResult = a.safeParse(BinaryTree, JSON.stringify(input));
        if (!result.success) {
            console.error(result.error);
        }
        if (!jsonResult.success) {
            console.error(jsonResult.error);
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
    expect(a.serialize(SchemaA, input)).toBe(a.serialize(SchemaB, input));
});
