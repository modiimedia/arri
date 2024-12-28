import { execSync } from 'child_process';
import { consola } from 'consola';

import {
    $$ObjectWithEveryNullableType,
    $$ObjectWithEveryOptionalType,
    $$ObjectWithEveryType,
    ObjectWithEveryNullableType,
    ObjectWithEveryOptionalType,
    ObjectWithEveryType,
} from './testClient.rpc';

const now = new Date();

async function main() {
    const input1: ObjectWithEveryType = {
        any: { 'hello world': 'hello world' },
        boolean: false,
        string: '',
        timestamp: now,
        float32: 1.5,
        float64: 1.5,
        int8: 1,
        uint8: 1,
        int16: 10,
        uint16: 10,
        int32: 100,
        uint32: 100,
        int64: 1000n,
        uint64: 1000n,
        enumerator: 'A',
        array: [true, false, false],
        object: {
            boolean: false,
            timestamp: now,
            string: 'hello world',
        },
        record: {
            a: 1n,
            b: 0n,
        },
        discriminator: {
            type: 'B',
            title: 'hello world',
            description: '',
        },
        nestedObject: {
            id: '',
            data: {
                id: '',
                timestamp: now,
                data: {
                    id: '',
                    timestamp: now,
                },
            },
            timestamp: now,
        },
        nestedArray: [
            [{ id: '', timestamp: now }],
            [
                { id: '1', timestamp: now },
                { id: '2', timestamp: now },
            ],
        ],
    };
    const payload1 = $$ObjectWithEveryType.toJsonString(input1);
    consola.info(`Benchmarking SendObject`);
    execSync(
        `pnpm autocannon -m POST -H x-test-header=autocannon -b '${payload1}' http://127.0.0.1:2020/rpcs/tests/send-object`,
        {
            stdio: 'inherit',
        },
    );
    const input2: ObjectWithEveryNullableType = {
        ...input1,
        array: null,
        object: { boolean: false, string: null, timestamp: now },
        string: null,
        nestedObject: {
            id: '1',
            timestamp: now,
            data: {
                id: '',
                timestamp: null,
                data: {
                    id: null,
                    timestamp: null,
                },
            },
        },
    };
    const payload2 = $$ObjectWithEveryNullableType.toJsonString(input2);
    consola.info(`Benchmarking SendObjectWithNullableFields`);
    execSync(
        `pnpm autocannon -m POST -H x-test-header=autocannon -b '${payload2}' http://127.0.0.1:2020/rpcs/tests/send-object-with-nullable-fields`,
        {
            stdio: 'inherit',
        },
    );
    const input3: ObjectWithEveryOptionalType = {
        ...input1,
        string: undefined,
        nestedArray: undefined,
        nestedObject: undefined,
    };
    const payload3 = $$ObjectWithEveryOptionalType.toJsonString(input3);
    consola.info(`Benchmarking SendPartialObject`);
    execSync(
        `pnpm autocannon -m POST -H x-test-header=autocannon -b '${payload3}' http://127.0.0.1:2020/rpcs/tests/send-partial-object`,
        { stdio: 'inherit' },
    );
}

main();
