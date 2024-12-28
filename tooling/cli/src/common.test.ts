import { isInsideDir } from './common';

test('isInsideDir', () => {
    expect(isInsideDir('/foo/bar/baz/foo', '/foo/bar/baz')).toBe(true);
    expect(isInsideDir('./../shared/src/components', './src/')).toBe(false);
});
