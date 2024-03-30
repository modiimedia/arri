import { defineRpc } from "arri";
import { a } from "arri-validate";

type RecursiveUnion =
    | { type: "CHILD"; data: RecursiveUnion }
    | {
          type: "CHILDREN";
          data: RecursiveUnion[];
      }
    | { type: "TEXT"; data: string }
    | { type: "SHAPE"; data: { width: number; height: number; color: string } };

const RecursiveUnion = a.recursive<RecursiveUnion>(
    (self) =>
        a.discriminator("type", {
            CHILD: a.object({
                data: self,
            }),
            CHILDREN: a.object({
                data: a.array(self),
            }),
            TEXT: a.object({
                data: a.string(),
            }),
            SHAPE: a.object({
                data: a.object({
                    width: a.float64(),
                    height: a.float64(),
                    color: a.string(),
                }),
            }),
        }),
    {
        id: "RecursiveUnion",
    },
);

export default defineRpc({
    params: RecursiveUnion,
    response: RecursiveUnion,
    async handler({ params }) {
        return params;
    },
});
