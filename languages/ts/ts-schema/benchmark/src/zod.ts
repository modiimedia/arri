import b from 'benny';
import { z } from 'zod';

import { a } from '../../src/_index';

const ArriUser = a.object({
    id: a.int32(),
    role: a.stringEnum(['standard', 'admin', 'moderator']),
    name: a.string(),
    email: a.nullable(a.string()),
    createdAt: a.int32(),
    updatedAt: a.int32(),
    settings: a.optional(
        a.object({
            preferredTheme: a.stringEnum(['light', 'dark', 'system']),
            allowNotifications: a.boolean(),
        }),
    ),
    recentNotifications: a.array(
        a.discriminator('type', {
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
    ),
});
const $$ArriUser = a.compile(ArriUser);
type ArriUser = a.infer<typeof ArriUser>;

const input: ArriUser = {
    id: 12345,
    role: 'moderator',
    name: 'John Doe',
    email: null,
    createdAt: 0,
    updatedAt: 0,
    settings: {
        preferredTheme: 'system',
        allowNotifications: true,
    },
    recentNotifications: [
        {
            type: 'POST_LIKE',
            postId: '1',
            userId: '2',
        },
        {
            type: 'POST_COMMENT',
            postId: '1',
            userId: '1',
            commentText: '',
        },
    ],
};

const ZodUser = z.object({
    id: z.number(),
    role: z.enum(['standard', 'admin', 'moderator']),
    name: z.string(),
    email: z.string().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
    settings: z
        .object({
            preferredTheme: z.enum(['light', 'dark', 'system']),
            allowNotifications: z.boolean(),
        })
        .optional(),
    recentNotifications: z.array(
        z.discriminatedUnion('type', [
            z.object({
                type: z.literal('POST_LIKE'),
                userId: z.string(),
                postId: z.string(),
            }),
            z.object({
                type: z.literal('POST_COMMENT'),
                userId: z.string(),
                postId: z.string(),
            }),
        ]),
    ),
});

const badInput: ArriUser = {
    id: 12345,
    role: 'moderator',
    name: 'John Doe',
    email: null,
    createdAt: 0,
    updatedAt: 0,
    settings: {
        preferredTheme: 'system',
        allowNotifications: true,
    },
    recentNotifications: [
        {
            type: 'POST_LIKE',
            postId: '1',
            userId: '2',
        },
        {
            type: 'POST_BOOKMARK',
            postId: '1',
            userId: '2',
        } as any,
    ],
};

// const ArriUser = a.object("User", {
//     id: a.string(),
//     name: a.string(),
//     email: a.nullable(a.string()),
// })
// const $$ArriUser = a.compile(ArriUser);
// type User = a.infer<typeof ArriUser>;

// const ZodUser = z.object({
//     id: z.string(),
//     name: z.string(),
//     email: z.string().nullable(),
// })

// const input: User = {
//     id: '12345',
//     name: "John Doe",
//     email: "johndoe@gmail.com"
// }

b.suite(
    'Zod vs Arri Validation (Good Input)',
    b.add('Arri validate()', () => {
        $$ArriUser.validate(input);
    }),
    b.add('Arri parse()', () => {
        $$ArriUser.parse(input);
    }),
    b.add('Zod', () => {
        ZodUser.safeParse(input);
    }),
    b.cycle(),
    b.complete(),
    b.save({
        file: 'zod-vs-arri-good-input',
        format: 'chart.html',
        folder: 'benchmark/dist',
    }),
);

b.suite(
    'Zod vs Arri Validation (Bad Input)',
    b.add('Arri validate()', () => {
        $$ArriUser.validate(badInput);
    }),
    b.add('Arri parse()', () => {
        $$ArriUser.parse(badInput);
    }),
    b.add('Zod', () => {
        ZodUser.safeParse(badInput);
    }),
    b.cycle(),
    b.complete(),
    b.save({
        file: 'zod-vs-arri-bad-input',
        format: 'chart.html',
        folder: 'benchmark/dist',
    }),
);
