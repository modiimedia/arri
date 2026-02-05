import { a } from '@arrirpc/schema';
import { defineRpc } from '@arrirpc/server';

type RecursiveUnion =
    | { type: 'CHILD'; data: RecursiveUnion }
    | {
          type: 'CHILDREN';
          data: RecursiveUnion[];
      }
    | { type: 'TEXT'; data: string }
    | { type: 'SHAPE'; data: { width: number; height: number; color: string } };

const RecursiveUnion = a.recursive<RecursiveUnion>('RecursiveUnion', (self) =>
    a.discriminator('type', {
        CHILD: a.object(
            {
                data: self,
            },
            { description: 'Child node' },
        ),
        CHILDREN: a.object(
            {
                data: a.array(self),
            },
            { description: 'List of children node' },
        ),
        TEXT: a.object(
            {
                data: a.string(),
            },
            {
                description: 'Text node',
            },
        ),
        SHAPE: a.object(
            {
                data: a.object({
                    width: a.float64(),
                    height: a.float64(),
                    color: a.string(),
                }),
            },
            {
                description: 'Shape node',
            },
        ),
    }),
);

export default defineRpc({
    input: RecursiveUnion,
    output: RecursiveUnion,
    async handler({ input }) {
        return input;
    },
});
