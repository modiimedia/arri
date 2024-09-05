import { ChildProcess, execSync, spawn } from "node:child_process";
import fs from "node:fs";

import { defineConfig, defineServerConfig } from "arri";
import chokidar from "chokidar";
import { createConsola } from "consola";

const logger = createConsola().withTag("arri");

const goServer = defineServerConfig({
    devFn(_, generators) {
        if (!fs.existsSync(".output")) {
            fs.mkdirSync(".output");
        }
        const watcher = chokidar.watch(["**/*.go"], { ignoreInitial: true });
        let childProcess: ChildProcess | undefined;
        async function spawnProcess() {
            execSync("go build -o .output/server", {
                stdio: "inherit",
            });
            childProcess = spawn(
                ".output/server",
                ["--def-out=.output/__definition.json"],
                {
                    stdio: "inherit",
                },
            );
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
            logger.info(`Changed detected. Restarting server...`);
            switch (evt) {
                case "addDir":
                    return;
                default: {
                    await closeChildProcess();
                    spawnProcess();
                }
            }
        });
        if (generators.length == 0) {
            logger.warn(
                "No generators specified in arri config. Skipping codegen.",
            );
            return;
        }
        let defFileCache = "";
        let hasRunGenerators = false;
        async function handleAppDef() {
            const defFile = fs.readFileSync(
                ".output/__definition.json",
                "utf8",
            );
            if (defFile == defFileCache) {
                return;
            }
            const startTime = new Date();
            if (hasRunGenerators) {
                logger.info("App definition updated. Rerunning generators...");
            } else {
                logger.info("Running generators...");
            }
            defFileCache = defFile;
            const appDef = JSON.parse(defFile);
            await Promise.allSettled(
                generators.map((gen) => gen.generator(appDef, true)),
            );
            logger.success(
                `Ran ${generators.length} generator(s) in ${new Date().getTime() - startTime.getTime()}ms`,
            );
            hasRunGenerators = true;
        }
        const appDefWatcher = chokidar.watch([".output/__definition.json"]);
        appDefWatcher.on("change", () => {
            handleAppDef();
        });
    },
    async buildFn(_, generators) {
        if (!fs.existsSync(".output")) {
            fs.mkdirSync(".output");
        }
        execSync(`go build -o .output/server`, {
            stdio: "inherit",
        });
        execSync(`.output/server def -output .output/__definition.json`, {
            stdio: "inherit",
        });
        if (generators.length === 0) {
            logger.warn(
                "No generators specified in arri config. Skipping codegen.",
            );
            return;
        }
        const startTime = new Date();
        logger.info(`Running generators...`);
        const appDef = JSON.parse(
            fs.readFileSync(".output/__definition.json", "utf8"),
        );
        await Promise.all(
            generators.map((gen) => gen.generator(appDef, false)),
        );
        logger.success(
            `Ran ${generators.length} generator(s) in ${new Date().getTime() - startTime.getTime()}ms`,
        );
    },
});

export default defineConfig({
    server: goServer,
    generators: [],
});
