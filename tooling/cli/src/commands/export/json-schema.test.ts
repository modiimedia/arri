import type { AppDefinition, Schema } from '@arrirpc/codegen-utils';

import { appDefinitionToJsonSchema } from './json-schema';

const createDef = (overrides: Partial<AppDefinition> = {}): AppDefinition => ({
    schemaVersion: '0.0.8',
    procedures: {},
    definitions: {},
    ...overrides,
});

const createDefWithSchema = (
    name: string,
    schema: Schema,
    overrides: Partial<AppDefinition> = {},
): AppDefinition =>
    createDef({ definitions: { [name]: schema }, ...overrides });

describe('appDefinitionToJsonSchema()', () => {
    it('creates a basic JSON Schema with $schema', () => {
        const result = appDefinitionToJsonSchema(createDef());
        expect(result.$schema).toBe(
            'https://json-schema.org/draft/2020-12/schema',
        );
    });

    it('uses custom $id when provided', () => {
        const result = appDefinitionToJsonSchema(createDef(), {
            $id: 'https://example.com/schema.json',
        });
        expect(result.$id).toBe('https://example.com/schema.json');
    });

    it('uses custom title when provided', () => {
        const result = appDefinitionToJsonSchema(createDef(), {
            title: 'Custom Title',
        });
        expect(result.title).toBe('Custom Title');
    });

    it('falls back to info.title when no custom title provided', () => {
        const result = appDefinitionToJsonSchema(
            createDef({ info: { title: 'My API' } }),
        );
        expect(result.title).toBe('My API');
    });

    it('custom title overrides info.title', () => {
        const result = appDefinitionToJsonSchema(
            createDef({ info: { title: 'My API' } }),
            { title: 'Override' },
        );
        expect(result.title).toBe('Override');
    });

    it('includes description from info', () => {
        const result = appDefinitionToJsonSchema(
            createDef({ info: { description: 'API description' } }),
        );
        expect(result.description).toBe('API description');
    });

    it('uses custom description when provided', () => {
        const result = appDefinitionToJsonSchema(createDef(), {
            description: 'Custom description',
        });
        expect(result.description).toBe('Custom description');
    });

    it('custom description overrides info.description', () => {
        const result = appDefinitionToJsonSchema(
            createDef({ info: { description: 'API description' } }),
            { description: 'Override' },
        );
        expect(result.description).toBe('Override');
    });

    it('does not include $defs when definitions is empty', () => {
        const result = appDefinitionToJsonSchema(createDef());
        expect(result.$defs).toBeUndefined();
    });

    it('converts definitions to $defs', () => {
        const result = appDefinitionToJsonSchema(
            createDefWithSchema('User', {
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                },
            }),
        );
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
        const result = appDefinitionToJsonSchema(
            createDef({
                definitions: {
                    User: { properties: { id: { type: 'string' } } },
                    Post: {
                        properties: {
                            title: { type: 'string' },
                            content: { type: 'string' },
                        },
                    },
                },
            }),
        );
        expect(Object.keys(result.$defs ?? {})).toHaveLength(2);
        expect(result.$defs?.User).toBeDefined();
        expect(result.$defs?.Post).toBeDefined();
    });

    it('converts enum definitions', () => {
        const result = appDefinitionToJsonSchema(
            createDefWithSchema('Status', {
                enum: ['active', 'inactive', 'pending'],
            }),
        );
        expect(result.$defs?.Status).toEqual({
            type: 'string',
            enum: ['active', 'inactive', 'pending'],
        });
    });

    it('converts nullable types', () => {
        const result = appDefinitionToJsonSchema(
            createDefWithSchema('NullableString', {
                type: 'string',
                isNullable: true,
            }),
        );
        expect(result.$defs?.NullableString).toEqual({
            type: ['string', 'null'],
        });
    });

    it('converts discriminator types', () => {
        const result = appDefinitionToJsonSchema(
            createDefWithSchema('Shape', {
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
            }),
        );
        expect(result.$defs?.Shape).toBeDefined();
        expect(result.$defs?.Shape?.oneOf).toHaveLength(2);
    });

    it('handles full AppDefinition with all options', () => {
        const result = appDefinitionToJsonSchema(
            createDefWithSchema(
                'User',
                { properties: { id: { type: 'string' } } },
                {
                    info: {
                        title: 'My API',
                        description: 'A test API',
                        version: '1.0.0',
                    },
                },
            ),
            { $id: 'https://example.com/schema', title: 'Custom Title' },
        );
        expect(result).toEqual({
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            $id: 'https://example.com/schema',
            title: 'Custom Title',
            description: 'A test API',
            $defs: {
                User: {
                    type: 'object',
                    properties: { id: { type: 'string' } },
                    required: ['id'],
                },
            },
        });
    });
});
