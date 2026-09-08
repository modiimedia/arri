import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

type RecursiveUnionV2 =
    | { child: RecursiveUnionV2 }
    | { children: RecursiveUnionV2[] }
    | { text: string }
    | { shape: { width: number; height: number; color: string } };

const RecursiveUnionV2 = a.recursive<RecursiveUnionV2>(
    'RecursiveUnionV2',
    (self) =>
        a.union({
            child: self,
            children: a.array(self),
            text: a.string(),
            shape: a.object({
                width: a.float64(),
                height: a.float64(),
                color: a.string(),
            }),
        }),
);

export default defineRpc({
    params: RecursiveUnionV2,
    response: RecursiveUnionV2,
    async handler({ params }) {
        return params;
    },
});
