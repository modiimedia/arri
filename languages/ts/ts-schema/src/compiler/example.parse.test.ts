import {
    parseUserNew,
    parseUserNewV2,
    parseUserOld,
    TestUser,
} from './example.parse';

const user: TestUser = {
    id: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: '',
    email: null,
};

test('equivalent', () => {
    const contextNew = {
        errors: [],
    };
    const contextOld = {
        errors: [],
    };
    expect(parseUserNew(user, contextNew)).toStrictEqual(
        parseUserOld(user, contextOld),
    );
    expect(parseUserNewV2(user, contextNew)).toStrictEqual(
        parseUserOld(user, contextOld),
    );
});
