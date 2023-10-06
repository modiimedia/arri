import { ArriRouter, readBody } from "arri";
import { a } from "arri-validate";
import { Author, getRandomAuthor } from "../models";

const router = new ArriRouter();

router.route({
    path: "/routes/hello-world",
    method: ["get", "post"],
    handler(event) {
        return `hello world`;
    },
});

router.route({
    path: "/routes/authors/:authorId",
    method: "get",
    async handler(event) {
        return getRandomAuthor({
            id: event.context.params.authorId,
            name: "John Doe",
        });
    },
});

const UpdateUserData = a.partial(a.omit(Author, ["id"]));
type UpdateUserData = a.infer<typeof UpdateUserData>;

router.route({
    path: "/routes/authors/:authorId",
    method: "post",
    async handler(event) {
        const body = await readBody(event);
        const parsedBody = a.parse(UpdateUserData, body);
        return getRandomAuthor({
            id: event.context.params.authorId,
            name: parsedBody.name,
            bio: parsedBody.bio,
            createdAt: parsedBody.createdAt,
            updatedAt: parsedBody.updatedAt,
        });
    },
});

export default router;
