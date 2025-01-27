import { type Schema } from '@arrirpc/type-defs';
import { StandardSchemaV1 } from '@standard-schema/spec';

import { a } from '../_index';

it('Produces valid ATD Schema', () => {
    const Schema = a.any();
    expect(JSON.parse(JSON.stringify(Schema))).toStrictEqual({
        metadata: {},
    } satisfies Schema);

    const SchemaWithMetadata = a.any({
        id: 'AnySchema',
        description: 'This can be any type',
    });
    expect(JSON.parse(JSON.stringify(SchemaWithMetadata))).toStrictEqual({
        metadata: {
            id: 'AnySchema',
            description: 'This can be any type',
        },
    });
});

describe('supports standard-schema', () => {
    it('properly infers types', async () => {
        assertType<StandardSchemaV1<any>>(a.any());
        const result = await a.any()['~standard'].validate('1');
        if (!result.issues) assertType<any>(result.value);
    });
});
