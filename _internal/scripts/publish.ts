import { exec } from "child_process";
import util from "util";
import { defineCommand, runMain } from "citty";

const execPromise = util.promisify(exec);

const publishConfig: Record<string, { allowPublish: boolean; otp: boolean }> = {
    arri: {
        allowPublish: true,
        otp: true,
    },
    "@arrirpc/adapter-typebox": {
        allowPublish: true,
        otp: true,
    },
    "@arrirpc/client": {
        allowPublish: true,
        otp: true,
    },
    "@arrirpc/client-dart": {
        allowPublish: true,
        otp: false,
    },
    "arri-codegen-dart": {
        allowPublish: true,
        otp: true,
    },
    "arri-codegen-kotlin": {
        allowPublish: false,
        otp: true,
    },
    "arri-codegen-ts": {
        allowPublish: true,
        otp: true,
    },
    "@arrirpc/codegen-utils": {
        allowPublish: true,
        otp: true,
    },
    "@arrirpc/schema": {
        allowPublish: true,
        otp: true,
    },
};

const main = defineCommand({
    args: {
        otp: {
            type: "string",
            required: true,
        },
    },
    async run({ args }) {
        const handleResult = (result: { stdout: string; stderr: string }) => {
            if (result.stderr) {
                console.log(result.stderr);
            }
            if (result.stdout) {
                console.log(result.stdout);
            }
        };
        const tasks = Object.keys(publishConfig).map(async (key) => {
            const config = publishConfig[key]!;
            if (!config.allowPublish) {
                return;
            }
            if (config.otp) {
                const result = await execPromise(
                    `nx publish ${key} --otp ${args.otp}`,
                );
                handleResult(result);
                return;
            }
            const result = await execPromise(`nx publish ${key}`);
            handleResult(result);
        });
        const results = await Promise.allSettled(tasks);
        for (const result of results) {
            if (result.status === "rejected") {
                console.error(result.reason);
            }
        }
    },
});

void runMain(main);
