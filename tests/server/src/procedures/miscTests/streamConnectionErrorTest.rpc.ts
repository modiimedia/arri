import { defineError, defineEventStreamRpc } from "arri";
import { a } from "arri-validate";

export default defineEventStreamRpc({
    params: a.object(
        {
            statusCode: a.uint16(),
            statusMessage: a.string(),
        },
        {
            id: "StreamConnectionErrorTestParams",
        },
    ),
    response: a.object(
        {
            message: a.string(),
        },
        {
            id: "StreamConnectionErrorTestResponse",
        },
    ),
    async handler({ params }) {
        throw defineError(params.statusCode, {
            statusMessage: params.statusMessage,
        });
    },
});
