import {
    AObjectSchema,
    ASchema,
    VALIDATOR_KEY,
    ValueError,
} from '@arrirpc/schema';
import { hideInvalidProperties } from '@arrirpc/schema/dist/adapters';
import { OptionalKind, type TObject, TSchema } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Value, type ValueErrorIterator } from '@sinclair/typebox/value';
import { jsonSchemaToJtdSchema, type JsonSchemaType } from 'json-schema-to-atd';

// strip out Typebox symbols so to prevent TS inference errors
type CleanedTSchema = Omit<TSchema, symbol>;

// infer the static type of a Typebox schema that has had its symbols omitted
export type CleanedStatic<
    T extends CleanedTSchema,
    P extends unknown[] = [],
> = (T & {
    params: P;
})['static'];

type CleanedTObject = Omit<TObject, symbol>;

export function typeboxAdapter<TInput extends CleanedTSchema>(
    input: TInput,
): TInput extends CleanedTObject
    ? AObjectSchema<CleanedStatic<TInput>>
    : ASchema<CleanedStatic<TInput>> {
    const schema = jsonSchemaToJtdSchema(input as unknown as JsonSchemaType);
    const compiled = TypeCompiler.Compile<any>(input);
    const validationMethods: ASchema<
        CleanedStatic<TInput>
    >[typeof VALIDATOR_KEY] = {
        output: {} as any as CleanedStatic<TInput>,
        optional: (input as any)[OptionalKind] === 'Optional',
        parse(val: unknown, context) {
            if (typeof val === 'string') {
                const parsedVal = JSON.parse(val);
                if (compiled.Check(parsedVal)) {
                    return parsedVal;
                }
                context.errors = typeboxErrorsToArriErrors(
                    compiled.Errors(parsedVal),
                );
                return undefined;
            }
            if (compiled.Check(val)) {
                return val;
            }
            context.errors = typeboxErrorsToArriErrors(compiled.Errors(val));
            return undefined;
        },
        coerce(val: unknown, context): any {
            try {
                return Value.Cast(input as any, val);
            } catch (err) {
                context.errors.push({
                    instancePath: '/',
                    message: err instanceof Error ? err.message : `${err}`,
                });
                return undefined;
            }
        },
        validate(val: unknown): val is CleanedStatic<TInput> {
            return compiled.Check(val);
        },
        serialize(val: CleanedStatic<TInput>, context) {
            try {
                return compiled.Encode(val);
            } catch (err) {
                context.errors.push({
                    instancePath: '/',
                    message: err instanceof Error ? err.message : `${err}`,
                });
                return undefined;
            }
        },
    };
    const result: ASchema<CleanedStatic<TInput>> = {
        ...schema,
        metadata: {
            id: input.$id ?? input.title,
            description: input.description,
        },
        [VALIDATOR_KEY]: validationMethods,
    };
    hideInvalidProperties(result);
    return result as any;
}

function typeboxErrorsToArriErrors(errs: ValueErrorIterator): ValueError[] {
    const mappedErrs: ValueError[] = [];
    for (const err of errs) {
        const obj: ValueError = {
            message: err.message,
            instancePath: err.path,
            schemaPath: '',
            data: err.value,
        };
        mappedErrs.push(obj);
    }
    return mappedErrs;
}
