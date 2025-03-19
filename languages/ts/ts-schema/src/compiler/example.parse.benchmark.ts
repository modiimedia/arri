import b from 'benny';

import {
    parseUserNew,
    parseUserNewV2,
    parseUserOld,
    TestUser,
} from './example.parse';

const input: TestUser = {
    id: '12345',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'John Doe',
    email: null,
};

b.suite(
    'old method',
    b.add('old method', () => {
        const context = {
            errors: [],
        };
        parseUserOld(input, context);
    }),

    b.cycle(),
    b.complete(),
);

b.suite(
    'new method',
    b.add('new method', () => {
        const context = {
            errors: [],
        };
        parseUserNew(input, context);
    }),
    b.cycle(),
    b.complete(),
);

b.suite(
    'new method v2',
    b.add('new method v2', () => {
        const context = {
            errors: [],
        };
        parseUserNewV2(input, context);
    }),
    b.cycle(),
    b.complete(),
);
