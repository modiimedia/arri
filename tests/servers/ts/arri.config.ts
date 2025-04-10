import { defineConfig, generators, servers } from 'arri';
import { readFileSync } from 'fs';
import path from 'path';

const prettierConfig = JSON.parse(
    readFileSync(path.resolve(__dirname, '../../../.prettierrc'), {
        encoding: 'utf-8',
    }),
);

export default defineConfig({
    server: servers.tsServer({
        serverEntry: 'server.ts',
        http2: true,
        port: 2020,
    }),
    generators: [
        generators.typescriptClient({
            clientName: 'TestClient',
            outputFile: path.resolve(
                __dirname,
                '../../clients/ts/testClient.g.ts',
            ),
            prettierOptions: prettierConfig,
        }),
        generators.typescriptClient({
            clientName: 'TestClientPrefixed',
            outputFile: path.resolve(
                __dirname,
                '../../clients/ts/tsClientPrefixed.g.ts',
            ),
            typePrefix: 'Foo',
            prettierOptions: prettierConfig,
            rootService: 'tests',
        }),
        generators.dartClient({
            clientName: 'TestClient',
            outputFile: path.resolve(
                __dirname,
                '../../clients/dart/lib/test_client.g.dart',
            ),
        }),
        generators.dartClient({
            clientName: 'TestClientPrefixed',
            outputFile: path.resolve(
                __dirname,
                '../../clients/dart/lib/test_client_prefixed.g.dart',
            ),
            typePrefix: 'Foo',
            rootService: 'tests',
        }),
        generators.kotlinClient({
            clientName: 'TestClient',
            outputFile: path.resolve(
                __dirname,
                '../../clients/kotlin/src/main/kotlin/TestClient.g.kt',
            ),
        }),
        generators.kotlinClient({
            clientName: 'TestClientPrefixed',
            outputFile: path.resolve(
                __dirname,
                '../../clients/kotlin/src/main/kotlin/TestClientPrefixed.g.kt',
            ),
            typePrefix: 'Foo',
            rootService: 'tests',
        }),
        generators.rustClient({
            clientName: 'TestClient',
            outputFile: path.resolve(
                __dirname,
                '../../clients/rust/src/test_client.g.rs',
            ),
        }),
        generators.rustClient({
            clientName: 'TestClientPrefixed',
            outputFile: path.resolve(
                __dirname,
                '../../clients/rust/src/test_client_prefixed.g.rs',
            ),
            typePrefix: 'Foo',
            rootService: 'tests',
        }),
        generators.swiftClient({
            clientName: 'TestClient',
            outputFile: path.resolve(
                __dirname,
                '../../clients/swift/Sources/TestClient.g.swift',
            ),
        }),
        generators.swiftClient({
            clientName: 'TestClientPrefixed',
            outputFile: path.resolve(
                __dirname,
                '../../clients/swift/Sources/TestClientPrefixed.g.swift',
            ),
            typePrefix: 'Foo',
            rootService: 'tests',
        }),
    ],
});
