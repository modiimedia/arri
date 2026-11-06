import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

type RecursiveUnionExternal =
    | { child: RecursiveUnionExternal }
    | { children: RecursiveUnionExternal[] }
    | { text: string }
    | { shape: { width: number; height: number; color: string } };

const RecursiveUnionExternal = a.recursive<RecursiveUnionExternal>(
    'RecursiveUnionExternal',
    (self) =>
        a.union({
            child: self,
            children: a.array(self, {
                description: 'an array of child nodes',
            }),
            text: a.string({ description: 'Text node' }),
            shape: a.object(
                {
                    width: a.float64(),
                    height: a.float64(),
                    color: a.string(),
                },
                {
                    description: 'Shape node',
                },
            ),
        }),
);

export default defineRpc({
    params: RecursiveUnionExternal,
    response: RecursiveUnionExternal,
    async handler({ params }) {
        return params;
    },
});
