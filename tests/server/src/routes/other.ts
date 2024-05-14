import { ArriRouter } from "@arrirpc/server";
import { a } from "@arrirpc/schema";

const router = new ArriRouter();

const DefaultPayload = a.object("DefaultPayload", {
    message: a.string(),
});

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
