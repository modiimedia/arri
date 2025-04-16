import { AppDefinition, createAppDefinition } from './appDef';
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
                transport: 'http',
                method: 'post',
                path: '/say-hello',
            },
            createConnection: {
                transport: 'ws',
                path: '/ws',
                params: {
                    properties: {
                        message: {
                            type: 'string',
                        },
                    },
                },
                response: {
                    properties: {
                        message: {
                            type: 'string',
                        },
                    },
                },
            },
            'utils.getSettings': {
                transport: 'http',
                method: 'get',
                path: '/utils/get-settings',
                params: SettingsParams,
                response: Settings,
            },
        },
    });
    const expectedResult: AppDefinition = {
        schemaVersion: '0.0.8',
        procedures: {
            sayHello: {
                transport: 'http',
                method: 'post',
                path: '/say-hello',
                params: undefined,
                response: undefined,
            },
            createConnection: {
                transport: 'ws',
                path: '/ws',
                params: 'CreateConnectionParams',
                response: 'CreateConnectionResponse',
            },
            'utils.getSettings': {
                transport: 'http',
                method: 'get',
                path: '/utils/get-settings',
                params: 'SettingsParams',
                response: 'Settings',
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
