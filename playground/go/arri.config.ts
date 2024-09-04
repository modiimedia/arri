import { ChildProcess, execSync, spawn } from "node:child_process";

import { defineConfig, defineServerConfig } from "arri";
import chokidar from "chokidar";

const goServer = defineServerConfig({
    devFn(_, __) {
        const watcher = chokidar.watch(["**/*.go"], { ignoreInitial: true });
        let childProcess: ChildProcess | undefined;
        function spawnProcess() {
            execSync("go build -o .output/server", {
                stdio: "inherit",
            });
            childProcess = spawn(".output/server", {
                stdio: "inherit",
            });
        }
        async function closeChildProcess() {
            if (!childProcess) return true;
            return new Promise((res, rej) => {
                childProcess?.on("close", () => res(true));
                childProcess?.on("exit", () => res(true));
                childProcess?.on("error", (err) => {
                    rej(err);
                });
                childProcess?.kill("SIGTERM");
            });
        }
        spawnProcess();
        watcher.on("all", async (evt) => {
            console.info(`[arri] changed detected restarting server`);
            switch (evt) {
                case "addDir":
                    return;
                default: {
                    await closeChildProcess();
                    spawnProcess();
                }
            }
        });
    },
    buildFn(_, __) {
        execSync(`go build`, {
            stdio: "inherit",
        });
    },
});

export default defineConfig({
    server: goServer,
    generators: [],
});
