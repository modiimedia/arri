import { faker } from "@faker-js/faker";
import { a } from "arri-validate";

export const Author = a.object(
    {
        id: a.string(),
        name: a.string(),
        bio: a.nullable(a.string()),
        createdAt: a.timestamp(),
        updatedAt: a.timestamp(),
    },
    {
        id: "Author",
    },
);
export type Author = a.infer<typeof Author>;
export function getRandomAuthor(data?: Partial<Author>): Author {
    return {
        id: data?.id ?? faker.string.uuid(),
        name: data?.name ?? faker.person.fullName(),
        bio:
            data?.bio ??
            faker.helpers.arrayElement([null, faker.lorem.paragraph()]),
        createdAt: data?.createdAt ?? faker.date.past(),
        updatedAt: data?.updatedAt ?? faker.date.recent(),
    };
}

export const PostType = a.stringEnum(["text", "image", "video"], {
    id: "PostType",
});
export type PostType = a.infer<typeof PostType>;

export const Post = a.object(
    {
        id: a.string(),
        title: a.string(),
        type: PostType,
        description: a.nullable(a.string()),
        content: a.string(),
        tags: a.array(a.string()),
        authorId: a.string(),
        author: Author,
        createdAt: a.timestamp(),
        updatedAt: a.timestamp(),
    },
    {
        id: "Post",
    },
);
export type Post = a.infer<typeof Post>;
export function getRandomPost(input?: Partial<Post>): Post {
    const authorId = input?.authorId ?? faker.string.uuid();
    return {
        id: input?.id ?? faker.string.uuid(),
        title: input?.title ?? faker.lorem.sentence(7),
        type:
            input?.type ??
            faker.helpers.arrayElement(["text", "image", "video"]),
        description:
            input?.description !== undefined
                ? input.description
                : faker.helpers.arrayElement([null, faker.lorem.paragraph()]),
        content: input?.content ?? faker.lorem.paragraphs(),
        tags: input?.tags?.length
            ? input.tags
            : [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
        authorId,
        author: input?.author ?? getRandomAuthor({ id: authorId }),
        createdAt: input?.createdAt ?? faker.date.past(),
        updatedAt: input?.updatedAt ?? faker.date.recent(),
    };
}
