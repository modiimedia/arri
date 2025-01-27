import { StandardSchemaV1 } from '@standard-schema/spec';

import { a } from './_index';

const User = a.object({
    id: a.string(),
    name: a.string(),
    email: a.nullable(a.string()),
    createdAt: a.timestamp(),
    updatedAt: a.timestamp(),
});
type User = a.infer<typeof User>;
const $$User = a.compile(User);

describe('standard-schema support', () => {
    it('properly infers types', async () => {
        assertType<StandardSchemaV1<User>>($$User);
        const result = await $$User['~standard'].validate('hello world');
        if (!result.issues) {
            assertType<User>(result.value);
        }
    });
    it('produces the same result', async () => {
        const input: User = {
            id: '',
            name: '',
            email: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        expect($$User.validate(input)).toBe(true);
        let standardResult = await $$User['~standard'].validate(input);
        expect(typeof standardResult.issues).toBe('undefined');
        if (!standardResult.issues) {
            expect(standardResult.value).toStrictEqual(input);
        }
        delete (input as any).createdAt;
        expect($$User.validate(input)).toBe(false);
        standardResult = await $$User['~standard'].validate(input);
        expect(standardResult.issues?.length).toBe(1);
        expect(standardResult.issues?.[0]?.path).toStrictEqual(['createdAt']);
    });
});
