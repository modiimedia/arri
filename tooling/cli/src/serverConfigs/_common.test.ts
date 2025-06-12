import { createWindowsCompatibleImportPath } from './_common';

test('windows compatible absolute imports', () => {
    const result = createWindowsCompatibleImportPath(
        'C:/Users/foo/Documents/file.js',
    );
    expect(result).toBe(`file:\\\\C:\\Users\\foo\\Documents\\file.js`);
    const result2 = createWindowsCompatibleImportPath(
        'ZZ:\\Users\\foo\\Documents\\file.mjs',
    );
    expect(result2).toBe('file:\\\\ZZ:\\Users\\foo\\Documents\\file.mjs');
});
