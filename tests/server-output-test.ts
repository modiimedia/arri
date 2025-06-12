import { execSync } from 'node:child_process';
import fs from 'node:fs';

import { defineCommand, runMain } from 'citty';
import { consola } from 'consola';
import path from 'pathe';

const getOutput = () => ({
    ts: fs.readFileSync(
        path.resolve(__dirname, './clients/ts/testClient.g.ts'),
        'utf8',
    ),
    rustPrefixed: fs.readFileSync(
        path.resolve(__dirname, './clients/rust/src/test_client_prefixed.g.rs'),
        'utf8',
    ),
});

const main = defineCommand({
    args: {
        configuration: {
            type: 'string',
        },
    },
    run({ args }) {
        let tsCmd = `nx build-server test-server-ts`;
        if (args.configuration) {
            tsCmd += ` --configuration=${args.configuration}`;
        }
        execSync(tsCmd, { stdio: 'inherit' });
        const tsServerOutput = getOutput();

        let goCmd = `nx build-server test-server-go`;
        if (args.configuration) {
            goCmd += ` --configuration=${args.configuration}`;
        }
        execSync(goCmd, { stdio: 'inherit' });
        const goServerOutput = getOutput();

        if (!deepEquals(tsServerOutput.ts, goServerOutput.ts)) {
            throw new Error(
                "Client generated from Go server doesn't match TS server. TS Output.",
            );
        }
        if (
            !deepEquals(
                tsServerOutput.rustPrefixed,
                goServerOutput.rustPrefixed,
            )
        ) {
            throw new Error(
                "Client generated from Go server doesn't match TS server. Rust Output.",
            );
        }
        consola.success('Generated clients match');
    },
});

runMain(main);

function deepEquals(left: any, right: any): boolean {
    if (typeof left !== typeof right) return false;
    const t = typeof left;
    switch (t) {
        case 'bigint':
        case 'boolean':
        case 'function':
        case 'number':
        case 'string':
        case 'undefined':
        case 'symbol':
            return left === right;
        case 'object': {
            if (Array.isArray(left)) {
                for (let i = 0; i < left.length; i++) {
                    const arrayItemsEqual = deepEquals(
                        left[i],
                        (right as any)[i],
                    );
                    if (!arrayItemsEqual) {
                        return false;
                    }
                }
                return true;
            }
            if (left === null) {
                return left === right;
            }
            const keys = Object.keys(left);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]!;
                const leftVal = left[key];
                const rightVal = right[key];
                const objectValuesEqual = deepEquals(leftVal, rightVal);
                if (!objectValuesEqual) {
                    return false;
                }
            }
            return true;
        }
        default:
            t satisfies never;
            break;
    }
    return true;
}
