import { defineRpc } from "arri";
import { a } from "arri-validate";
import { Post, getRandomPost } from "../../models";

export default defineRpc({
    method: "get",
    params: a.object(
        {
            postId: a.string(),
        },
        {
            id: "PostParams",
        },
    ),
    response: Post,
    handler({ params }) {
        return getRandomPost({ id: params.postId });
    },
});
