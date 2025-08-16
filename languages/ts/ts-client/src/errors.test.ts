import { ArriError } from '@arrirpc/core';

test('Error Initialization', () => {
    const input = JSON.stringify({
        code: 404,
        message: 'Not found',
        stack: ['./src/index.ts', './src/modules/index.ts'],
    });
    const error = ArriError.fromJSONString(input);
    expect(error.success).toBe(true);
    if (!error.success) return;
    expect(error.value.code).toBe(404);
    expect(error.value.message).toBe('Not found');
    expect(error.value.stackList).toStrictEqual([
        `./src/index.ts`,
        `./src/modules/index.ts`,
    ]);
});
