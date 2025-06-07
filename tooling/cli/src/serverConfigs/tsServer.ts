import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import os from 'node:os';

import { Generator, isAppDefinition } from '@arrirpc/codegen-utils';
import {
    AppDefinition,
    camelCase,
    kebabCase,
    removeDisallowedChars,
} from '@arrirpc/codegen-utils';
import { listen, Listener } from '@joshmossas/listhen';
import { FSWatcher } from 'chokidar';
import esbuild from 'esbuild';
import { replace } from 'esbuild-plugin-replace';
import { type globby } from 'globby';
import {
    App,
    dynamicEventHandler,
    fromNodeMiddleware,
    toNodeListener,
} from 'h3';
import path from 'pathe';
import prettier from 'prettier';

import { isInsideDir, logger } from '../common';
import { defineServerConfig } from './_config';

export function tsServer(serverConfig?: TsServerConfig) {
    return defineServerConfig({
        devArgs: undefined,
        async devFn(_, generators) {
            const resolvedConfig: Required<TsServerConfig> = {
                port: serverConfig?.port ?? defaultTsServerConfig.port,
                entry: serverConfig?.entry ?? defaultTsServerConfig.entry,
                serverEntry:
                    serverConfig?.serverEntry ??
                    defaultTsServerConfig.serverEntry,
                rootDir: serverConfig?.rootDir ?? defaultTsServerConfig.rootDir,
                srcDir: serverConfig?.srcDir ?? defaultTsServerConfig.srcDir,
                procedureDir:
                    serverConfig?.procedureDir ??
                    defaultTsServerConfig.procedureDir,
                procedureGlobPatterns:
                    serverConfig?.procedureGlobPatterns ??
                    defaultTsServerConfig.procedureGlobPatterns,
                buildDir:
                    serverConfig?.buildDir ?? defaultTsServerConfig.buildDir,
                esbuild: serverConfig?.esbuild ?? defaultTsServerConfig.esbuild,
                https: serverConfig?.https ?? defaultTsServerConfig.https,
                http2: serverConfig?.http2 ?? defaultTsServerConfig.http2,
                devServer:
                    serverConfig?.devServer ?? defaultTsServerConfig.devServer,
            };
            await startDevServer(resolvedConfig, generators);
        },
        buildArgs: undefined,
        async buildFn(args, generators) {
            const resolvedConfig: Required<TsServerConfig> = {
                port: serverConfig?.port ?? 3000,
                entry: serverConfig?.entry ?? 'app.ts',
                serverEntry:
                    serverConfig?.serverEntry ??
                    defaultTsServerConfig.serverEntry,
                rootDir: serverConfig?.rootDir ?? defaultTsServerConfig.rootDir,
                srcDir: serverConfig?.srcDir ?? defaultTsServerConfig.srcDir,
                procedureDir:
                    serverConfig?.procedureDir ??
                    defaultTsServerConfig.procedureDir,
                procedureGlobPatterns:
                    serverConfig?.procedureGlobPatterns ??
                    defaultTsServerConfig.procedureGlobPatterns,
                buildDir:
                    serverConfig?.buildDir ?? defaultTsServerConfig.buildDir,
                esbuild: serverConfig?.esbuild ?? defaultTsServerConfig.esbuild,
                https: serverConfig?.https ?? defaultTsServerConfig.https,
                http2: serverConfig?.http2 ?? defaultTsServerConfig.http2,
                devServer:
                    serverConfig?.devServer ?? defaultTsServerConfig.devServer,
            };
            const appEntry = path.resolve(
                resolvedConfig.rootDir,
                resolvedConfig.srcDir,
                resolvedConfig.entry,
            );
            if (!existsSync(appEntry)) {
                throw new Error(`Unable to find entry at ${appEntry}`);
            }
            await startBuild(generators, resolvedConfig, args.skipCodegen);
        },
    });
}

export interface TsServerConfig {
    port?: number;
    entry?: string;
    serverEntry?: string;
    rootDir?: string;
    srcDir?: string;
    procedureDir?: string | false;
    /**
     * this defaults to ["***\/*\*.rpc.ts"]
     */
    procedureGlobPatterns?: string[];
    buildDir?: string;
    esbuild?: Omit<
        esbuild.BuildOptions,
        | 'bundle'
        | 'format'
        | 'outfile'
        | 'outdir'
        | 'entryNames'
        | 'entryPoints'
        | 'packages'
    >;
    https?:
        | {
              cert: string;
              key: string;
              passphrase?: string;
          }
        | boolean;
    http2?: boolean;
    devServer?: {
        /**
         * Use this to add directories outside of the srcDir that should trigger a dev server reload
         */
        additionalWatchDirs?: string[];
        /**
         * If you want to serve both https and http on the dev server
         */
        httpWithHttps?: boolean;
        httpWithHttpsPort?: number;
    };
}

const defaultTsServerConfig: Required<TsServerConfig> = {
    port: 3000,
    entry: 'app.ts',
    serverEntry: '',
    rootDir: '.',
    srcDir: 'src',
    procedureDir: 'procedures',
    procedureGlobPatterns: ['**/*.rpc.ts'],
    buildDir: '.arri',
    esbuild: {},
    https: false,
    http2: false,
    devServer: {
        additionalWatchDirs: undefined,
        httpWithHttps: undefined,
        httpWithHttpsPort: undefined,
    },
};

/////// PRODUCTION BUILD //////////

export async function startBuild(
    generators: Generator<any>[],
    serverConfig: Required<TsServerConfig>,
    skipCodeGen = false,
) {
    logger.log('Bundling server....');
    const appEntry = path.resolve(
        serverConfig.rootDir,
        serverConfig.srcDir,
        serverConfig.entry,
    );
    if (
        !existsSync(
            path.resolve(
                serverConfig.rootDir,
                serverConfig.srcDir,
                serverConfig.entry,
            ),
        )
    ) {
        logger.error(`Unable to find entry at ${appEntry}`);
        process.exit(1);
    }
    await setupWorkingDir(serverConfig);
    await Promise.all([
        createAppWithRoutesModule(serverConfig),
        createServerEntryFile(serverConfig),
        createCodegenEntryFile(serverConfig),
    ]);
    await bundleAppEntry(serverConfig);
    logger.log('Finished bundling');
    const clientCount = generators.length ?? 0;
    const codegenModule = path.resolve(
        serverConfig.rootDir,
        '.output',
        OUT_CODEGEN,
    );
    if (!skipCodeGen) {
        logger.log('Generating Arri app definition (__definition.json)');
        execSync(`node ${codegenModule}`, { env: process.env });
        const defJson = path.resolve(
            serverConfig.rootDir,
            '.output',
            '__definition.json',
        );
        const def = JSON.parse(readFileSync(defJson, { encoding: 'utf-8' }));
        if (isAppDefinition(def) && clientCount > 0) {
            const startTime = new Date().getTime();
            logger.log(`Generating ${clientCount} client(s)...`);
            await Promise.all(
                generators.map((generator) => generator.run(def, false)) ?? [],
            );
            logger.log(
                `${clientCount} client(s) generated in ${new Date().getTime() - startTime}ms`,
            );
        } else {
            logger.warn(
                'No client generators specified. Skipping client codegen.',
            );
        }
    } else {
        logger.log('Skipping codegen');
    }
    logger.log('Cleaning up files');
    await fs.rm(codegenModule);
    logger.success(
        `Build finished! You can start your server by running "node .output/${OUT_SERVER_ENTRY}"`,
    );
}

async function bundleAppEntry(
    config: Required<TsServerConfig>,
    _allowCodegen = true,
) {
    const appEntry = path.resolve(
        config.rootDir,
        config.buildDir,
        GEN_APP_FILE,
    );
    await esbuild.build({
        ...config.esbuild,
        entryPoints: [appEntry],
        platform: config.esbuild.platform ?? 'node',
        target: config.esbuild.target ?? 'node22',
        bundle: true,
        packages: 'external',
        format: 'esm',
        sourcemap: config.esbuild.sourcemap ?? true,
        minify: config.esbuild.minify ?? true,
        banner: {
            js: `import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);`,
        },
        allowOverwrite: true,
        outfile: path.resolve(config.rootDir, '.output', OUT_APP_FILE),
    });
}

async function createServerEntryFile(config: Required<TsServerConfig>) {
    if (config.serverEntry) {
        const buildEntry = path.resolve(
            config.rootDir,
            config.srcDir,
            config.serverEntry,
        );
        await esbuild.build({
            ...config.esbuild,
            entryPoints: [buildEntry],
            platform: config.esbuild.platform ?? 'node',
            target: config.esbuild.target ?? 'node20',
            bundle: false,
            packages: 'external',
            format: 'esm',
            sourcemap: true,
            minifyWhitespace: true,
            banner: {
                js: `import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);`,
            },
            plugins: [replace({ 'virtual:arri/app': './app.mjs' })],
            allowOverwrite: true,
            outfile: path.resolve(config.rootDir, '.output', OUT_SERVER_ENTRY),
        });
        return;
    }
    const appModule = path.resolve(config.rootDir, config.srcDir, config.entry);
    const appImportParts = path
        .relative(path.resolve(config.rootDir, config.srcDir), appModule)
        .split('.');
    appImportParts.pop();
    let httpsString = ``;
    if (config.https === true) {
        httpsString = `https: true,`;
    } else if (typeof config.https === 'object') {
        httpsString = `https: { cert: '${config.https.cert}', key: '${
            config.https.key
        }', passphrase: ${
            config.https.passphrase
                ? `'${config.https.passphrase}'`
                : 'undefined'
        }},`;
    }
    const virtualEntry = `import { toNodeListener } from '@arrirpc/server';
import { listen } from '@joshmossas/listhen';
import app from './${OUT_APP_FILE}';

void listen(toNodeListener(app.h3App), {
    port: process.env.PORT ?? ${config.port},
    public: true,
    ws: {
        resolve(info) {
            if (app.h3App.websocket?.resolve) {
                return app.h3App.websocket.resolve(info);
            }
            return app.h3App.websocket?.hooks ?? app.h3App.handler?.__websocket__ ?? {};
        }
    },
    http2: ${config.http2 ?? false},
    ${httpsString}
});`;
    await fs.writeFile(
        path.resolve(config.rootDir, '.output', OUT_SERVER_ENTRY),
        virtualEntry,
    );
}

async function createCodegenEntryFile(config: Required<TsServerConfig>) {
    const appModule = path.resolve(config.rootDir, config.srcDir, config.entry);
    const appImportParts = path
        .relative(path.resolve(config.rootDir, config.srcDir), appModule)
        .split('.');
    appImportParts.pop();
    const virtualModule = await prettier.format(
        `
    import { writeFileSync } from 'node:fs';
    import path from 'node:path';
    import app from './${OUT_APP_FILE}';

    const __dirname = new URL(".", import.meta.url).pathname;
    const def = app.getAppDefinition();
    writeFileSync(
        path.resolve(__dirname, "../.output", "__definition.json"),
        JSON.stringify(def),
    );
    process.exit(0);`,
        { tabWidth: 4, parser: 'typescript' },
    );
    await fs.writeFile(
        path.resolve(config.rootDir, '.output', OUT_CODEGEN),
        virtualModule,
    );
}

async function bundleFilesContext(config: Required<TsServerConfig>) {
    return await esbuild.context({
        ...config.esbuild,
        entryPoints: [
            path.resolve(config.rootDir, config.buildDir, GEN_APP_FILE),
        ],
        outfile: path.resolve(config.rootDir, '.output', OUT_APP_FILE),
        format: 'esm',
        bundle: true,
        packages: 'external',
        sourcemap: config.esbuild.sourcemap ?? true,
        target: config.esbuild.target ?? 'node20',
        platform: config.esbuild.platform ?? 'node',
    });
}

type ArriApp = {
    h3App: App;
    getAppDefinition(): AppDefinition;
};

///// DEV SERVER ////////

async function createDevServer(config: Required<TsServerConfig>) {
    const h3 = await import('h3');
    const app = h3.createApp();
    const dynamicHandler = dynamicEventHandler(
        () => '<div>initializing server...</div>',
    );
    app.use(dynamicHandler);
    let ws: App['websocket'] | undefined;
    const listener = await listen(toNodeListener(app), {
        port: config.port,
        https: config.https,
        http2: config.http2,
        public: true,
        ws: {
            resolve(info) {
                if (ws?.resolve) {
                    return ws.resolve(info);
                }
                return {};
            },
        },
    });
    let secondaryListener: Listener | undefined;
    if (config.devServer.httpWithHttps) {
        secondaryListener = await listen(toNodeListener(app), {
            port: config.devServer.httpWithHttpsPort ?? config.port + 1,
            https: false,
            http2: config.http2,
            public: true,
            ws: {
                resolve(info) {
                    if (ws?.resolve) {
                        return ws.resolve(info);
                    }
                    return {};
                },
            },
            qr: false,
            showURL: false,
        });
        logger.info(
            `Serving unencrypted traffic from port ${secondaryListener.address.port}`,
        );
    }
    async function reload(): Promise<AppDefinition> {
        let importPath = path.resolve(
            config.rootDir,
            '.output',
            `${OUT_APP_FILE}?version=${Date.now()}`,
        );
        // dumb windows things
        if (os.type() === 'Windows_NT') {
            importPath = createWindowsCompatibleAbsoluteImport(importPath);
        }
        const appEntry = (await import(importPath)).default as ArriApp;
        dynamicHandler.set(fromNodeMiddleware(appEntry.h3App.handler as any));
        ws = appEntry.h3App.websocket;
        return appEntry.getAppDefinition();
    }
    await reload();
    return {
        h3App: app,
        listener,
        secondaryListener,
        reload,
        ws,
    };
}

export function createWindowsCompatibleAbsoluteImport(input: string): string {
    let separator: '\\' | '/' | undefined;
    for (const char of input) {
        if (char === '\\') {
            separator = '\\';
            break;
        }
        if (char === '/') {
            separator = '/';
        }
    }
    const parts = input.split(separator ?? '/');
    if (parts[0]?.endsWith(':')) {
        parts.unshift('file:\\');
    }
    const newStr = parts.join('\\');
    return newStr;
}

export async function startDevServer(
    config: Required<TsServerConfig>,
    generators: Generator<any>[],
) {
    await setupWorkingDir(config);
    const watcher = await import('chokidar');
    let fileWatcher: FSWatcher | undefined;
    await createAppWithRoutesModule(config);
    const context = await bundleFilesContext(config);
    await context.rebuild();
    const devServer = await createDevServer(config);
    let appDef = await devServer.reload();
    let appDefStr = JSON.stringify(appDef);
    if (generators.length) {
        logger.info(`Running generators...`);
        await generateClientsFromDefinition(appDef, generators, true);
    } else {
        logger.warn(`No generators specified in config. Skipping codegen.`);
    }
    const cleanExit = async () => {
        process.exit();
    };
    process.on('exit', async () => {
        await Promise.allSettled([fileWatcher?.close(), context.dispose()]);
    });
    process.on('SIGINT', cleanExit);
    process.on('SIGTERM', cleanExit);
    async function load(_isRestart: boolean, _reason?: string) {
        if (fileWatcher) {
            await fileWatcher.close();
        }
        const srcDir = path.resolve(config.rootDir ?? '', config.srcDir);
        const dirsToWatch = [srcDir];
        if (config.esbuild.alias) {
            for (const key of Object.keys(config.esbuild.alias)) {
                const alias = config.esbuild.alias[key];
                if (alias) {
                    if (!isInsideDir(alias, srcDir)) {
                        dirsToWatch.push(alias);
                    }
                }
            }
        }
        if (config.devServer.additionalWatchDirs?.length) {
            for (const dir of config.devServer.additionalWatchDirs) {
                dirsToWatch.push(dir);
            }
        }
        const buildDir = path.resolve(config.rootDir, config.buildDir);
        const outDir = path.resolve(config.rootDir, '.output');
        fileWatcher = watcher.watch(dirsToWatch, {
            ignoreInitial: true,
            ignored: [
                buildDir,
                outDir,
                '**/.output',
                '**/dist/**',
                '**/node_modules/**',
                '**/.git/**',
            ],
        });
        fileWatcher.on('all', async (eventName, _path) => {
            if (eventName === 'addDir' || eventName === 'add') {
                return;
            }
            await createAppWithRoutesModule(config);
            try {
                const reloadStart = new Date().getTime();
                logger.log(
                    'Change detected. Bundling files and restarting server....',
                );
                await context.rebuild();
                const newAppDef = await devServer.reload();
                const newAppDefStr = JSON.stringify(newAppDef);
                logger.log(
                    `Server restarted in ${new Date().getTime() - reloadStart}ms`,
                );
                if (generators.length && newAppDefStr !== appDefStr) {
                    logger.info(
                        `App Definition updated. Regenerating clients...`,
                    );
                    await generateClientsFromDefinition(
                        newAppDef,
                        generators,
                        true,
                    );
                    appDef = newAppDef;
                    appDefStr = newAppDefStr;
                }
            } catch (err) {
                logger.error('ERROR', err);
            }
        });
    }
    await load(false);
}

export interface ArriServiceConfig {
    globPatterns: string[];
}

//// CLIENT GENERATION /////

export async function generateClientsFromDefinition(
    appDef: AppDefinition,
    generators: Generator<any>[],
    isDev: boolean,
) {
    const startTime = new Date().getTime();
    try {
        const clientCount = generators.length;
        const result = await Promise.allSettled(
            generators.map((generator) => generator.run(appDef, isDev)),
        );
        logger.success(
            `Generated ${clientCount} client${clientCount === 1 ? '' : 's'} in ${new Date().getTime() - startTime}ms`,
        );
        for (const item of result) {
            if (item.status === 'rejected') {
                console.error('ERROR', item.reason);
            }
        }
    } catch (err) {
        logger.error(err);
    }
}

////// SHARED UTILS ///////

export const GEN_APP_FILE = '__arri_app.ts';
export const GEN_SERVER_ENTRY_FILE = '__arri_server.ts';
export const OUT_APP_FILE = 'app.mjs';
export const OUT_SERVER_ENTRY = 'server.mjs';
export const OUT_CODEGEN = 'codegen.mjs';

export const VIRTUAL_MODULES = {
    APP: 'virtual:arri/app',
} as const;

export async function setupWorkingDir(config: Required<TsServerConfig>) {
    const arriDir = path.resolve(config.rootDir, config.buildDir);
    const outDir = path.resolve(config.rootDir, '.output');
    if (existsSync(arriDir)) {
        await fs.rm(arriDir, { recursive: true, force: true });
    }
    if (existsSync(outDir)) {
        await fs.rm(outDir, { recursive: true, force: true });
    }
    await fs.mkdir(arriDir);
    await fs.mkdir(outDir);
}

interface RpcRoute {
    name: string;
    importName: string;
    importPath: string;
}

export async function createAppWithRoutesModule(
    config: Required<TsServerConfig>,
) {
    const glob = await import('globby');
    const appModule = path.resolve(config.rootDir, config.srcDir, config.entry);
    const appImportParts = path
        .relative(path.resolve(config.rootDir, config.buildDir), appModule)
        .split('.');
    appImportParts.pop();
    const routes: RpcRoute[] = [];
    const existingRoutes: string[] = [];
    await Promise.all(
        config.procedureGlobPatterns.map(async (pattern) => {
            const results = await getFsRouteBatch(glob.globby, pattern, config);
            for (const result of results) {
                if (!existingRoutes.includes(result.name)) {
                    routes.push(result);
                    existingRoutes.push(result.name);
                }
            }
        }),
    );
    routes.sort((a, b) => (a.name < b.name ? -1 : 1));
    const module = await prettier.format(
        `import sourceMapSupport from 'source-map-support';
        sourceMapSupport.install();
        import app from '${appImportParts.join('.')}';
        ${routes
            .map(
                (route) =>
                    `import ${route.importName} from '${route.importPath}';`,
            )
            .join('\n')}

        ${routes.map((route) => `app.rpc('${route.name}', ${route.importName});`).join('\n')}

        export default app;`,
        { parser: 'typescript', tabWidth: 4 },
    );
    await fs.writeFile(
        path.resolve(config.rootDir, config.buildDir, GEN_APP_FILE),
        module,
    );
}

export async function getFsRouteBatch(
    glob: typeof globby,
    globPattern: string,
    config: Required<TsServerConfig>,
): Promise<RpcRoute[]> {
    if (!config.procedureDir) {
        return [];
    }
    const target =
        `${config.rootDir}/${config.srcDir}/${config.procedureDir}/${globPattern}`
            .split('//')
            .join('/')
            .split('//')
            .join('/');
    const files = await glob(target, {
        onlyFiles: true,
    });
    const routes: RpcRoute[] = [];
    for (const file of files) {
        const meta = getRpcMetaFromPath(config, file);
        if (meta) {
            const importParts = path
                .relative(path.resolve(config.rootDir, config.buildDir), file)
                .split('.');
            importParts.pop();
            routes.push({
                name: meta.id,
                importName: camelCase(meta.id.split('.').join('_')),
                importPath: `./${importParts.join('.')}`,
            });
        }
    }
    return routes;
}

const disallowedNameChars = '~`!@#$%^&*()-+=[]{}\\|:;"\'<>,./';

export const getRpcMetaFromPath = (
    config: Required<TsServerConfig>,
    filePath: string,
): { id: string; httpPath: string } | undefined => {
    if (!config.procedureDir) {
        return undefined;
    }
    const resolvedFilePath = filePath.split('./').join('/');
    const parts = resolvedFilePath.split('/');
    const reversedParts = [...parts].reverse();
    const nameParts: string[] = [];

    for (const part of reversedParts) {
        if (part === config.procedureDir) {
            break;
        }
        nameParts.push(part);
    }
    const fileName = nameParts.reverse().pop() ?? '';
    const serviceParts = nameParts
        .filter((part) => part.trim().length > 0)
        .map((part) => removeDisallowedChars(part, disallowedNameChars));
    const fileNameParts = fileName.split('.');
    if (!fileNameParts.length) {
        return undefined;
    }
    const rpcName = removeDisallowedChars(
        fileNameParts[0]!,
        disallowedNameChars,
    );
    const httpParts = [
        ...serviceParts.map((part) => kebabCase(part)),
        kebabCase(rpcName),
    ];
    return {
        id: [...serviceParts, rpcName].join('.'),
        httpPath: `/${httpParts.join('/')}`,
    };
};
