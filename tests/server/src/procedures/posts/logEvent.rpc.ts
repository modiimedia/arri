import { defineRpc } from "arri";
import { a } from "arri-validate";
import { Post } from "../../models";

const PostEvent = a.discriminator(
    "eventType",
    {
        POST_CREATED: a.object({
            postId: a.string(),
            timestamp: a.timestamp(),
        }),
        POST_DELETED: a.object({
            postId: a.string(),
            timestamp: a.timestamp(),
        }),
        POST_UPDATED: a.object({
            postId: a.string(),
            timestamp: a.timestamp(),
            data: a.partial(Post),
        }),
        POST_LIKED: a.object({
            postId: a.string(),
            timestamp: a.timestamp(),
            postLikeId: a.string(),
            postLikeCount: a.uint32(),
        }),
        POST_COMMENTED: a.object({
            postId: a.string(),
            timestamp: a.timestamp(),
            commentId: a.string(),
            commentText: a.string(),
            commentCount: a.uint32(),
        }),
    },
    {
        id: "PostEvent",
    },
);

export default defineRpc({
    params: PostEvent,
    response: a.object(
        {
            success: a.boolean(),
            message: a.string(),
        },
        {
            id: "LogPostEventResponse",
        },
    ),
    handler() {
        return {
            success: true,
            message: "Event logged",
        };
    },
});
