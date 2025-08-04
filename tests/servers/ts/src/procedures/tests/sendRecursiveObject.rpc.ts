import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

interface RecursiveObject {
    left: RecursiveObject | null;
    right: RecursiveObject | null;
    value: string;
}

const RecursiveObject = a.recursive<RecursiveObject>(
    'RecursiveObject',
    (self) =>
        a.object({
            left: a.nullable(self),
            right: a.nullable(self),
            value: a.string(),
        }),
);

export default defineRpc({
    input: RecursiveObject,
    output: RecursiveObject,
    async handler({ input }) {
        return input;
    },
});
