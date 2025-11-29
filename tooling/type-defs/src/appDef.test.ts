import {
    AppDefinition,
    createAppDefinition,
    isRpcDefinition,
    RpcDefinition,
} from './appDef';
import { SchemaFormProperties } from './typeDef';

test('create app definition', () => {
    const SettingsParams: SchemaFormProperties = {
        properties: {
            userId: {
                type: 'string',
            },
        },
        metadata: {
            id: 'SettingsParams',
        },
    };
    const Settings: SchemaFormProperties = {
        properties: {
            colorScheme: {
                enum: ['SYSTEM', 'LIGHT', 'DARK'],
            },
        },
        metadata: {
            id: 'Settings',
        },
    };

    const result = createAppDefinition({
        procedures: {
            sayHello: {
                transports: ['http'],
                method: 'post',
                path: '/say-hello',
            },
            createConnection: {
                transports: ['ws'],
                path: '/ws',
                input: {
                    properties: {
                        message: {
                            type: 'string',
                        },
                    },
                },
                output: {
                    properties: {
                        message: {
                            type: 'string',
                        },
                    },
                },
            },
            'utils.getSettings': {
                transports: ['http'],
                method: 'get',
                path: '/utils/get-settings',
                input: SettingsParams,
                output: Settings,
            },
        },
    });
    const expectedResult: AppDefinition = {
        schemaVersion: '0.0.8',
        transports: ['http', 'ws'],
        procedures: {
            sayHello: {
                transports: ['http'],
                method: 'post',
                path: '/say-hello',
                input: undefined,
                output: undefined,
            },
            createConnection: {
                transports: ['ws'],
                path: '/ws',
                input: 'CreateConnectionParams',
                output: 'CreateConnectionResponse',
            },
            'utils.getSettings': {
                transports: ['http'],
                method: 'get',
                path: '/utils/get-settings',
                input: 'SettingsParams',
                output: 'Settings',
            },
        },
        definitions: {
            CreateConnectionParams: {
                properties: {
                    message: {
                        type: 'string',
                    },
                },
            },
            CreateConnectionResponse: {
                properties: {
                    message: {
                        type: 'string',
                    },
                },
            },
            SettingsParams: {
                properties: {
                    userId: {
                        type: 'string',
                    },
                },
                metadata: {
                    id: 'SettingsParams',
                },
            },
            Settings: {
                properties: {
                    colorScheme: {
                        enum: ['SYSTEM', 'LIGHT', 'DARK'],
                    },
                },
                metadata: {
                    id: 'Settings',
                },
            },
        },
    };
    expect(JSON.parse(JSON.stringify(result))).toStrictEqual(
        JSON.parse(JSON.stringify(expectedResult)),
    );
});

test('is rpc definition', () => {
    const inputs: RpcDefinition[] = [
        {
            transports: ['http'],
            path: '/hello-world',
        },
        {
            transports: ['http', 'ws'],
            method: 'put',
            path: '/hello-world/2',
            input: 'HelloWorldParams',
            output: 'HelloWorldResponse',
        },
        {
            transports: ['http'],
            method: 'get',
            path: '/hello-world/2',
            output: 'HelloWorldResponse',
            outputIsStream: true,
        },
        {
            transports: ['http'],
            path: '/rpcs/tests/send-partial-object',
            method: undefined,
            input: 'ObjectWithEveryOptionalType',
            output: 'ObjectWithEveryOptionalType',
            description: undefined,
            isDeprecated: undefined,
            deprecationNote: undefined,
        },
    ];
    for (const input of inputs) {
        expect(isRpcDefinition(input)).toBe(true);
    }
});
