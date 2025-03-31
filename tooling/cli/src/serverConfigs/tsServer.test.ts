import {
    createWindowsCompatibleAbsoluteImport,
    getRpcMetaFromPath,
    TsServerConfig,
} from './tsServer';

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

test('windows compatible absolute imports', () => {
    const result = createWindowsCompatibleAbsoluteImport(
        'C:/Users/foo/Documents/file.js',
    );
    expect(result).toBe(`file:\\\\\\C:\\Users\\foo\\Documents\\file.js`);
    const result2 = createWindowsCompatibleAbsoluteImport(
        'ZZ:\\Users\\foo\\Documents\\file.mjs',
    );
    expect(result2).toBe('file:\\\\\\ZZ:\\Users\\foo\\Documents\\file.mjs');
});
