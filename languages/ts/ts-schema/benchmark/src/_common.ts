export interface TestUser {
    id: number; // integer,
    role: 'standard' | 'admin' | 'moderator';
    name: string;
    email: string | null;
    createdAt: number; // integer
    updatedAt: number; // integer
    settings:
        | {
              preferredTheme: 'light' | 'dark' | 'system';
              allowNotifications: boolean;
          }
        | undefined;
    recentNotifications: Array<
        | {
              type: 'POST_LIKE';
              userId: string;
              postId: string;
          }
        | {
              type: 'POST_COMMENT';
              userId: string;
              postId: string;
              commentText: string;
          }
    >;
}
export const goodInput: TestUser = {
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
export const goodJsonInput = JSON.stringify(goodInput);

export const badInput: TestUser = {
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
export const badJsonInput = JSON.stringify(badInput);

export const goodInputWithStringValues = {
    id: '12345',
    role: 'moderator',
    name: 'John Doe',
    email: 'null',
    createdAt: '12135151',
    updatedAt: '13141343',
    settings: {
        preferredTheme: 'system',
        allowNotifications: 'true',
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
