import { defineRpc } from "arri";
import { a } from "arri-validate";
import { Post, getRandomPost } from "../../models";

const UpdatePostData = a.partial(
    a.pick(Post, ["title", "description", "tags", "content"]),
);

export default defineRpc({
    params: a.object({
        postId: a.string(),
        data: UpdatePostData,
    }),
    response: Post,
    handler({ params }) {
        return getRandomPost({
            id: params.postId,
            title: params.data.title,
            description: params.data.description,
            tags: params.data.tags,
            content: params.data.content,
        });
    },
});
