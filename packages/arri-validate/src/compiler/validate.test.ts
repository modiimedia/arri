import { a } from "../_index";
import { compileV2 } from "../compile";

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

const PostComment = a.discriminator("commentType", {
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
    type: a.stringEnum(["text", "image", "video"]),
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

const PostValidator = compileV2(Post);
const goodInput: Post = {
    id: "",
    isFeatured: false,
    userId: "",
    user: {
        id: "",
        photo: {
            url: "",
            width: 500,
            height: null,
        },
    },
    type: "text",
    title: "",
    content: "",
    tags: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    numComments: 199,
    numLikes: 2888,
    unknownField: {
        blah: "blah",
        blahBlah: {
            blah: false,
        },
    },
    comments: [
        {
            commentType: "TEXT",
            user: {
                id: "1",
                photo: undefined,
            },
            userId: "1",
            text: "You suck",
        },
        {
            commentType: "IMAGE",
            user: {
                id: "2",
                photo: {
                    url: "",
                    height: 10,
                    width: 10,
                },
            },
            userId: "2",
            imageUrl: "https://someimage.com/image.jpg",
        },
    ],
    numArray: [50, 100, 20],
    stringArray: ["50", "100", "20"],
    metadata: {
        foo: {
            key: "foo",
            createdAt: new Date(),
        },
        bar: {
            key: "bar",
            createdAt: new Date(),
        },
    },
};
it("validates good input", () => {
    expect(PostValidator.validate(goodInput));
});
it("doesn't validate bad input", () => {
    const badInput1 = {
        ...goodInput,
        numArray: ["1", "2", "50"],
    };
    expect(PostValidator.validate(badInput1));
    const badInput2 = {
        ...goodInput,
        metadata: { foo: { name: "blah", createdAt: 0 } },
    };
    expect(!PostValidator.validate(badInput2));
});

it("validates strings", () => {
    const Compiled = compileV2(a.string());
    expect(Compiled.validate("hello world"));
    expect(!Compiled.validate(0));
    expect(!Compiled.validate({ hello: "world" }));
});

it("validates floats", () => {
    const Compiled = compileV2(a.float32());
    expect(Compiled.validate(0.1));
    expect(Compiled.validate(100));
    expect(Compiled.validate(-100.5));
    expect(!Compiled.validate("0.5"));
});

it("validates ints", () => {
    const CompiledInt8 = compileV2(a.int8());
    expect(CompiledInt8.validate(1));
    expect(CompiledInt8.validate(100));
    expect(!CompiledInt8.validate(10000));
    expect(!CompiledInt8.validate(1.5));
    expect(!CompiledInt8.validate("199"));

    const CompiledUint8 = compileV2(a.uint8());
    expect(CompiledUint8.validate(1));
    expect(CompiledUint8.validate(255));
    expect(!CompiledUint8.validate(1000));
    expect(!CompiledUint8.validate(-100));
    expect(!CompiledUint8.validate(10.5));
    expect(!CompiledUint8.validate("100"));

    const CompiledInt32 = compileV2(a.int32());
    expect(CompiledInt32.validate(5000));
    expect(CompiledInt32.validate(-1035));
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    expect(!CompiledInt32.validate(99999999999999999999));
    expect(!CompiledInt32.validate(100.5));
    expect(!CompiledInt32.validate("100"));

    const CompiledUint32 = compileV2(a.uint32());
    expect(CompiledUint32.validate(1000));
    expect(!CompiledUint32.validate(-1000));
});

it("validates enums", () => {
    const Compiled = compileV2(a.stringEnum(["TEXT", "VIDEO", "IMAGE"]));
    expect(Compiled.validate("TEXT"));
    expect(Compiled.validate("VIDEO"));
    expect(!Compiled.validate("text"));
});

it("validates objects", () => {
    const Compiled = compileV2(
        a.object({
            id: a.string(),
            isActive: a.boolean(),
            createdAt: a.optional(a.timestamp()),
        }),
    );
    expect(
        Compiled.validate({
            id: "1",
            isActive: false,
            createdAt: undefined,
        }),
    );
    expect(
        !Compiled.validate({
            id: 1,
            isActive: true,
            createdAt: new Date(),
        }),
    );
    const CompiledNested = compileV2(
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
            foo: "1",
            bar: { foo: [true, false], bar: new Date(), baz: null },
        }),
    );
    expect(
        CompiledNested.validate({
            foo: "1",
            bar: {
                foo: [true, false],
                bar: new Date(),
                baz: { a: true, _b: false },
            },
        }),
    );
    expect(
        !CompiledNested.validate({
            foo: "1",
            bar: {
                foo: [true, false],
                bar: new Date(),
                baz: { a: null, _b: "Hello world" },
            },
        }),
    );
});

it("validates booleans", () => {
    const Compiled = compileV2(a.boolean());
    expect(Compiled.validate(true));
    expect(Compiled.validate(false));
    expect(!Compiled.validate("Hello world"));
});

it("validates arrays", () => {
    const CompiledSimple = compileV2(a.array(a.boolean()));
    expect(CompiledSimple.validate([true, false, true]));
    expect(!CompiledSimple.validate([true, false, 1, "true"]));

    const CompiledComplex = compileV2(
        a.array(a.object({ id: a.string(), isActive: a.boolean() })),
    );
    expect(
        CompiledComplex.validate([
            { id: "12345", isActive: true },
            { id: "1", isActive: false },
        ]),
    );
    expect(
        !CompiledComplex.validate([
            {
                id: 1,
                isActive: "true",
            },
        ]),
    );
});

it("validates records", () => {
    const Compiled = compileV2(a.record(a.number()));
    expect(
        Compiled.validate({
            foo: 1,
            bar: 2,
            baz: 3,
        }),
    );
    expect(
        !Compiled.validate({
            foo: "1",
            bar: "2",
            baz: "3",
        }),
    );
});

it("validates discriminators", () => {
    const Compiled = compileV2(
        a.discriminator("eventType", {
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
        Compiled.validate({ eventType: "POST_LIKE", userId: "", postId: "" }),
    );
    expect(
        Compiled.validate({
            eventType: "POST_COMMENT",
            userId: "",
            postId: "",
            commentText: "",
        }),
    );
    expect(
        !Compiled.validate({
            eventType: "POST_DELETE",
            postId: "",
        }),
    );
});
