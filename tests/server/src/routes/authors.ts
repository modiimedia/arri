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

const UpdateAuthorData = a.partial(a.omit(Author, ["id"]), {
    id: "UpdateAuthorData",
});
type UpdateAuthorData = a.infer<typeof UpdateAuthorData>;

router.route({
    path: "/routes/authors/:authorId",
    method: "post",
    body: UpdateAuthorData,
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

router.rpc({
    name: "authors.updateAuthor",
    params: a.object({
        authorId: a.string(),
        data: UpdateAuthorData,
    }),
    response: Author,
    async handler({ params }) {
        return getRandomAuthor({
            id: params.authorId,
            name: params.data.name,
            bio: params.data.bio,
            createdAt: params.data.createdAt,
            updatedAt: params.data.updatedAt,
        });
    },
});

export default router;
