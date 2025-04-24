import benny from 'benny';

interface User {
    id: string;
    name: string;
    email: string;
}

function validateUser(input: unknown, context: string[]): User | undefined {
    if (typeof input !== 'object' || !input) {
        context.push('expected object');
        return undefined;
    }
    if (!('id' in input)) {
        context.push('missing property /id');
        return undefined;
    } else if (typeof input.id !== 'string') {
        context.push('expect string at /id');
        return undefined;
    }
    if (!('name' in input)) {
        context.push('missing property /name');
        return undefined;
    } else if (typeof input.name !== 'string') {
        context.push('expect string at /name');
        return undefined;
    }
    if (!('email' in input)) {
        context.push('missing property /email');
        return undefined;
    } else if (typeof input.email !== 'string') {
        context.push('expect string at /email');
        return undefined;
    }
    return input as any;
}

function validateUserUnsafe(input: unknown, context: string[]): User {
    const result = validateUser(input, context);
    if (context.length) {
        throw new Error(`Failed validation. [${context.join(', ')}]`);
    }
    return result!;
}

function validate(input: unknown) {
    const context: string[] = [];
    return validateUser(input, context);
}
function validateUnsafe(input: unknown) {
    const context: string[] = [];
    return validateUserUnsafe(input, context);
}

const badInput = {
    id: true,
    name: 1,
    email: [],
};

void benny.suite(
    'Throw vs No Throw',
    benny.add('with throws', () => {
        try {
            validateUnsafe(badInput);
        } catch (_) {
            // do nothing
        }
    }),
    benny.add('without throws', () => {
        validate(badInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: 'throw-vs-no-throw',
        format: 'chart.html',
        folder: 'benchmark/dist',
    }),
);
