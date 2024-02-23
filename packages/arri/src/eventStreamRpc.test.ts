import { a } from "arri-validate";
import {
    type EventStreamConnection,
    defineEventStreamRpc,
    isEventStreamRpc,
} from "./eventStreamRpc";

test("type inference", () => {
    const ParamsSchema = a.object({
        id: a.string(),
    });
    type ParamsSchema = a.infer<typeof ParamsSchema>;
    const ResponseSchema = a.object({
        id: a.string(),
        count: a.uint64(),
    });
    type ResponseSchema = a.infer<typeof ResponseSchema>;

    defineEventStreamRpc({
        params: ParamsSchema,
        response: ResponseSchema,
        handler({ params, stream }) {
            assertType<ParamsSchema>(params);
            assertType<EventStreamConnection<a.infer<typeof ResponseSchema>>>(
                stream,
            );
        },
    });
});

test("isEventStreamRpc()", () => {
    const rpc = defineEventStreamRpc({
        params: undefined,
        response: undefined,
        handler() {},
    });
    expect(isEventStreamRpc(rpc)).toBe(true);
});
