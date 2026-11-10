import {
    createServerEntryTemplate,
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

describe('Server Entry Generation', () => {
    test('generates server entry with app.start and shutdown hooks', () => {
        const config: Required<TsServerConfig> = {
            port: 3000,
            rootDir: '/test',
            srcDir: 'src',
            entry: 'app.ts',
            procedureDir: 'procedures',
            procedureGlobPatterns: ['**/*.rpc.ts'],
            buildDir: '.arri',
            esbuild: {},
            serverEntry: '',
            https: false,
            http2: false,
            devServer: {},
        };

        const template = createServerEntryTemplate(config);
        expect(template).toContain('await app.start?.();');
        expect(template).toContain('await app.stop?.();');
        expect(template).toContain('await listener.close();');
        expect(template).toContain("process.on('SIGTERM', handleShutdown);");
        expect(template).toContain("process.on('SIGINT', handleShutdown);");
    });
});
