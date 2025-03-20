import { a } from '@arrirpc/schema';

import {
    defaultTsServerConfig,
    getRpcMetaFromPath,
    isTsServerConfig,
    TsServerConfig,
} from './tsServer';

test('Config Types', () => {
    assertType<a.infer<typeof TsServerConfig>>({} as TsServerConfig);
});

test('isTsServerConfig()', () => {
    expect(isTsServerConfig({})).toBe(true);
    expect(
        isTsServerConfig({
            http2: false,
            esbuild: { alias: {} },
        } satisfies TsServerConfig),
    ).toBe(true);
    expect(isTsServerConfig(defaultTsServerConfig)).toBe(true);
    expect(isTsServerConfig({ https: [] })).toBe(false);
});

describe('Naming RPCs', () => {
    test('Basic route', () => {
        const config: Required<TsServerConfig> = {
            port: 3000,
            rootDir: '/files/items/examples-app',
            srcDir: 'src',
            entry: '',
            procedureDir: 'procedures',
            procedureGlobPatterns: ['**/*.rpc.ts'],
            buildDir: '.arri',
            esbuild: {},
            serverEntry: '',
            https: false,
            http2: false,
            devServer: {},
        };
        const result = getRpcMetaFromPath(
            config,
            '/files/items/example-app/src/procedures/users/getUser.rpc.ts',
        );
        expect(result?.id).toBe('users.getUser');
        expect(result?.httpPath).toBe('/users/get-user');
    });
    test('Route with weird chars', () => {
        const config: Required<TsServerConfig> = {
            port: 3000,
            rootDir: '',
            srcDir: 'src',
            entry: '',
            procedureDir: 'procedures',
            procedureGlobPatterns: ['**/*.rpc.ts'],
            buildDir: '.arri',
            esbuild: {},
            serverEntry: '',
            https: false,
            http2: false,
            devServer: {},
        };
        const result = getRpcMetaFromPath(
            config,
            './src/procedures/(users)/!+getUser.rpc.ts',
        );
        expect(result?.id).toBe('users.getUser');
        expect(result?.httpPath).toBe('/users/get-user');
    });
});
