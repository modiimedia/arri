import { defineRpc } from "arri";
import { a } from "arri-validate";
import { Post, PostType, getRandomPost } from "../../models";

export default defineRpc({
    method: "get",
    params: a.object(
        {
            limit: a.int8(),
            type: a.optional(PostType),
        },
        {
            id: "PostListParams",
        },
    ),
    response: a.object(
        {
            total: a.int32(),
            items: a.array(Post),
        },
        {
            id: "PostListResponse",
        },
    ),
    handler({ params }) {
        const items: Post[] = [];
        for (let i = 0; i < params.limit; i++) {
            items.push(getRandomPost({ type: params.type }));
        }
        return {
            total: items.length,
            items,
        };
    },
});
