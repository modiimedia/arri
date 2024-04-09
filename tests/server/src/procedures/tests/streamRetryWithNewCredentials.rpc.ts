import { defineError, defineEventStreamRpc, getHeader } from "arri";
import { a } from "arri-validate";

const usedTokens: Record<string, boolean> = {};

export default defineEventStreamRpc({
    params: undefined,
    response: a.object({
        message: a.string(),
    }),
    async handler({ stream }, event) {
        const authToken = getHeader(event, "x-auth-token");
        console.log("NEW_REQUEST", authToken);
        if (!authToken) {
            throw defineError(400);
        }
        if (usedTokens[authToken]) {
            throw defineError(403, {
                message: "Token has expired",
            });
        }
        usedTokens[authToken] = true;
        console.log(usedTokens);
        stream.send();
        await stream.push({ message: "ok" });
        const interval = setInterval(async () => {
            await stream.push({ message: "ok" });
        });
        stream.onClose(() => {
            clearInterval(interval);
        });
    },
});
