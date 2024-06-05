import { EventSourcePlusOptions } from "event-source-plus";

export async function getHeaders(
    input: EventSourcePlusOptions["headers"],
): Promise<Record<string, string> | undefined> {
    if (typeof input === "function") {
        const result = input();
        if ("then" in result && typeof result.then === "function") {
            return result.then((data) => data);
        }
        return result;
    }
    return input;
}
