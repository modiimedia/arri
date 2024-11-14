import { ChildProcess, execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import chokidar from "chokidar";

import { logger } from "../common";
import { defineServerConfig } from "./_config";

export interface GoServerOptions {
    outputDir?: string;
    cwd?: string;
}

export function goServer(options: GoServerOptions = {}) {
    const outDir = options.outputDir ?? ".output";
    const resolvedOutDir = options.cwd
        ? path.resolve(options.cwd, outDir)
        : outDir;
    return defineServerConfig({
        devFn: async (_, generators) => {
            if (!fs.existsSync(resolvedOutDir)) {
                fs.mkdirSync(resolvedOutDir);
            }
            const ignoredDirs = ["node_modules", ".arri", ".output"];
            const watcher = chokidar.watch(".", {
                ignoreInitial: true,
                ignored: (path, stats) => {
                    if (stats?.isFile() == true && !path.endsWith(".go")) {
                        return true;
                    }
                    if (stats?.isDirectory()) {
                        for (const dir of ignoredDirs) {
                            if (path.includes(dir)) {
                                return true;
                            }
                        }
                    }
                    return false;
                },
                cwd: options.cwd,
            });
            let childProcess: ChildProcess | undefined;
            async function spawnProcess() {
                try {
                    execSync(`go build -o ${outDir}/server`, {
                        stdio: "inherit",
                        cwd: options.cwd,
                    });
                    childProcess = spawn(
                        `${outDir}/server`,
                        [`--def-out=${outDir}/__definition.json`],
                        {
                            stdio: "inherit",
                            cwd: options.cwd,
                        },
                    );
                    childProcess.on("error", (_) => {
                        childProcess?.kill("SIGTERM");
                        childProcess?.removeAllListeners();
                        childProcess = undefined;
                    });
                    childProcess.on("close", (_) => {
                        childProcess?.removeAllListeners();
                        childProcess = undefined;
                    });
                } catch (err) {
                    logger.error(err);
                }
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
                        childProcess?.removeAllListeners();
                        childProcess = undefined;
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
                let defFile = "";
                try {
                    defFile = fs.readFileSync(
                        `${resolvedOutDir}/__definition.json`,
                        "utf8",
                    );
                } catch (_) {
                    return;
                }
                if (!defFile || defFile == defFileCache) {
                    return;
                }
                const startTime = new Date();
                if (hasRunGenerators) {
                    logger.info(
                        "App definition updated. Rerunning generators...",
                    );
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
            const appDefWatcher = chokidar.watch(
                [`${outDir}/__definition.json`],
                {
                    cwd: options.cwd,
                },
            );
            appDefWatcher.on("add", () => handleAppDef());
            appDefWatcher.on("change", () => handleAppDef());
        },
        buildFn: async (_, generators) => {
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir);
            }
            execSync(`go build -o ${outDir}/server`, {
                stdio: "inherit",
            });
            execSync(
                `${outDir}/server def -output ${outDir}/__definition.json`,
                {
                    stdio: "inherit",
                },
            );
            if (generators.length === 0) {
                logger.warn(
                    "No generators specified in arri config. Skipping codegen.",
                );
                return;
            }
            const startTime = new Date();
            logger.info(`Running generators...`);
            const appDef = JSON.parse(
                fs.readFileSync(`${resolvedOutDir}/__definition.json`, "utf8"),
            );
            await Promise.all(
                generators.map((gen) => gen.generator(appDef, false)),
            );
            logger.success(
                `Ran ${generators.length} generator(s) in ${new Date().getTime() - startTime.getTime()}ms`,
            );
        },
    });
}
