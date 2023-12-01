import { a } from "packages/arri-validate/dist";
import {
    type EventStreamConnection,
    defineEventStreamRpc,
    isEventStreamRpc,
    type Sse,
    formatSse,
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
        handler({ params, connection }) {
            assertType<ParamsSchema>(params);
            assertType<EventStreamConnection<a.infer<typeof ResponseSchema>>>(
                connection,
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

test("formatSseEvent()", () => {
    const event: Sse = {
        data: "hello world",
    };
    const event2: Sse = {
        id: "1",
        event: "message",
        data: "hello world",
    };
    expect(formatSse(event)).toBe(`data: hello world\n\n`);
    expect(formatSse(event2)).toBe(
        `id: 1\nevent: message\ndata: hello world\n\n`,
    );
});
