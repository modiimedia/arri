import { defineCommand } from 'citty';

import jsonSchema from './json-schema';

export default defineCommand({
    meta: {
        name: 'export',
        description: 'Export AppDefinition to various formats',
    },
    subCommands: {
        'json-schema': jsonSchema,
    },
});
