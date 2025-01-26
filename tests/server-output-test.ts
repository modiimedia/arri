import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { consola } from 'consola';

const getOutput = () =>
    fs.readFileSync(path.resolve(__dirname, './clients/ts/testClient.g.ts'));

async function main() {
    execSync(`nx build-server test-server-ts`, { stdio: 'inherit' });
    const tsServerOutput = getOutput();
    execSync(`nx build-server test-server-go`, { stdio: 'inherit' });
    const goServerOutput = getOutput();
    if (!deepEquals(tsServerOutput, goServerOutput)) {
        throw new Error(
            "Client generated from Go server doesn't match TS server",
        );
    }
    consola.success('Generated clients match');
}

main();

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
