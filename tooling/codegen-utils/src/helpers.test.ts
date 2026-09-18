import {
    AppDefinition,
    matchSchemaForms,
    removeDisallowedChars,
    type RpcDefinition,
    Schema,
    SchemaMatcher,
    setNestedObjectProperty,
    stringStartsWithNumber,
    unflattenObject,
    unflattenProcedures,
} from './index';

describe('unflattenObject()', () => {
    test('Simple Unflatten', () => {
        const flattened = {
            'hello.world': 'hello world',
            'another.nested.message': 'hello world',
        };
        expect(JSON.stringify(unflattenObject(flattened))).toEqual(
            JSON.stringify({
                hello: {
                    world: 'hello world',
                },
                another: {
                    nested: {
                        message: 'hello world',
                    },
                },
            }),
        );
    });

    test('Complex Unflatten', () => {
        const input: Record<string, RpcDefinition> = {
            'posts.getPost': {
                transport: 'http',
                method: 'get',
                path: '/posts/get-post',
                params: 'PostsGetPostParams',
                response: 'PostsGetPostResponse',
            },
            'posts.updatePost': {
                transport: 'http',
                method: 'post',
                path: '/posts/update-post',
                params: 'PostsUpdatePostParams',
                response: 'PostsUpdatePostResponse',
            },
            'posts.comments.getComment': {
                transport: 'http',
                method: 'get',
                path: '/posts/comments/get-comment',
                params: 'GetCommentParams',
                response: 'GetCommentResponse',
            },
            'users.getUser': {
                transport: 'http',
                method: 'get',
                path: '/users/getUser',
                params: 'UserParams',
                response: 'User',
            },
        };
        expect(JSON.stringify(unflattenObject(input))).toEqual(
            JSON.stringify({
                posts: {
                    getPost: {
                        transport: 'http',
                        method: 'get',
                        path: '/posts/get-post',
                        params: 'PostsGetPostParams',
                        response: 'PostsGetPostResponse',
                    },
                    updatePost: {
                        transport: 'http',
                        method: 'post',
                        path: '/posts/update-post',
                        params: 'PostsUpdatePostParams',
                        response: 'PostsUpdatePostResponse',
                    },
                    comments: {
                        getComment: {
                            transport: 'http',
                            method: 'get',
                            path: '/posts/comments/get-comment',
                            params: 'GetCommentParams',
                            response: 'GetCommentResponse',
                        },
                    },
                },
                users: {
                    getUser: {
                        transport: 'http',
                        method: 'get',
                        path: '/users/getUser',
                        params: 'UserParams',
                        response: 'User',
                    },
                },
            }),
        );
    });
});

describe('unflatten procedures', () => {
    const procedures: AppDefinition['procedures'] = {
        'users.getUser': {
            transport: 'http',
            path: '/users/get-user',
            method: 'get',
            params: 'GetUserParams',
            response: 'User',
        },
        'users.updateUser': {
            transport: 'http',
            path: '/users/update-user',
            method: 'post',
            params: 'UpdateUserParams',
            response: 'User',
        },
        'posts.getPost': {
            transport: 'http',
            path: '/posts/get-posts',
            method: 'get',
            params: 'GetPostParams',
            response: 'Post',
        },
    };
    test('without root service', () => {
        const result = unflattenProcedures(procedures);
        expect(result).toStrictEqual({
            users: {
                getUser: {
                    transport: 'http',
                    path: '/users/get-user',
                    method: 'get',
                    params: 'GetUserParams',
                    response: 'User',
                },
                updateUser: {
                    transport: 'http',
                    path: '/users/update-user',
                    method: 'post',
                    params: 'UpdateUserParams',
                    response: 'User',
                },
            },
            posts: {
                getPost: {
                    transport: 'http',
                    path: '/posts/get-posts',
                    method: 'get',
                    params: 'GetPostParams',
                    response: 'Post',
                },
            },
        });
    });
    test('with root service', () => {
        const result = unflattenProcedures(procedures, 'posts');
        expect(result).toStrictEqual({
            getPost: {
                transport: 'http',
                path: '/posts/get-posts',
                method: 'get',
                params: 'GetPostParams',
                response: 'Post',
            },
        });
    });
});

describe('setNestedObjectProperty()', () => {
    test('Assign some values', () => {
        const blah: Record<string, any> = {};
        setNestedObjectProperty('users.1', { id: 1, name: 'John Doe' }, blah);
        setNestedObjectProperty('users.2', { id: 2, name: 'Suzy Q' }, blah);
        expect(blah).toStrictEqual({
            users: {
                1: {
                    id: 1,
                    name: 'John Doe',
                },
                2: {
                    id: 2,
                    name: 'Suzy Q',
                },
            },
        });
    });
});

describe('String utils', () => {
    test('Remove symbols', () => {
        const disallowed = '!@#$%^&*()+|}{[];:\'"~/,=';
        const input = '+hello_%world!';
        expect(removeDisallowedChars(input, disallowed)).toBe('hello_world');
    });

    test('String starts with number', () => {
        const passingInputs = [
            '1foo',
            '2foo',
            '3foo',
            '4foo',
            '5foo',
            '6foo',
            '7foo',
            '8foo',
            '9foo',
        ];
        const failingInputs = ['foo', 'bar', 'baz', 'oof'];
        for (const input of passingInputs) {
            expect(stringStartsWithNumber(input)).toBe(true);
        }
        for (const input of failingInputs) {
            expect(stringStartsWithNumber(input)).toBe(false);
        }
    });
});

describe('matchSchemaForms()', () => {
    const testMatcher: SchemaMatcher<keyof SchemaMatcher<string>> = {
        type: (_) => 'type',
        enum: (_) => 'enum',
        properties: (_) => 'properties',
        elements: (_) => 'elements',
        values: (_) => 'values',
        discriminator: (_) => 'discriminator',
        union: (_) => 'union',
        ref: (_) => 'ref',
        empty: (_) => 'empty',
    };
    const testCases: {
        title: string;
        input: Schema;
        output: keyof SchemaMatcher<string>;
    }[] = [
        {
            title: 'SchemaFormType',
            input: { type: 'boolean' },
            output: 'type',
        },
        {
            title: 'SchemaFormEnum',
            input: { enum: ['foo', 'bar'] },
            output: 'enum',
        },
        {
            title: 'SchemaFormProperties',
            input: {
                properties: { foo: { type: 'string' } },
                optionalProperties: { bar: { type: 'boolean' } },
            },
            output: 'properties',
        },
        {
            title: 'SchemaFormElements',
            input: {
                elements: {
                    type: 'boolean',
                },
            },
            output: 'elements',
        },
        {
            title: 'SchemaFormValues',
            input: {
                values: {
                    type: 'timestamp',
                },
            },
            output: 'values',
        },
        {
            title: 'SchemaFormDiscriminator',
            input: {
                discriminator: 'type',
                mapping: {
                    foo: {
                        properties: {
                            foo: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
            output: 'discriminator',
        },
        {
            title: 'SchemaFormUnion',
            input: {
                union: {},
            },
            output: 'union',
        },
        {
            title: 'SchemaFormRef',
            input: {
                ref: 'Foo',
            },
            output: 'ref',
        },
        {
            title: 'SchemaFormEmpty',
            input: {},
            output: 'empty',
        },
        {
            title: 'SchemaFormEmpty with metadata',

            input: {
                metadata: {},
            },
            output: 'empty',
        },
        {
            title: 'Unknown schema falls back to SchemaFormEmpty',
            input: {
                foo: {},
            } as any,
            output: 'empty',
        },
    ];
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i]!;
        test(testCase.title, () => {
            expect(matchSchemaForms(testCase.input, testMatcher)).toBe(
                testCase.output,
            );
        });
    }
});
