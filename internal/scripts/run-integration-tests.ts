import { a } from "@arrirpc/schema";
import { ChildProcess, execSync, spawn } from "child_process";
import { defineCommand, runMain } from "citty";
import enquirer from "enquirer";
import { ofetch } from "ofetch";

const CliArgs = a.object({
    server: a.optional(a.enumerator(["ts", "go"])),
    affected: a.optional(a.boolean()),
});
type CliArgs = a.infer<typeof CliArgs>;

const run = defineCommand({
    args: {
        server: {
            type: "string",
            description:
                "which test server should integration tests be run against. [ts or go]",
        },
        affected: {
            type: "boolean",
            description:
                "Only test clients that have been affected by the changes",
            default: false,
        },
    },
    async run({ args }) {
        const parsedArgs = a.parse(CliArgs, args);
        if (!parsedArgs.server) {
            const { type } = await enquirer.prompt<{ type: "ts" | "go" }>([
                {
                    name: "type",
                    type: "select",
                    message: "What test server do you want to use?",
                    choices: ["ts", "go"],
                },
            ]);
            parsedArgs.server = type;
        }
        let serverProcess: ChildProcess | undefined;
        const allowParallel = parsedArgs.server !== "ts";
        const cleanExit = async () => {
            process.exit(0);
        };
        process.on("SIGINT", cleanExit);
        process.on("SIGTERM", cleanExit);
        process.on("exit", () => {
            serverProcess?.kill("SIGTERM");
            integrationTestProcess?.kill("SIGTERM");
        });
        switch (parsedArgs.server) {
            case "go":
                execSync(`pnpm nx build-server test-server-go`, {
                    stdio: "inherit",
                });
                serverProcess = spawn("pnpm", [
                    "nx",
                    "start",
                    "test-server-go",
                ]);
                break;
            case "ts":
                execSync(`pnpm nx build-server test-server-ts`, {
                    stdio: "inherit",
                });
                serverProcess = spawn("pnpm", [
                    "nx",
                    "start",
                    "test-server-ts",
                ]);
                break;
            case undefined:
                break;
            default:
                parsedArgs.server satisfies never;
                throw new Error(`Unhandled case ${parsedArgs.server}`);
        }
        serverProcess?.on("error", () => {
            serverProcess?.kill("SIGTERM");
            serverProcess?.removeAllListeners();
        });
        serverProcess?.on("close", (_) => {
            serverProcess?.removeAllListeners();
        });
        console.log(`Waiting for server to start....`);
        await waitForEndpoint("http://127.0.0.1:2020/status");
        console.log(`Server started on port 2020`);
        let integrationTestProcess: ChildProcess;
        const parallelStr = allowParallel ? `` : ` --parallel=false`;
        if (parsedArgs.affected) {
            console.log(`Running tests on affected clients....`);
            execSync(`pnpm nx affected -t integration-test${parallelStr}`, {
                stdio: "inherit",
            });
        } else {
            console.log(`Running tests on all clients...`);
            execSync(`pnpm nx run-many -t integration-test${parallelStr}`, {
                stdio: "inherit",
            });
        }
        process.exit(0);
    },
});

void runMain(run);

async function waitForEndpoint(url: string, attemptNumber = 0) {
    if (attemptNumber >= 60)
        throw new Error("Endpoint took too long to response");
    const connected = await connectWithTimeout(url, 1000);
    if (!connected) return waitForEndpoint(url, attemptNumber + 1);
}

async function connectWithTimeout(
    url: string,
    timeout: number,
): Promise<boolean> {
    try {
        await ofetch(url, { timeout: timeout, method: "GET" });
        return true;
    } catch (_) {
        return new Promise((res, _) => {
            setTimeout(() => {
                res(false);
            }, 1000);
        });
    }
}
