export interface TestUser {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    email: string | null;
}

export function parseUserNew(input: unknown, context: any): TestUser {
    let target = input as any;
    if (typeof input === 'string') {
        target = JSON.parse(input);
    }
    for (const key of Object.keys(target)) {
        switch (key) {
            case 'id':
                if (typeof target.id !== 'string') {
                    context.errors.push(`expected string at /id`);
                }
                break;
            case 'createdAt':
                if (typeof target.createdAt === 'string') {
                    try {
                        const val = new Date(target.createdAt);
                        target.createdAt = val;
                    } catch (_) {
                        context.errors.push(
                            `expected instanceof Date or ISO date string at /createdAt`,
                        );
                    }
                } else if (target.createdAt instanceof Date) {
                    // do nothing
                } else {
                    context.errors.push(
                        `expected instance of Date or ISO date string at /createdAt`,
                    );
                }
                break;
            case 'updatedAt':
                if (typeof target.updatedAt === 'string') {
                    try {
                        const val = new Date(target.key);
                        target.createdAt = val;
                    } catch (_) {
                        context.errors.push(
                            `expected instanceof Date or ISO date string at /updatedAt`,
                        );
                    }
                } else if (target.updatedAt instanceof Date) {
                    // do nothing
                } else {
                    context.errors.push(
                        `expected instance of Date or ISO date string at /updatedAt`,
                    );
                }
                break;
            case 'name':
                if (typeof target.name !== 'string') {
                    context.errors.push(`expected string at /name`);
                }
                break;
            case 'email':
                if (typeof target.email !== 'string' && target.email !== null) {
                    context.errors.push(`expected string or null at /email`);
                }
                break;
            default:
                delete target[key];
                break;
        }
    }
    return target;
}

export function parseUserNewV2(input: unknown, context: any): TestUser {
    const target =
        typeof input === 'string' ? JSON.parse(input) : (input as any);
    if (typeof target.id !== 'string') {
        context.errors.push(`Expected string at /id`);
    }
    if (typeof target.createdAt === 'string') {
        try {
            target.createdAt = new Date(target.createdAt);
        } catch (_) {
            context.errors.push(
                `Expected instance of date or ISO date string at /createdAt`,
            );
        }
    } else if (!(target.createdAt instanceof Date)) {
        context.errors.push(
            `Expected instance of Date or ISO date string at /createdAt`,
        );
    }
    if (typeof target.updatedAt === 'string') {
        try {
            target.updatedAt = new Date(target.updatedAt);
        } catch (_) {
            context.errors.push(
                `Expected instance of date or ISO date string at /updatedAt`,
            );
        }
    } else if (!(target.updatedAt instanceof Date)) {
        context.errors.push(
            `Expected instance of Date or ISO date string at /updatedAt`,
        );
    }
    if (typeof target.name !== 'string') {
        context.errors.push(`Expected string at /name`);
    }
    if (typeof target.email !== 'string' && target.email !== null) {
        context.errors.push(`Expected string or null at /email`);
    }
    return target;
}

export function parseUserOld(input: any, context: any): TestUser {
    let target = {} as any;
    if (typeof input === 'string') {
        target = JSON.parse(input);
    }
    if (typeof input.id === 'string') {
        target.id = input.id;
    } else {
        context.errors.push(`Expected string at /id`);
    }
    if (typeof input.createdAt === 'string') {
        try {
            target.createdAt = new Date(input.createdAt);
        } catch (_) {
            context.errors.push(
                `Expected instance of date or ISO date string at /createdAt`,
            );
        }
    } else if (input.createdAt instanceof Date) {
        target.createdAt = input.createdAt;
    } else {
        context.errors.push(
            `Expected instance of Date or ISO date string at /createdAt`,
        );
    }
    if (typeof input.updatedAt === 'string') {
        try {
            target.updatedAt = new Date(input.updatedAt);
        } catch (_) {
            context.errors.push(
                `Expected instance of date or ISO date string at /updatedAt`,
            );
        }
    } else if (input.updatedAt instanceof Date) {
        target.updatedAt = input.updatedAt;
    } else {
        context.errors.push(
            `Expected instance of Date or ISO date string at /updatedAt`,
        );
    }
    if (typeof input.name === 'string') {
        target.name = input.name;
    } else {
        context.errors.push(`Expected string at /email`);
    }
    if (typeof input.email === 'string') {
        target.email = input.email;
    } else if (input.email === null) {
        target.email = input.email;
    } else {
        context.errors.push(`Expected string or null at /email`);
    }
    return target;
}
