import { ArriHeaders, trimHeaderValue } from './headers';

describe('ArriHeaders', () => {
    describe('initialization', () => {
        test('from a record', () => {
            const headers = new ArriHeaders({ 'X-Foo': '1', bar: '2' });
            expect(headers.toJSON()).toStrictEqual({ 'x-foo': '1', bar: '2' });
        });
        test('from key/value pairs', () => {
            const headers = new ArriHeaders([
                ['X-Foo', '1'],
                ['x-foo', '2'],
            ]);
            expect(headers.toJSON()).toStrictEqual({ 'x-foo': '1, 2' });
        });
        test('from native Headers', () => {
            const native = new Headers();
            native.append('Authorization', 'Bearer abc');
            native.append('X-Foo', '1');
            native.append('X-Foo', '2');
            const headers = new ArriHeaders(native);
            expect(headers.toJSON()).toStrictEqual({
                authorization: 'Bearer abc',
                'x-foo': '1, 2',
            });
        });
        test('from another ArriHeaders', () => {
            const original = new ArriHeaders({ 'x-foo': '1' });
            const copy = new ArriHeaders(original);
            copy.set('x-bar', '2');
            expect(original.toJSON()).toStrictEqual({ 'x-foo': '1' });
            expect(copy.toJSON()).toStrictEqual({ 'x-foo': '1', 'x-bar': '2' });
        });
        test('empty', () => {
            expect(new ArriHeaders().size).toBe(0);
        });
    });

    test('keys are case-insensitive', () => {
        const headers = new ArriHeaders();
        headers.set('X-Foo', '1');
        expect(headers.get('x-foo')).toBe('1');
        expect(headers.get('X-FOO')).toBe('1');
        expect(headers.has('x-FoO')).toBe(true);
        expect([...headers.keys()]).toStrictEqual(['x-foo']);
        headers.delete('X-FOO');
        expect(headers.has('x-foo')).toBe(false);
    });

    test('get returns null for missing keys', () => {
        expect(new ArriHeaders().get('x-foo')).toBe(null);
    });

    test('set replaces and append joins', () => {
        const headers = new ArriHeaders();
        headers.append('x-foo', '1');
        headers.append('X-Foo', '2');
        expect(headers.get('x-foo')).toBe('1, 2');
        headers.set('x-foo', '3');
        expect(headers.get('x-foo')).toBe('3');
    });

    test('values are trimmed', () => {
        const headers = new ArriHeaders();
        headers.set('x-foo', ' \t hello world \t ');
        expect(headers.get('x-foo')).toBe('hello world');
    });

    test('iteration', () => {
        const headers = new ArriHeaders({ a: '1', b: '2' });
        expect([...headers]).toStrictEqual([
            ['a', '1'],
            ['b', '2'],
        ]);
        expect([...headers.entries()]).toStrictEqual([...headers]);
        expect([...headers.values()]).toStrictEqual(['1', '2']);
        const visited: string[] = [];
        headers.forEach((value, key, self) => {
            expect(self).toBe(headers);
            visited.push(`${key}=${value}`);
        });
        expect(visited).toStrictEqual(['a=1', 'b=2']);
    });

    describe('validation', () => {
        test('rejects invalid keys', () => {
            const headers = new ArriHeaders();
            for (const key of ['', 'x foo', 'x:foo', 'föo', 'x\nfoo']) {
                expect(() => headers.set(key, '1')).toThrow(TypeError);
            }
        });
        test('rejects reserved keys in any casing', () => {
            const headers = new ArriHeaders();
            for (const key of ['req-id', 'Content-Type', 'ACCEPT', 'reason']) {
                expect(() => headers.set(key, '1')).toThrow(TypeError);
            }
            expect(() => new ArriHeaders({ 'Req-Id': '1' })).toThrow(TypeError);
        });
        test('rejects non-ASCII and control characters in values', () => {
            const headers = new ArriHeaders();
            for (const value of ['café', 'a\nb', 'a\rb', 'a\x00b', 'a\x7Fb']) {
                expect(() => headers.set('x-foo', value)).toThrow(TypeError);
            }
        });
        test('rejects keys reserved for transport bindings', () => {
            const headers = new ArriHeaders();
            for (const key of ['arri-connection-id', 'Arri-Foo', 'ARRI-']) {
                expect(() => headers.set(key, '1')).toThrow(TypeError);
            }
            // only the exact prefix is reserved
            headers.set('arri', '1');
            headers.set('x-arri-foo', '1');
            headers.set('arrival', '1');
            expect([...headers.keys()]).toStrictEqual([
                'arri',
                'x-arri-foo',
                'arrival',
            ]);
        });
        test('allows tabs and printable ASCII in values', () => {
            const headers = new ArriHeaders();
            headers.set('x-foo', 'a\tb ~!@#$%^&*()');
            expect(headers.get('x-foo')).toBe('a\tb ~!@#$%^&*()');
        });
    });

    test('toJSON', () => {
        const headers = new ArriHeaders({ 'X-Foo': '1' });
        expect(JSON.stringify({ headers })).toBe('{"headers":{"x-foo":"1"}}');
    });
});

describe('trimHeaderValue()', () => {
    test('only trims spaces and tabs', () => {
        expect(trimHeaderValue(' \t a b \t ')).toBe('a b');
        expect(trimHeaderValue(' a ')).toBe(' a ');
        expect(trimHeaderValue('\na\n')).toBe('\na\n');
        expect(trimHeaderValue('')).toBe('');
        expect(trimHeaderValue(' \t ')).toBe('');
    });
});
