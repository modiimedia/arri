import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

type RecursiveUnionInternal =
    | { kind: 'child'; data: RecursiveUnionInternal }
    | { kind: 'children'; data: RecursiveUnionInternal[] }
    | { kind: 'text'; data: string }
    | { kind: 'shape'; data: { width: number; height: number; color: string } };

const RecursiveUnionInternal = a.recursive<RecursiveUnionInternal>(
    'RecursiveUnionInternal',
    (self) =>
        a.union(
            {
                child: a.object({
                    data: self,
                }),
                children: a.object({
                    data: a.array(self, {
                        description: 'an array of child nodes',
                    }),
                }),
                text: a.object({
                    data: a.string({ description: 'Text node' }),
                }),
                shape: a.object({
                    data: a.object(
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
            },
            {
                tagKey: 'kind',
            },
        ),
);

export default defineRpc({
    params: RecursiveUnionInternal,
    response: RecursiveUnionInternal,
    async handler({ params }) {
        return params;
    },
});
