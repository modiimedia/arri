import { a } from "../../../../../../languages/ts/ts-schema/dist";
import { defineRpc } from "@arrirpc/server";

interface RecursiveObject {
    left: RecursiveObject | null;
    right: RecursiveObject | null;
    value: string;
}

const RecursiveObject = a.recursive<RecursiveObject>(
    "RecursiveObject",
    (self) =>
        a.object({
            left: a.nullable(self),
            right: a.nullable(self),
            value: a.string(),
        }),
);

export default defineRpc({
    params: RecursiveObject,
    response: RecursiveObject,
    async handler({ params }) {
        return params;
    },
});
