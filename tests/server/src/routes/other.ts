import { ArriRouter } from "arri";
import { a } from "arri-validate";

const router = new ArriRouter();

const DefaultPayload = a.object(
    {
        message: a.string(),
    },
    {
        id: "DefaultPayload",
    },
);

router.route({
    path: "/routes/hello-world",
    method: ["get", "post"],
    handler(_) {
        return `hello world`;
    },
});

router.rpc({
    method: "get",
    name: "tests.emptyParamsGetRequest",
    params: undefined,
    response: DefaultPayload,
    handler() {
        return {
            message: "ok",
        };
    },
});

router.rpc({
    name: "tests.emptyParamsPostRequest",
    params: undefined,
    response: DefaultPayload,
    handler() {
        return {
            message: "ok",
        };
    },
});

router.rpc({
    method: "get",
    name: "tests.emptyResponseGetRequest",
    params: DefaultPayload,
    response: undefined,
    handler() {},
});

router.rpc({
    name: "tests.emptyResponsePostRequest",
    params: DefaultPayload,
    response: undefined,
    handler() {},
});

export default router;
