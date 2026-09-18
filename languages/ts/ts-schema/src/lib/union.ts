import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../adapters';
import { ValueError } from '../errors';
import {
    AObjectSchema,
    ASchema,
    ASchemaOptions,
    AUnionSchema,
    AUnionSchemaWithAdapters,
    InferType,
    InferUnionType,
    isObject,
    SchemaValidator,
    ValidationContext,
    VALIDATOR_KEY,
} from '../schemas';

export interface AUnionSchemaOptions<
    TTagKey extends string | undefined = undefined,
    TValueKey extends string | undefined = undefined,
> extends ASchemaOptions {
    tagKey?: TTagKey;
    valueKey?: TValueKey;
}

export function union<
    TTagKey extends string | undefined = undefined,
    TValueKey extends string | undefined = undefined,
    TUnion extends Record<
        string,
        TTagKey extends string
            ? TValueKey extends undefined
                ? AObjectSchema<any>
                : ASchema<any>
            : ASchema<any>
    > = any,
>(
    union: TUnion,
    opts?: AUnionSchemaOptions<TTagKey, TValueKey>,
): AUnionSchemaWithAdapters<InferUnionType<TUnion, TTagKey, TValueKey>>;
export function union<
    TTagKey extends string | undefined = undefined,
    TValueKey extends string | undefined = undefined,
    TUnion extends Record<
        string,
        TTagKey extends string
            ? TValueKey extends undefined
                ? AObjectSchema<any>
                : ASchema<any>
            : ASchema<any>
    > = any,
>(
    id: string,
    union: TUnion,
    opts?: Omit<AUnionSchemaOptions<TTagKey, TValueKey>, 'id'>,
): AUnionSchemaWithAdapters<InferUnionType<TUnion, TTagKey, TValueKey>>;
export function union<
    TTagKey extends string | undefined = undefined,
    TValueKey extends string | undefined = undefined,
    TUnion extends Record<
        string,
        TTagKey extends string
            ? TValueKey extends undefined
                ? AObjectSchema<any>
                : ASchema<any>
            : ASchema<any>
    > = any,
>(
    propA: string | TUnion,
    propB?: TUnion | AUnionSchemaOptions<TTagKey, TValueKey>,
    propC?: Omit<AUnionSchemaOptions<TTagKey, TValueKey>, 'id'>,
): AUnionSchemaWithAdapters<InferUnionType<TUnion, TTagKey, TValueKey>> {
    type T = InferType<AUnionSchema<InferUnionType<TUnion>>>;
    const isIdShorthand = typeof propA === 'string';
    const union = (isIdShorthand ? propB : propA) as TUnion;
    const opts: AUnionSchemaOptions<TTagKey, TValueKey> = isIdShorthand
        ? (propC ?? {})
        : (propB ?? {});
    if (isIdShorthand) {
        opts.id = propA;
    }
    const tagKey = opts.tagKey;
    const valueKey = opts.valueKey;
    let isType: (input: unknown) => boolean;
    let parseType: (
        input: unknown,
        context: ValidationContext,
    ) => T | undefined;
    let coerceType: (
        input: unknown,
        context: ValidationContext,
    ) => T | undefined;
    let serializeType: (
        input: T,
        context: ValidationContext,
    ) => string | undefined;
    if (tagKey && valueKey) {
        isType = (input: unknown) =>
            validateInternallyTaggedWithValueKey(
                union,
                tagKey,
                valueKey,
                input,
            );
        parseType = (input: unknown, context: ValidationContext) =>
            parseInternallyTaggedWithValueKey(
                union,
                tagKey,
                valueKey,
                input,
                context,
            ) as any;
        coerceType = (input: unknown, context: ValidationContext) =>
            parseInternallyTaggedWithValueKey(
                union,
                tagKey,
                valueKey,
                input,
                context,
                true,
            ) as any;
        serializeType = (input: T, context: ValidationContext) =>
            serializeInternallyTaggedWithValueKey(
                union,
                tagKey,
                valueKey,
                input,
                context,
            );
    } else if (tagKey) {
        isType = (input: unknown) =>
            validateInternallyTagged(union, tagKey, input);
        parseType = (input: unknown, context: ValidationContext) =>
            parseInternallyTagged(union, tagKey, input, context);
        coerceType = (input: unknown, context: ValidationContext) =>
            parseInternallyTagged(union, tagKey, input, context, true);
        serializeType = (input: T, context: ValidationContext) =>
            serializeInternallyTagged(union, tagKey, input, context);
    } else {
        isType = (input: unknown) => validateExternallyTagged(union, input);
        parseType = (input: unknown, context: ValidationContext) =>
            parseExternallyTagged(union, input, context) as any;
        coerceType = (input: unknown, context: ValidationContext) =>
            parseExternallyTagged(union, input, context, true) as any;
        serializeType = (input: T, context: ValidationContext) =>
            serializeExternallyTagged(union, input, context);
    }

    const validator: SchemaValidator<InferUnionType<TUnion>, false> = {
        output: {} as any,
        optional: false,
        validate: isType as any,
        parse: parseType,
        coerce: coerceType,
        serialize: serializeType,
    };
    const result: AUnionSchemaWithAdapters<any> = {
        tagKey,
        valueKey,
        union: union,
        metadata: {
            ...opts,
            tagKey: undefined,
            valueKey: undefined,
        },
        [VALIDATOR_KEY]: validator,
        '~standard': createStandardSchemaProperty(isType as any, parseType),
    };
    hideInvalidProperties(result);
    return result;
}

function validateExternallyTagged(
    union: Record<string, ASchema<any>>,
    input: unknown,
) {
    if (!isObject(input)) return false;
    for (const key of Object.keys(union)) {
        if (key in input) {
            const data = (input as any)[key];
            return union[key]![VALIDATOR_KEY].validate(data);
        }
    }
    return false;
}

function validateInternallyTagged(
    union: Record<string, ASchema<any>>,
    tagKey: string,
    input: unknown,
): boolean {
    if (!isObject(input)) return false;
    if (!(tagKey in input)) return false;
    for (const key of Object.keys(union)) {
        if (input[tagKey] !== key) continue;
        return union[key]![VALIDATOR_KEY].validate(input);
    }
    return false;
}

function validateInternallyTaggedWithValueKey(
    union: Record<string, ASchema<any>>,
    tagKey: string,
    valueKey: string,
    input: unknown,
): boolean {
    if (!isObject(input)) return false;
    if (!(tagKey in input)) return false;
    if (!(valueKey in input)) return false;
    for (const key of Object.keys(union)) {
        if (input[tagKey] !== key) continue;
        return union[key]![VALIDATOR_KEY].validate(input[valueKey]);
    }
    return false;
}

function parseExternallyTagged(
    union: Record<string, ASchema<any>>,
    input: unknown,
    context: ValidationContext,
    coerce = false,
) {
    let parsedInput = input;
    if (
        typeof input === 'string' &&
        input.length &&
        context.instancePath.length === 0
    ) {
        try {
            parsedInput = JSON.parse(input);
        } catch (err) {
            context.errors.push({
                message: err instanceof Error ? err.message : `${err},`,
                data: err,
                instancePath: context.instancePath,
                schemaPath: context.schemaPath,
            });
            return undefined;
        }
    }
    if (!isObject(parsedInput)) {
        context.errors.push({
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/union`,
            message: `Error at ${context.instancePath}. Expected object. Got ${typeof parsedInput}.`,
        });
        return undefined;
    }
    for (const [key, value] of Object.entries(union)) {
        if (!(key in parsedInput)) continue;
        const data = parsedInput[key];
        const newContext: ValidationContext = {
            instancePath: `${context.instancePath}/${key}`,
            schemaPath: `${context.schemaPath}/union/${key}`,
            errors: context.errors,
            depth: context.depth + 1,
            maxDepth: context.maxDepth,
            exitOnFirstError: context.exitOnFirstError,
        };
        if (coerce) {
            return {
                [key]: value[VALIDATOR_KEY].coerce(data, newContext),
            };
        }
        return {
            [key]: value[VALIDATOR_KEY].parse(data, newContext),
        };
    }
    context.errors.push({
        message: `No matching union variant. Available variants: [${Object.keys(union).join(', ')}]`,
        instancePath: context.instancePath,
        schemaPath: context.schemaPath,
    });
    return undefined;
}

function parseInternallyTagged(
    union: Record<string, ASchema<any>>,
    tagKey: string,
    input: unknown,
    context: ValidationContext,
    coerce = false,
) {
    let parsedInput = input;
    if (
        typeof input === 'string' &&
        input.length &&
        context.instancePath.length === 0
    ) {
        try {
            parsedInput = JSON.parse(input);
        } catch (err) {
            context.errors.push({
                message: err instanceof Error ? err.message : `${err},`,
                data: err,
                instancePath: context.instancePath,
                schemaPath: context.schemaPath,
            });
            return undefined;
        }
    }
    if (!isObject(parsedInput)) {
        context.errors.push({
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/union`,
            message: `Error at ${context.instancePath}. Expected object. Got ${typeof parsedInput}.`,
        });
        return undefined;
    }
    if (!(tagKey in parsedInput)) {
        context.errors.push({
            instancePath: `${context.instancePath}/${tagKey}`,
            schemaPath: `${context.schemaPath}/tagKey`,
            message: `Error at ${context.instancePath}/${tagKey}. Expected one of [${Object.keys(union).join(', ')}]. Got undefined.`,
        });
        return undefined;
    }
    for (const [key, value] of Object.entries(union)) {
        if (parsedInput[tagKey] !== key) continue;
        const newContext: ValidationContext = {
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/union/${key}`,
            errors: context.errors,
            exitOnFirstError: context.exitOnFirstError,
            depth: context.depth + 1,
            maxDepth: context.maxDepth,
            discriminatorKey: tagKey,
            discriminatorValue: key,
        };
        if (coerce) {
            return value[VALIDATOR_KEY].coerce(parsedInput, newContext);
        }
        return value[VALIDATOR_KEY].parse(parsedInput, newContext);
    }
    context.errors.push({
        instancePath: `${context.instancePath}/${tagKey}`,
        schemaPath: `${context.schemaPath}/tagKey`,
        message: `Error at ${context.instancePath}/${tagKey}. Expected on of [${Object.keys(union).join(', ')}]. Got ${parsedInput[tagKey]}.`,
    });
    return undefined;
}

function parseInternallyTaggedWithValueKey(
    union: Record<string, ASchema<any>>,
    tagKey: string,
    valueKey: string,
    input: unknown,
    context: ValidationContext,
    coerce = false,
) {
    let parsedInput = input;
    if (
        typeof input === 'string' &&
        input.length &&
        context.instancePath.length === 0
    ) {
        try {
            parsedInput = JSON.parse(input);
        } catch (err) {
            context.errors.push({
                message: err instanceof Error ? err.message : `${err},`,
                data: err,
                instancePath: context.instancePath,
                schemaPath: context.schemaPath,
            });
            return undefined;
        }
    }
    if (!isObject(parsedInput)) {
        context.errors.push({
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/union`,
            message: `Error at ${context.instancePath}. Expected object. Got ${typeof parsedInput}.`,
        });
        return undefined;
    }
    if (!(tagKey in parsedInput)) {
        context.errors.push({
            instancePath: `${context.instancePath}/${tagKey}`,
            schemaPath: `${context.schemaPath}/tagKey`,
            message: `Error at ${context.instancePath}/${tagKey}. Expected one of [${Object.keys(union).join(', ')}]. Got undefined.`,
        });
        return undefined;
    }
    if (!(valueKey in parsedInput)) {
        context.errors.push({
            instancePath: `${context.instancePath}/${valueKey}`,
            schemaPath: `${context.schemaPath}/valueKey`,
            message: `Error at ${context.instancePath}/${valueKey}. Expected value got undefined.`,
        });
        return undefined;
    }
    for (const [key, value] of Object.entries(union)) {
        if (parsedInput[tagKey] !== key) continue;
        const newContext: ValidationContext = {
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/union/${key}`,
            errors: context.errors,
            exitOnFirstError: context.exitOnFirstError,
            depth: context.depth + 1,
            maxDepth: context.maxDepth,
        };
        if (coerce) {
            const result = value[VALIDATOR_KEY].coerce(
                parsedInput[valueKey],
                newContext,
            );
            return {
                [tagKey]: key,
                [valueKey]: result,
            };
        }
        const result = value[VALIDATOR_KEY].parse(
            parsedInput[valueKey],
            newContext,
        );
        return {
            [tagKey]: key,
            [valueKey]: result,
        };
    }
    context.errors.push({
        instancePath: `${context.instancePath}/${tagKey}`,
        schemaPath: `${context.schemaPath}/tagKey`,
        message: `Error at ${context.instancePath}/${tagKey}. Expected on of [${Object.keys(union).join(', ')}]. Got ${parsedInput[tagKey]}.`,
    });
    return undefined;
}

function serializeExternallyTagged<T extends Record<string, any>>(
    union: Record<string, ASchema<any>>,
    input: T,
    context: ValidationContext,
): string {
    const strParts: string[] = [];
    for (const [key, value] of Object.entries(union)) {
        if (typeof input[key] === 'undefined') continue;
        strParts.push(
            `"${key}":${value[VALIDATOR_KEY].serialize(input[key], {
                instancePath: `${context.instancePath}/${key}`,
                schemaPath: `${context.schemaPath}/union/${key}`,
                errors: context.errors,
                depth: context.depth + 1,
                maxDepth: context.maxDepth,
                exitOnFirstError: context.exitOnFirstError,
            })}`,
        );
        break;
    }
    return `{${strParts.join(',')}}`;
}

function serializeInternallyTagged<T extends Record<string, any>>(
    union: Record<string, ASchema<any>>,
    tagKey: string,
    input: T,
    context: ValidationContext,
): string | undefined {
    const tagKeyValue = input[tagKey] ?? '';
    const targetSchema = union[tagKeyValue];
    if (!targetSchema) {
        context.errors.push(unionMappingError(tagKeyValue, context));
        return undefined;
    }
    const result = targetSchema[VALIDATOR_KEY].serialize(input, {
        instancePath: context.instancePath,
        schemaPath: `${context.schemaPath}/union/${tagKeyValue}`,
        errors: context.errors,
        discriminatorKey: tagKey,
        discriminatorValue: tagKeyValue,
        depth: context.depth,
        maxDepth: context.maxDepth,
        exitOnFirstError: context.exitOnFirstError,
    });
    return result;
}

function serializeInternallyTaggedWithValueKey<T extends Record<string, any>>(
    union: Record<string, ASchema<any>>,
    tagKey: string,
    valueKey: string,
    input: T,
    context: ValidationContext,
) {
    const tagKeyValue = input[tagKey] ?? '';
    const targetSchema = union[tagKeyValue];
    if (!targetSchema) {
        context.errors.push(unionMappingError(tagKeyValue, context));
        return undefined;
    }
    let result = '{';
    result += `"${tagKey}":"${tagKeyValue}","${valueKey}":`;
    const newContext: ValidationContext = {
        instancePath: `${context.instancePath}/${valueKey}`,
        schemaPath: `${context.schemaPath}/union/${tagKeyValue}`,
        errors: context.errors,
        exitOnFirstError: context.exitOnFirstError,
        depth: context.depth + 1,
        maxDepth: context.maxDepth,
    };
    result +=
        targetSchema[VALIDATOR_KEY].serialize(
            input[valueKey] ?? {},
            newContext,
        ) ?? 'null';
    result += '}';
    return result;
}

function unionMappingError(tagKeyValue: string, data: ValidationContext) {
    return {
        message: `Error fetching union schema. Union for "${tagKeyValue}" is undefined.`,
        instancePath: data.instancePath,
        schemaPath: data.schemaPath,
    } satisfies ValueError;
}

// --- UTILITY TYPES ---

/**
 * Distributes over a union of objects and converts each object into a tuple.
 * { foo: A } | { bar: B }  ->  ["foo", A] | ["bar", B]
 */
export type UnwrapUnion<T> = T extends any
    ? keyof T extends string
        ? [keyof T, T[keyof T]]
        : never
    : never;

/**
 * Converts a union to an intersection.
 * A | B -> A & B
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I,
) => void
    ? I
    : never;

/**
 * Creates an exhaustive dictionary of handlers for each variant in the union.
 */
export type MatchUnionHandlers<T, TReturn> = UnionToIntersection<
    T extends any
        ? keyof T extends string
            ? { [K in keyof T]: (val: T[keyof T]) => TReturn }
            : never
        : never
>;

// --- HELPER FUNCTIONS ---

export function unwrapUnion<T>(input: T): UnwrapUnion<T> {
    const key = Object.keys(input as any)[0];
    if (typeof key === 'undefined') return [undefined, undefined] as any;
    return [key, (input as any)[key]] as any;
}

export function matchUnion<T, TReturn>(
    input: T,
    handlers: MatchUnionHandlers<T, TReturn>,
): TReturn {
    const key = Object.keys(input as any)[0] as keyof MatchUnionHandlers<
        T,
        TReturn
    >;
    const handler = handlers[key] as any;
    return handler((input as any)[key]);
}
