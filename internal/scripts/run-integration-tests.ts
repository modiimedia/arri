import { a } from "../../languages/ts/ts-schema/dist";
import { execSync } from "child_process";
import { defineCommand, runMain } from "citty";
import enquirer from "enquirer";

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
        let cmd = "pnpm integration-tests-";
        switch (parsedArgs.server) {
            case "go":
                cmd += "go";
                break;
            case "ts":
                cmd += "ts";
                break;
            case undefined:
                throw new Error(`Must specify type of server`);
            default:
                parsedArgs.server satisfies never;
                throw new Error(`Unsupported server type ${parsedArgs.server}`);
        }
        if (parsedArgs.affected) {
            cmd += ":affected";
        }
        execSync(cmd, { stdio: "inherit" });
    },
});

void runMain(run);
