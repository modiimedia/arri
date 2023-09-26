import { ArriRouter } from "arri";

const router = new ArriRouter();

router.rpc({
    name: "users.SayHello",
    params: undefined,
    response: undefined,
    handler({ params }) {},
});

router.route({
    path: "/users/hello",
    method: ["get", "post"],
    handler(event) {
        return `
        <div>
            <h1>Hello world!!!</h1>
        </div>
        `;
    },
});

router.route({
    path: "/images/upload",
    method: "post",
    async handler(event) {},
});

export default router;
