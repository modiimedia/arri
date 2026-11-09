import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

type RecursiveUnionAdjacent =
    | { kind: 'child'; data: RecursiveUnionAdjacent }
    | { kind: 'children'; data: RecursiveUnionAdjacent[] }
    | { kind: 'text'; data: string }
    | { kind: 'shape'; data: { width: number; height: number; color: string } };

const RecursiveUnionAdjacent = a.recursive<RecursiveUnionAdjacent>(
    'RecursiveUnionAdjacent',
    (self) =>
        a.union(
            {
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
            },
            {
                tagKey: 'kind',
                valueKey: 'data',
            },
        ),
);

export default defineRpc({
    params: RecursiveUnionAdjacent,
    response: RecursiveUnionAdjacent,
    async handler({ params }) {
        return params;
    },
});
