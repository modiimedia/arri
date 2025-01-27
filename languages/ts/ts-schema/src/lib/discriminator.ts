import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../adapters';
import { ValueError } from '../errors';
import {
    type ADiscriminatorSchema,
    ADiscriminatorSchemaWithAdapters,
    type AObjectSchema,
    type ASchemaOptions,
    type InferType,
    isObject,
    type ResolveObject,
    SchemaValidator,
    type ValidationContext,
    VALIDATOR_KEY,
} from '../schemas';

/**
 * Create a discriminated union / tagged union
 *
 * This is an implementation of https://jsontypedef.com/docs/jtd-in-5-minutes/#discriminator-schemas
 *
 * @example
 * const Schema = a.discriminator("eventType", {
 *   CREATED: a.object({
 *     id: a.string(),
 *     createdAt: a.timestamp(),
 *   }),
 *   UPDATED: a.object({
 *     id: a.string(),
 *     createdAt: a.timestamp(),
 *     updatedAt: a.timestamp(),
 *   })
 * })
 * a.validate(Schema, {
 *   eventType: "CREATED",
 *   id: "1",
 *   createdAt: new Date()
 * }) // true
 * a.validate(Schema, {
 *   eventType: "UPDATED",
 *   id: "2",
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * }) // true
 * a.validate(Schema, {
 *   eventType: "DELETED",
 *   id: "1",
 *   createdAt: new Date(),
 * }) // false
 */
export function discriminator<
    TDiscriminatorKey extends string,
    TMapping extends Record<string, AObjectSchema<any>>,
>(
    discriminator: TDiscriminatorKey,
    mapping: TMapping,
    opts?: ASchemaOptions,
): ADiscriminatorSchemaWithAdapters<
    InferDiscriminatorType<
        TDiscriminatorKey,
        TMapping,
        JoinedDiscriminator<TDiscriminatorKey, TMapping>
    >
>;
export function discriminator<
    TDiscriminatorKey extends string,
    TMapping extends Record<string, AObjectSchema<any>>,
>(
    id: string,
    discriminator: TDiscriminatorKey,
    mapping: TMapping,
): ADiscriminatorSchemaWithAdapters<
    InferDiscriminatorType<
        TDiscriminatorKey,
        TMapping,
        JoinedDiscriminator<TDiscriminatorKey, TMapping>
    >
>;
export function discriminator<
    TDiscriminatorKey extends string,
    TMapping extends Record<string, AObjectSchema<any>>,
>(
    propA: string | TDiscriminatorKey,
    propB: TDiscriminatorKey | TMapping,
    propC?: TMapping | ASchemaOptions,
): ADiscriminatorSchemaWithAdapters<
    InferDiscriminatorType<
        TDiscriminatorKey,
        TMapping,
        JoinedDiscriminator<TDiscriminatorKey, TMapping>
    >
> {
    type T = InferType<
        ADiscriminatorSchema<
            InferDiscriminatorType<
                TDiscriminatorKey,
                TMapping,
                JoinedDiscriminator<TDiscriminatorKey, TMapping>
            >
        >
    >;
    const isIdShorthand = typeof propB === 'string';
    const discriminator = isIdShorthand ? propB : propA;
    const mapping = (isIdShorthand ? propC : propB) as TMapping;
    const opts = (
        isIdShorthand ? { id: propA } : (propC ?? {})
    ) as ASchemaOptions;
    if (isIdShorthand) {
        opts.id = propA;
    }
    const isType = (input: unknown): input is T => {
        return validate(discriminator, mapping, input);
    };
    const parseType = (
        input: unknown,
        context: ValidationContext,
    ): T | undefined => {
        return parse(discriminator, mapping, input, context, false);
    };
    const validator: SchemaValidator<
        InferDiscriminatorType<
            TDiscriminatorKey,
            TMapping,
            JoinedDiscriminator<TDiscriminatorKey, TMapping>
        >
    > = {
        output: {} as any,
        validate: isType,
        parse: parseType,
        coerce: (input, context) => {
            return parse(discriminator, mapping, input, context, true);
        },
        serialize(input, context) {
            const discriminatorVal = input[discriminator] ?? '';
            const targetSchema = mapping[discriminatorVal];
            if (!targetSchema) {
                context.errors.push(
                    discriminatorMappingError(discriminatorVal, context),
                );
                return undefined;
            }
            const result = targetSchema[VALIDATOR_KEY].serialize(input, {
                instancePath: context.instancePath,
                schemaPath: `${context.schemaPath}/mapping/${discriminatorVal}`,
                errors: context.errors,
                discriminatorKey: discriminator,
                discriminatorValue: discriminatorVal,
                depth: context.depth,
                maxDepth: context.maxDepth,
                exitOnFirstError: context.exitOnFirstError,
            });
            return result;
        },
    };
    const result: ADiscriminatorSchemaWithAdapters<
        InferDiscriminatorType<
            TDiscriminatorKey,
            TMapping,
            JoinedDiscriminator<TDiscriminatorKey, TMapping>
        >
    > = {
        discriminator,
        mapping,
        metadata: {
            id: opts.id,
            description: opts.description,
            isDeprecated: opts.isDeprecated,
        },
        [VALIDATOR_KEY]: validator,
        '~standard': createStandardSchemaProperty(isType, parseType),
    };
    hideInvalidProperties(result);
    return result;
}

type JoinedDiscriminator<
    TUnionKey extends string,
    TInput extends Record<string, AObjectSchema<any>>,
> = {
    [TKey in keyof TInput]: InferType<TInput[TKey]> & Record<TUnionKey, TKey>;
};

type InferDiscriminatorType<
    TDiscriminatorKey extends string,
    TMapping extends Record<string, AObjectSchema<any>>,
    TJoinedMapping extends JoinedDiscriminator<TDiscriminatorKey, TMapping>,
> = ResolveObject<TJoinedMapping[keyof TJoinedMapping]>;

function validate(
    discriminator: string,
    mapping: Record<string, AObjectSchema<any>>,
    input: unknown,
) {
    if (!isObject(input)) {
        return false;
    }
    if (!(discriminator in input)) {
        return false;
    }
    const discriminatorOptions = Object.keys(mapping);
    if (!discriminatorOptions.includes(input[discriminator])) {
        return false;
    }
    const targetSchema = mapping[input[discriminator]];
    if (!targetSchema) {
        return false;
    }
    return targetSchema[VALIDATOR_KEY].validate(input);
}

function parse(
    discriminator: string,
    mapping: Record<string, AObjectSchema<any>>,
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
                message: err instanceof Error ? err.message : `${err}`,
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
            schemaPath: `${context.schemaPath}/discriminator`,
            message: `Error at ${
                context.instancePath
            }. Expected object. Got ${typeof parsedInput}.`,
        });
        return undefined;
    }
    if (!(discriminator in parsedInput)) {
        context.errors.push({
            instancePath: `${context.instancePath}/${discriminator}`,
            schemaPath: `${context.schemaPath}/discriminator`,
            message: `Error at ${context.instancePath}/${discriminator}. Discriminator field "${discriminator}" cannot be undefined`,
        });
        return undefined;
    }
    const acceptedDiscriminatorVals = Object.keys(mapping);
    const discriminatorVal = parsedInput[discriminator];
    if (!acceptedDiscriminatorVals.includes(discriminatorVal)) {
        context.errors.push({
            instancePath: `${context.instancePath}/${discriminator}`,
            schemaPath: `${context.schemaPath}/discriminator`,
            message: `Error at ${context.instancePath}/${discriminator}. "${
                parsedInput[discriminator]
            }" is not one of the accepted discriminator values: [${acceptedDiscriminatorVals.join(
                ', ',
            )}]`,
        });
        return undefined;
    }
    const targetSchema = mapping[parsedInput[discriminator]];
    if (!targetSchema) {
        return undefined;
    }
    if (coerce) {
        const result = targetSchema[VALIDATOR_KEY].coerce(parsedInput, {
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/mapping/${discriminatorVal}`,
            errors: context.errors,
            discriminatorKey: discriminator,
            discriminatorValue: discriminatorVal,
            depth: context.depth + 1,
            maxDepth: context.maxDepth,
            exitOnFirstError: context.exitOnFirstError,
        });
        return result;
    }
    const result = targetSchema[VALIDATOR_KEY].parse(parsedInput, {
        instancePath: context.instancePath,
        schemaPath: `${context.schemaPath}/mapping/${discriminatorVal}`,
        errors: context.errors,
        discriminatorKey: discriminator,
        discriminatorValue: discriminatorVal,
        depth: context.depth + 1,
        maxDepth: context.maxDepth,
        exitOnFirstError: context.exitOnFirstError,
    });
    return result;
}

function discriminatorMappingError(
    discriminatorVal: string,
    data: ValidationContext,
) {
    return {
        message: `Error fetching discriminator schema. Mapping for "${discriminatorVal} is undefined.`,
        instancePath: data.instancePath,
        schemaPath: data.schemaPath,
    } satisfies ValueError;
}
