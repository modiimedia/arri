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
        await Promise.all([
            execPromise(`nx publish arri --otp ${args.otp}`).then((result) => {
                if (result.stderr) {
                    console.log(result.stderr);
                }
                if (result.stdout) {
                    console.log(result.stdout);
                }
            }),
            execPromise(`nx publish arri-client --otp ${args.otp}`).then(
                (result) => {
                    if (result.stderr) {
                        console.log(result.stderr);
                    }
                    if (result.stdout) {
                        console.log(result.stdout);
                    }
                },
            ),
            execPromise(`nx publish arri-client-dart`).then((result) => {
                if (result.stderr) {
                    console.log(result.stderr);
                }
                if (result.stdout) {
                    console.log(result.stdout);
                }
            }),
        ]);
    },
});

void runMain(main);
