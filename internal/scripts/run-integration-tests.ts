import { ofetch, waitFor } from '@arrirpc/client';
import { ChildProcess, execSync, spawn } from 'child_process';
import { defineCommand, runMain } from 'citty';
import enquirer from 'enquirer';

import { a } from '../../languages/ts/ts-schema/src/_index';

const CliArgs = a.object({
    server: a.optional(a.enumerator(['ts', 'go'])),
    tsServerLib: a.optional(a.enumerator(['h3', 'express'])),
    transport: a.optional(a.enumerator(['http', 'ws'])),
    affected: a.optional(a.boolean()),
});
type CliArgs = a.infer<typeof CliArgs>;

const run = defineCommand({
    args: {
        server: {
            type: 'string',
            description:
                'which test server should integration tests be run against. [ts or go]',
        },
        tsServerLib: {
            type: 'string',
            description: 'Which TS server library to use. (h3 or express)',
            required: false,
        },
        affected: {
            type: 'boolean',
            description:
                'Only test clients that have been affected by the changes',
            default: false,
        },
        transport: {
            type: 'string',
            alias: 't',
        },
    },
    async run({ args }) {
        const parsedArgs = a.parseUnsafe(CliArgs, args);
        if (!parsedArgs.server) {
            const { type } = await enquirer.prompt<{ type: 'ts' | 'go' }>([
                {
                    name: 'type',
                    type: 'select',
                    message: 'What test server do you want to use?',
                    choices: ['ts', 'go'],
                },
            ]);
            parsedArgs.server = type;
        }
        if (!parsedArgs.transport) {
            const { transport } = await enquirer.prompt<{
                transport: 'http' | 'ws';
            }>([
                {
                    name: 'transport',
                    type: 'select',
                    message: 'What transport do you want to use?',
                    choices: ['http', 'ws'],
                },
            ]);
            parsedArgs.transport = transport;
        }
        let buildServerCommand: string;
        let startServerCommand: string;
        let startServerCommandArgs: string[];
        switch (parsedArgs.server) {
            case 'go':
                buildServerCommand = `pnpm nx build-server test-server-go`;
                startServerCommand = `pnpm`;
                startServerCommandArgs = ['nx', 'start', 'test-server-go'];
                break;
            case 'ts':
                buildServerCommand = `pnpm nx build-server test-server-ts`;
                startServerCommand = `pnpm`;
                startServerCommandArgs = ['nx', 'start', 'test-server-ts'];
                break;
            case undefined:
                throw new Error(`Must specify type of server`);
            default:
                parsedArgs.server satisfies never;
                throw new Error(`Unsupported server type ${parsedArgs.server}`);
        }
        let runTestsCommand: string;
        if (parsedArgs.affected) {
            runTestsCommand = `pnpm nx affected -t integration-test`;
        } else {
            runTestsCommand = `pnpm nx run-many -t integration-test`;
        }
        if (parsedArgs.server === 'go') {
            // swift client fails against go server for some reason
            runTestsCommand += ` --exclude test-client-swift`;
        }
        if (parsedArgs.server === 'ts') {
            // ts server sometime causes timeouts when running all the tests in parallel
            runTestsCommand += ` --parallel=false`;
        }
        switch (parsedArgs.transport) {
            case 'ws':
                runTestsCommand += ` --configuration=websockets`;
                break;
            case 'http':
            case undefined:
                break;
            default:
                parsedArgs.transport satisfies never;
                break;
        }
        execSync(buildServerCommand, { stdio: 'inherit' });
        const childProcess = await launchDevServer(
            startServerCommand,
            startServerCommandArgs,
            2020,
        );
        execSync(runTestsCommand, { stdio: 'inherit' });
        childProcess.emit('close', 0);
        process.exit(0);
    },
});

void runMain(run);

async function launchDevServer(
    cmd: string,
    args: string[],
    port: number,
): Promise<ChildProcess> {
    console.info(`starting dev server on port ${port}`);
    const url = `http://127.0.0.1:${port}`;
    const child = spawn(cmd, args);
    return new Promise<ChildProcess>((res, rej) => {
        let didConnect = false;
        const timeout = setTimeout(() => {
            if (didConnect) return;
            rej(`Timeout exceeded waiting for dev server`);
        }, 10000);
        waitForGetRequest(url)
            .then((result) => {
                didConnect = result;
                console.info(`dev server started at ${url}`);
                clearTimeout(timeout);
                res(child);
            })
            .catch((err) => rej(err));
    });
}

async function waitForGetRequest(url: string) {
    try {
        const result = await ofetch.raw(url);
        if (result.status >= 200 && result.status < 300) {
            return true;
        }
        await waitFor(100);
        return waitForGetRequest(url);
    } catch (_) {
        await waitFor(100);
        return waitForGetRequest(url);
    }
}
