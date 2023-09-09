import { exec } from "child_process";
import util from "util";
import { defineCommand, runMain } from "citty";

const execPromise = util.promisify(exec);

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
        const results = await Promise.allSettled([
            execPromise(`nx publish arri --otp ${args.otp}`).then(handleResult),
            execPromise(
                `nx publish arri-adapter-typebox --otp ${args.otp}`,
            ).then(handleResult),
            execPromise(`nx publish arri-client --otp ${args.otp}`).then(
                handleResult,
            ),
            execPromise(`nx publish arri-client-dart`).then(handleResult),
            execPromise(`nx publish arri-codegen-utils --otp ${args.otp}`).then(
                handleResult,
            ),
            execPromise(`nx publish arri-validate --otp ${args.otp}`).then(
                handleResult,
            ),
            execPromise(`nx publish json-schema-to-jtd --otp ${args.otp}`).then(
                handleResult,
            ),
        ]);
        for (const result of results) {
            if (result.status === "rejected") {
                console.error(result.reason);
            }
        }
    },
});

void runMain(main);
