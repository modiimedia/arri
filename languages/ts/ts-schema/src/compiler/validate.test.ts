import { a } from '../_index';
import { compile } from '../compile';
import { validationTestSuites } from '../testSuites';

Object.keys(validationTestSuites).forEach((key) => {
    describe(key, () => {
        const suite = validationTestSuites[key]!;
        const Compiled = compile(suite.schema, true);
        for (let i = 0; i < suite.goodInputs.length; i++) {
            const input = suite.goodInputs[i]!;
            test(`Good input ${i + 1}`, () => {
                if (!Compiled.validate(input)) {
                    console.log(suite.schema);
                    console.log(input, 'Should be TRUE');
                    console.log(Compiled.compiledCode.validate);
                }
                expect(Compiled.validate(input)).toBe(true);
            });
        }
        for (let i = 0; i < suite.badInputs.length; i++) {
            const input = suite.badInputs[i]!;
            test(`Bad input ${i + 1}`, () => {
                if (Compiled.validate(input)) {
                    console.log(suite.schema);
                    console.log(input, 'Should be FALSE');
                    console.log(Compiled.compiledCode.validate);
                }
                expect(Compiled.validate(input)).toBe(false);
            });
        }
    });
});

const User = a.object({
    id: a.string(),
    photo: a.optional(
        a.object({
            url: a.string(),
            width: a.nullable(a.int32()),
            height: a.nullable(a.int32()),
        }),
    ),
});

const PostComment = a.discriminator('commentType', {
    TEXT: a.object({
        userId: a.string(),
        user: User,
        text: a.string(),
    }),
    IMAGE: a.object({
        userId: a.string(),
        user: User,
        imageUrl: a.string(),
    }),
    VIDEO: a.object({
        userId: a.string(),
        user: User,
        videoUrl: a.string(),
    }),
});

const Post = a.object({
    id: a.string(),
    isFeatured: a.boolean(),
    userId: a.string(),
    user: User,
    type: a.stringEnum(['text', 'image', 'video']),
    title: a.string(),
    content: a.string(),
    tags: a.optional(a.array(a.string())),
    createdAt: a.timestamp(),
    updatedAt: a.timestamp(),
    numComments: a.uint32(),
    numLikes: a.int32(),
    unknownField: a.any(),
    comments: a.array(PostComment),
    numArray: a.array(a.number()),
    stringArray: a.array(a.string()),
    metadata: a.record(
        a.object({
            key: a.string(),
            createdAt: a.timestamp(),
        }),
    ),
});

type Post = a.infer<typeof Post>;

const PostValidator = compile(Post);
const goodInput: Post = {
    id: '',
    isFeatured: false,
    userId: '',
    user: {
        id: '',
        photo: {
            url: '',
            width: 500,
            height: null,
        },
    },
    type: 'text',
    title: '',
    content: '',
    tags: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    numComments: 199,
    numLikes: 2888,
    unknownField: {
        blah: 'blah',
        blahBlah: {
            blah: false,
        },
    },
    comments: [
        {
            commentType: 'TEXT',
            user: {
                id: '1',
                photo: undefined,
            },
            userId: '1',
            text: 'You suck',
        },
        {
            commentType: 'IMAGE',
            user: {
                id: '2',
                photo: {
                    url: '',
                    height: 10,
                    width: 10,
                },
            },
            userId: '2',
            imageUrl: 'https://someimage.com/image.jpg',
        },
    ],
    numArray: [50, 100, 20],
    stringArray: ['50', '100', '20'],
    metadata: {
        foo: {
            key: 'foo',
            createdAt: new Date(),
        },
        bar: {
            key: 'bar',
            createdAt: new Date(),
        },
    },
};
it('validates good input', () => {
    expect(PostValidator.validate(goodInput)).toBe(true);
});
it("doesn't validate bad input", () => {
    const badInput1 = {
        ...goodInput,
        numArray: ['1', '2', '50'],
    };
    expect(PostValidator.validate(badInput1)).toBe(false);
    const badInput2 = {
        ...goodInput,
        metadata: { foo: { name: 'blah', createdAt: 0 } },
    };
    expect(PostValidator.validate(badInput2)).toBe(false);
});

it('validates strings', () => {
    const Compiled = compile(a.string());
    expect(Compiled.validate('hello world')).toBe(true);
    expect(Compiled.validate(0)).toBe(false);
    expect(Compiled.validate({ hello: 'world' })).toBe(false);
});

it('validates nullable strings', () => {
    const Compiled = compile(a.nullable(a.string()));
    expect(Compiled.validate('hello world')).toBe(true);
    expect(Compiled.validate(null)).toBe(true);
    expect(Compiled.validate(0)).toBe(false);
});

it('validates floats', () => {
    const Compiled = compile(a.float32());
    expect(Compiled.validate(0.1)).toBe(true);
    expect(Compiled.validate(100)).toBe(true);
    expect(Compiled.validate(-100.5)).toBe(true);
    expect(Compiled.validate('0.5')).toBe(false);
});

it('validates nullable floats', () => {
    const Compiled = compile(a.nullable(a.float32()));
    expect(Compiled.validate(0.1)).toBe(true);
    expect(Compiled.validate(null)).toBe(true);
    expect(Compiled.validate('0.1')).toBe(false);
});

it('validates ints', () => {
    const CompiledInt8 = compile(a.int8());
    expect(CompiledInt8.validate(1)).toBe(true);
    expect(CompiledInt8.validate(100)).toBe(true);
    expect(CompiledInt8.validate(10000)).toBe(false);
    expect(CompiledInt8.validate(1.5)).toBe(false);
    expect(CompiledInt8.validate('199')).toBe(false);

    const CompiledUint8 = compile(a.uint8());
    expect(CompiledUint8.validate(1)).toBe(true);
    expect(CompiledUint8.validate(255)).toBe(true);
    expect(CompiledUint8.validate(1000)).toBe(false);
    expect(CompiledUint8.validate(-100)).toBe(false);
    expect(CompiledUint8.validate(10.5)).toBe(false);
    expect(CompiledUint8.validate('100')).toBe(false);

    const CompiledInt32 = compile(a.int32());
    expect(CompiledInt32.validate(5000)).toBe(true);
    expect(CompiledInt32.validate(-1035)).toBe(true);
    // eslint-disable-next-line no-loss-of-precision
    expect(CompiledInt32.validate(99999999999999999999)).toBe(false);
    expect(CompiledInt32.validate(100.5)).toBe(false);
    expect(CompiledInt32.validate('100')).toBe(false);

    const CompiledUint32 = compile(a.uint32());
    expect(CompiledUint32.validate(1000)).toBe(true);
    expect(CompiledUint32.validate(-1000)).toBe(false);
});

it('validates nullable ints', () => {
    const Compiled = compile(a.nullable(a.int8()));
    expect(Compiled.validate(1)).toBe(true);
    expect(Compiled.validate(null)).toBe(true);
    expect(Compiled.validate('1')).toBe(false);
});

it('validates enums', () => {
    const Compiled = compile(a.stringEnum(['TEXT', 'VIDEO', 'IMAGE']));
    expect(Compiled.validate('TEXT')).toBe(true);
    expect(Compiled.validate('VIDEO')).toBe(true);
    expect(Compiled.validate('text')).toBe(false);
});

it('validates nullable enums', () => {
    const Compiled = compile(
        a.nullable(a.stringEnum(['TEXT', 'VIDEO', 'IMAGE'])),
    );
    expect(Compiled.validate('TEXT')).toBe(true);
    expect(Compiled.validate(null)).toBe(true);
    expect(Compiled.validate('BAR')).toBe(false);
});

it('validates objects', () => {
    const Compiled = compile(
        a.object({
            id: a.string(),
            isActive: a.boolean(),
            createdAt: a.optional(a.timestamp()),
        }),
    );
    expect(
        Compiled.validate({
            id: '1',
            isActive: false,
            createdAt: undefined,
        }),
    ).toBe(true);
    expect(
        Compiled.validate({
            id: 1,
            isActive: true,
            createdAt: new Date(),
        }),
    ).toBe(false);
    const CompiledNested = compile(
        a.object({
            foo: a.string(),
            bar: a.object({
                foo: a.array(a.boolean()),
                bar: a.timestamp(),
                baz: a.nullable(a.record(a.boolean())),
            }),
        }),
    );
    expect(
        CompiledNested.validate({
            foo: '1',
            bar: { foo: [true, false], bar: new Date(), baz: null },
        }),
    ).toBe(true);
    expect(
        CompiledNested.validate({
            foo: '1',
            bar: {
                foo: [true, false],
                bar: new Date(),
                baz: { a: true, _b: false },
            },
        }),
    ).toBe(true);
    expect(
        CompiledNested.validate({
            foo: '1',
            bar: {
                foo: [true, false],
                bar: new Date(),
                baz: { a: null, _b: 'Hello world' },
            },
        }),
    ).toBe(false);
});

it('validates nullable objects', () => {
    const Compiled = compile(
        a.nullable(
            a.object({
                foo: a.string(),
                bar: a.string(),
                baz: a.timestamp(),
            }),
        ),
    );
    expect(Compiled.validate({ foo: 'FOO', bar: 'BAR', baz: new Date() })).toBe(
        true,
    );
    expect(Compiled.validate(null)).toBe(true);
    expect(
        Compiled.validate({
            foo: 1,
            bar: '',
            baz: false,
        }),
    ).toBe(false);
});

it('validates booleans', () => {
    const Compiled = compile(a.boolean());
    expect(Compiled.validate(true)).toBe(true);
    expect(Compiled.validate(false)).toBe(true);
    expect(Compiled.validate('Hello world')).toBe(false);
});

it('validates nullable booleans', () => {
    const Compiled = compile(a.nullable(a.boolean()));
    expect(Compiled.validate(true)).toBe(true);
    expect(Compiled.validate(null)).toBe(true);
    expect(Compiled.validate('Hello world')).toBe(false);
});

it('validates arrays', () => {
    const CompiledSimple = compile(a.array(a.boolean()));
    expect(CompiledSimple.validate([true, false, true])).toBe(true);
    expect(CompiledSimple.validate([true, false, 1, 'true'])).toBe(false);

    const CompiledComplex = compile(
        a.array(a.object({ id: a.string(), isActive: a.boolean() })),
    );
    expect(
        CompiledComplex.validate([
            { id: '12345', isActive: true },
            { id: '1', isActive: false },
        ]),
    ).toBe(true);
    expect(
        CompiledComplex.validate([
            {
                id: 1,
                isActive: 'true',
            },
        ]),
    ).toBe(false);
});

it('validates nullable arrays', () => {
    const Compiled = compile(a.nullable(a.array(a.string())));
    expect(Compiled.validate(['1', '2'])).toBe(true);
    expect(Compiled.validate(null)).toBe(true);
    expect(Compiled.validate([1, 2])).toBe(false);
});

it('validates records', () => {
    const Compiled = compile(a.record(a.number()));
    expect(
        Compiled.validate({
            foo: 1,
            bar: 2,
            baz: 3,
        }),
    ).toBe(true);
    expect(
        Compiled.validate({
            foo: '1',
            bar: '2',
            baz: '3',
        }),
    ).toBe(false);
});

it('validates nullable records', () => {
    const Compiled = compile(a.nullable(a.record(a.string())));
    expect(Compiled.validate({ foo: 'foo' })).toBe(true);
    expect(Compiled.validate(null)).toBe(true);
    expect(Compiled.validate({ foo: true })).toBe(false);
});

it('validates discriminators', () => {
    const Compiled = compile(
        a.discriminator('eventType', {
            POST_LIKE: a.object({
                userId: a.string(),
                postId: a.string(),
            }),
            POST_COMMENT: a.object({
                userId: a.string(),
                postId: a.string(),
                commentText: a.string(),
            }),
        }),
    );
    expect(
        Compiled.validate({ eventType: 'POST_LIKE', userId: '', postId: '' }),
    ).toBe(true);
    expect(
        Compiled.validate({
            eventType: 'POST_COMMENT',
            userId: '',
            postId: '',
            commentText: '',
        }),
    ).toBe(true);
    expect(
        Compiled.validate({
            eventType: 'POST_DELETE',
            postId: '',
        }),
    ).toBe(false);
});

it('validates nullable discriminators', () => {
    const Compiled = compile(
        a.nullable(
            a.discriminator('eventType', {
                A: a.object({
                    foo: a.string(),
                }),
                B: a.object({
                    foo: a.string(),
                    bar: a.number(),
                }),
            }),
        ),
    );
    expect(
        Compiled.validate({
            eventType: 'A',
            foo: 'foo',
        }),
    ).toBe(true);
    expect(
        Compiled.validate({
            eventType: 'B',
            foo: 'foo',
            bar: 0,
        }),
    ).toBe(true);
    expect(Compiled.validate(null)).toBe(true);
    expect(
        Compiled.validate({
            eventType: 'A',
        }),
    ).toBe(false);
});

it('uses strict properly', () => {
    const LooseSchema = a.compile(
        a.object({ id: a.string(), name: a.string() }),
    );
    const StrictSchema = a.compile(
        a.object(
            {
                id: a.string(),
                name: a.string(),
            },
            { isStrict: true },
        ),
    );
    const input = {
        id: '',
        name: '',
    };
    const inputWithAdditionalFields = {
        id: '',
        name: '',
        description: '',
    };
    expect(LooseSchema.validate(input)).toBe(true);
    expect(LooseSchema.validate(inputWithAdditionalFields)).toBe(true);
    expect(StrictSchema.validate(input)).toBe(true);
    expect(StrictSchema.validate(inputWithAdditionalFields)).toBe(false);
});
