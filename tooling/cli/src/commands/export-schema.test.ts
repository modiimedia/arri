import type { AppDefinition } from '@arrirpc/codegen-utils';

import { appDefinitionToJsonSchema } from './export-schema';

describe('appDefinitionToJsonSchema()', () => {
    it('creates a basic JSON Schema with $schema', () => {
        const def: AppDefinition = {
            schemaVersion: '0.0.8',
            procedures: {},
            definitions: {},
        };
        const result = appDefinitionToJsonSchema(def);
        expect(result.$schema).toBe(
            'https://json-schema.org/draft/2020-12/schema',
        );
    });

    it('uses custom $id when provided', () => {
        const def: AppDefinition = {
            schemaVersion: '0.0.8',
            procedures: {},
            definitions: {},
        };
        const result = appDefinitionToJsonSchema(def, {
            $id: 'https://example.com/schema.json',
        });
        expect(result.$id).toBe('https://example.com/schema.json');
    });

    it('uses custom title when provided', () => {
        const def: AppDefinition = {
            schemaVersion: '0.0.8',
            procedures: {},
            definitions: {},
        };
        const result = appDefinitionToJsonSchema(def, {
            title: 'Custom Title',
        });
        expect(result.title).toBe('Custom Title');
    });

    it('falls back to info.title when no custom title provided', () => {
        const def: AppDefinition = {
            schemaVersion: '0.0.8',
            info: {
                title: 'My API',
            },
            procedures: {},
            definitions: {},
        };
        const result = appDefinitionToJsonSchema(def);
        expect(result.title).toBe('My API');
    });

    it('custom title overrides info.title', () => {
        const def: AppDefinition = {
            schemaVersion: '0.0.8',
            info: {
                title: 'My API',
            },
            procedures: {},
            definitions: {},
        };
        const result = appDefinitionToJsonSchema(def, { title: 'Override' });
        expect(result.title).toBe('Override');
    });

    it('includes description from info', () => {
        const def: AppDefinition = {
            schemaVersion: '0.0.8',
            info: {
                description: 'API description',
            },
            procedures: {},
            definitions: {},
        };
        const result = appDefinitionToJsonSchema(def);
        expect(result.description).toBe('API description');
    });

    it('does not include $defs when definitions is empty', () => {
        const def: AppDefinition = {
            schemaVersion: '0.0.8',
            procedures: {},
            definitions: {},
        };
        const result = appDefinitionToJsonSchema(def);
        expect(result.$defs).toBeUndefined();
    });

    it('converts definitions to $defs', () => {
        const def: AppDefinition = {
            schemaVersion: '0.0.8',
            procedures: {},
            definitions: {
                User: {
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                    },
                },
            },
        };
        const result = appDefinitionToJsonSchema(def);
        expect(result.$defs).toBeDefined();
        expect(result.$defs?.User).toEqual({
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
            },
            required: ['id', 'name'],
        });
    });

    it('converts multiple definitions', () => {
        const def: AppDefinition = {
            schemaVersion: '0.0.8',
            procedures: {},
            definitions: {
                User: {
                    properties: {
                        id: { type: 'string' },
                    },
                },
                Post: {
                    properties: {
                        title: { type: 'string' },
                        content: { type: 'string' },
                    },
                },
            },
        };
        const result = appDefinitionToJsonSchema(def);
        expect(Object.keys(result.$defs ?? {})).toHaveLength(2);
        expect(result.$defs?.User).toBeDefined();
        expect(result.$defs?.Post).toBeDefined();
    });

    it('converts enum definitions', () => {
        const def: AppDefinition = {
            schemaVersion: '0.0.8',
            procedures: {},
            definitions: {
                Status: {
                    enum: ['active', 'inactive', 'pending'],
                },
            },
        };
        const result = appDefinitionToJsonSchema(def);
        expect(result.$defs?.Status).toEqual({
            type: 'string',
            enum: ['active', 'inactive', 'pending'],
        });
    });

    it('converts nullable types', () => {
        const def: AppDefinition = {
            schemaVersion: '0.0.8',
            procedures: {},
            definitions: {
                NullableString: {
                    type: 'string',
                    isNullable: true,
                },
            },
        };
        const result = appDefinitionToJsonSchema(def);
        expect(result.$defs?.NullableString).toEqual({
            type: ['string', 'null'],
        });
    });

    it('converts discriminator types', () => {
        const def: AppDefinition = {
            schemaVersion: '0.0.8',
            procedures: {},
            definitions: {
                Shape: {
                    discriminator: 'type',
                    mapping: {
                        circle: {
                            properties: {
                                type: { type: 'string' },
                                radius: { type: 'float64' },
                            },
                        },
                        square: {
                            properties: {
                                type: { type: 'string' },
                                side: { type: 'float64' },
                            },
                        },
                    },
                },
            },
        };
        const result = appDefinitionToJsonSchema(def);
        expect(result.$defs?.Shape).toBeDefined();
        expect(result.$defs?.Shape?.oneOf).toHaveLength(2);
    });

    it('handles full AppDefinition with all options', () => {
        const def: AppDefinition = {
            schemaVersion: '0.0.8',
            info: {
                title: 'My API',
                description: 'A test API',
                version: '1.0.0',
            },
            procedures: {},
            definitions: {
                User: {
                    properties: {
                        id: { type: 'string' },
                    },
                },
            },
        };
        const result = appDefinitionToJsonSchema(def, {
            $id: 'https://example.com/schema',
            title: 'Custom Title',
        });
        expect(result).toEqual({
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            $id: 'https://example.com/schema',
            title: 'Custom Title',
            description: 'A test API',
            $defs: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                    },
                    required: ['id'],
                },
            },
        });
    });
});
