import {
    AppDefinition,
    RpcDefinition,
    ServiceDefinition,
} from '@arrirpc/type-defs';

export function unflattenProcedures(
    procedures: AppDefinition['procedures'],
    rootService?: string,
): Record<string, RpcDefinition | ServiceDefinition> {
    if (!rootService) {
        return unflattenObject(procedures);
    }
    const filteredProcedures: AppDefinition['procedures'] = {};
    for (const key of Object.keys(procedures)) {
        if (key.startsWith(rootService)) {
            filteredProcedures[key.replace(rootService + '.', '')] =
                procedures[key]!;
        }
    }
    return unflattenObject(filteredProcedures);
}

export function unflattenObject(data: Record<string, any>) {
    if (Object(data) !== data || Array.isArray(data)) return data;
    const regex = /\.?([^.[\]]+)|\[(\d+)\]/g;
    const result: Record<any, any> = {};
    for (const p in data) {
        let cur = result;
        let prop = '';
        let m: any;
        while ((m = regex.exec(p))) {
            cur = cur[prop] || (cur[prop] = m[2] ? [] : {});
            prop = m[2] || m[1];
        }
        cur[prop] = data[p];
    }
    return result[''] || result;
}

export const removeDisallowedChars = (
    input: string,
    disallowedChars: string,
) => {
    let result = input;
    for (const char of disallowedChars) {
        if (result.includes(char)) {
            result = result.split(char).join('');
        }
    }
    return result;
};

export const stringStartsWithNumber = (input: string): boolean =>
    input.length !== 0 && !Number.isNaN(Number(input.charAt(0)));

export function setNestedObjectProperty<T>(
    targetProp: string,
    value: T,
    object: Record<any, any>,
) {
    const parts = targetProp.split('.');
    let current = object;
    for (let i = 0; i < parts.length; i++) {
        const key = parts[i]!;
        if (i === parts.length - 1) {
            current[key] = value;
        } else {
            if (!current[key]) {
                current[key] = {};
            }
            current = current[key];
        }
    }
    return object;
}

export function normalizeWhitespace(input: string) {
    if (input.includes('\n\n')) {
        return normalizeWhitespace(input.split('\n\n').join('\n'));
    }
    const lines: string[] = [];
    for (const line of input.split('\n')) {
        lines.push(line.trim());
    }
    const result = lines.join('\n').trim();
    if (result.includes('\n\n')) {
        return normalizeWhitespace(result.split('\n\n').join('\n'));
    }
    return result;
}
