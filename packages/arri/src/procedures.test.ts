import { a } from "arri-validate";
import { defineRpc } from "./procedures";
describe("Type Inference", () => {
    it("infers types properly", async () => {
        const Params = a.object({
            id: a.string(),
        });
        type Params = a.infer<typeof Params>;
        const Response = a.object({
            id: a.string(),
            count: a.int32(),
        });
        type Response = a.infer<typeof Params>;
        const rpc = defineRpc({
            params: Params,
            response: Response,
            handler({ params }) {
                assertType<Params>({ id: "" });
                return {
                    id: params.id,
                    count: 1245313,
                };
            },
        });
        const result = await rpc.handler(
            {
                params: { id: "12314" },
                rpcName: "",
            },
            {} as any,
        );
        assertType<Response>(result);
    });
});
