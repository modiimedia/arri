import type { Schema } from '@arrirpc/type-defs';

export interface TemplateInput<TSchema extends Schema = any> {
    val: string;
    targetVal: string;
    schema: TSchema;
    instancePath: string;
    schemaPath: string;
    discriminatorKey?: string;
    discriminatorValue?: string;
    subFunctions: Record<string, string>;
    finalFunctionBody?: string;
    shouldCoerce: boolean | undefined;
}

export function refFunctionName(prefix: string, id: string) {
    return `__${prefix}_${id}`;
}

/**
 * Build the code that accesses a property.
 * Uses dot notation when possible since not every key is a valid JS identifier. (Ex: "my-key")
 */
export function propertyAccessor(val: string, key: string) {
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
        return `${val}.${key}`;
    }
    return `${val}[${JSON.stringify(key)}]`;
}

/**
 * Variable names are sometimes derived from property keys, which aren't always valid JS identifiers.
 */
export function validVarName(input: string) {
    const result = input.replace(/[^a-zA-Z0-9_$]/g, '_');
    return /^[0-9]/.test(result) ? `_${result}` : result;
}
