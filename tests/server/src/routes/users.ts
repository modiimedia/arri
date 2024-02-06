import { ArriRouter } from "arri";
import { a } from "arri-validate";
import { Author, getRandomAuthor } from "../models";

const router = new ArriRouter();

router.route({
    path: "/routes/hello-world",
    method: ["get", "post"],
    handler(_) {
        return `hello world`;
    },
});

const UpdateUserData = a.partial(a.omit(Author, ["id"]));
type UpdateUserData = a.infer<typeof UpdateUserData>;

router.route({
    path: "/routes/authors/:authorId",
    method: "post",
    body: UpdateUserData,
    async handler(event) {
        const body = event.context.body;
        return getRandomAuthor({
            id: event.context.params.authorId,
            name: body.name,
            bio: body.bio,
            createdAt: body.createdAt,
            updatedAt: body.updatedAt,
        });
    },
});

export default router;
