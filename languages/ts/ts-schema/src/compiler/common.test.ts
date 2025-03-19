import { a } from '../_index';
import { inputRequiresTransformation } from './common';

describe('inputRequiresTransformation()', () => {
    test('should return true', () => {
        const schemas = [
            a.timestamp(),
            a.int64(),
            a.uint64(),
            a.array(a.timestamp()),
            a.array(a.uint64()),
            a.record(a.timestamp()),
            a.record(a.int64()),
            a.object({
                foo: a.string(),
                bar: a.number(),
                baz: a.array(a.timestamp()),
            }),
            a.object({
                baz: a.record(a.uint64()),
            }),
            a.object({
                foo: a.int64(),
            }),
        ];
        for (const schema of schemas) {
            expect(inputRequiresTransformation(schema)).toBe(true);
        }
    });
    test('should return false', () => {
        const schemas = [
            a.string(),
            a.enumerator(['FOO', 'BAR', 'BAZ']),
            a.any(),
            a.object({
                foo: a.string(),
            }),
            a.array(a.string()),
            a.record(a.number()),
        ];
        for (const schema of schemas) {
            const requiresTransform = inputRequiresTransformation(schema);
            if (requiresTransform) console.log(schema);
            expect(requiresTransform).toBe(false);
        }
    });
});
