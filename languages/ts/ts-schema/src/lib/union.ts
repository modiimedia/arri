import { ValidationContext } from '../../dist';
import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    ASchema,
    ASchemaOptions,
    AUnionSchema,
    AUnionSchemaWithAdapters,
    InferType,
    InferUnionType,
    isObject,
    SchemaValidator,
    VALIDATOR_KEY,
    WithAdapters,
} from '../schemas';

export function union<TUnion extends Record<string, ASchema<any>>>(
    union: TUnion,
    opts?: ASchemaOptions,
): AUnionSchemaWithAdapters<InferUnionType<TUnion>>;
export function union<TUnion extends Record<string, ASchema<any>>>(
    id: string,
    union: TUnion,
): AUnionSchemaWithAdapters<InferUnionType<TUnion>>;
export function union<TUnion extends Record<string, ASchema<any>>>(
    propA: string | TUnion,
    propB?: TUnion | ASchemaOptions,
): AUnionSchemaWithAdapters<InferUnionType<TUnion>> {
    type T = InferType<AUnionSchema<InferUnionType<TUnion>>>;
    const isIdShorthand = typeof propA === 'string';
    const union = (isIdShorthand ? propB : propA) as TUnion;
    const opts: ASchemaOptions = isIdShorthand ? { id: propA } : (propB ?? {});
    if (isIdShorthand) {
        opts.id = propA;
    }
    const isType = (input: unknown): input is T => {
        return validate(union, input);
    };
    const parseType = (
        input: unknown,
        context: ValidationContext,
    ): T | undefined => {
        return parse(union, input, context, false) as any;
    };
    const coerceType = (
        input: unknown,
        context: ValidationContext,
    ): T | undefined => {
        return parse(union, input, context, true) as any;
    };
    const validator: SchemaValidator<InferUnionType<TUnion>, false> = {
        output: {} as any,
        optional: false,
        validate: isType,
        parse: parseType,
        coerce: coerceType,
        serialize(input, context) {
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
        },
    };
    const result: AUnionSchemaWithAdapters<InferUnionType<TUnion>> = {
        union: union,
        metadata: opts,
        [VALIDATOR_KEY]: validator,
        '~standard': createStandardSchemaProperty(isType, parseType),
    };
    hideInvalidProperties(result);
    return result;
}

function validate(union: Record<string, ASchema<any>>, input: unknown) {
    if (!isObject(input)) {
        return false;
    }
    for (const key of Object.keys(union)) {
        if (key in input) {
            const data = (input as any)[key];
            return union[key]![VALIDATOR_KEY].validate(data);
        }
    }
    return false;
}

function parse(
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
