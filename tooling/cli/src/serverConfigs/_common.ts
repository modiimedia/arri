import os from 'node:os';

export function createWindowsCompatibleImportPath(
    input: string,
    prefixWithFile = true,
): string {
    let separator: '\\' | '/' | undefined;
    for (const char of input) {
        if (char === '\\') {
            separator = '\\';
            break;
        }
        if (char === '/') {
            separator = '/';
        }
    }
    const parts = input.split(separator ?? '/');
    if (parts[0]?.endsWith(':') && prefixWithFile) {
        parts.unshift('file:\\');
    }
    const newStr = parts.join('\\');
    return newStr;
}

export function isOnWindows() {
    return os.type() === 'Windows_NT';
}
