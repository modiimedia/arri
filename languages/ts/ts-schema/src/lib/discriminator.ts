import {
    type ADiscriminatorSchema,
    type AObjectSchema,
    type ASchemaOptions,
    type InferType,
    isObject,
    type ResolveObject,
    validatorKey,
    type ValidationContext,
} from '../schemas';
import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../adapters';
import { ValidationError } from './validation';

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
): ADiscriminatorSchema<
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
): ADiscriminatorSchema<
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
): ADiscriminatorSchema<
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
    const result: ADiscriminatorSchema<
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
            [validatorKey]: {
                output: {} as any,
                validate: isType,
                decode: parseType,
                coerce: (input, context) => {
                    return parse(discriminator, mapping, input, context, true);
                },
                encode(input, context) {
                    const discriminatorVal = input[discriminator] ?? '';
                    const targetSchema = mapping[discriminatorVal];
                    if (!targetSchema) {
                        throw discriminatorMappingError(
                            discriminatorVal,
                            context,
                        );
                    }
                    const result = targetSchema.metadata[validatorKey].encode(
                        input,
                        {
                            instancePath: context.instancePath,
                            schemaPath: `${context.schemaPath}/mapping/${discriminatorVal}`,
                            errors: context.errors,
                            discriminatorKey: discriminator,
                            discriminatorValue: discriminatorVal,
                        },
                    );
                    return result;
                },
            },
        },
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
    return targetSchema.metadata[validatorKey].validate(input);
}

function parse(
    discriminator: string,
    mapping: Record<string, AObjectSchema<any>>,
    input: unknown,
    data: ValidationContext,
    coerce = false,
) {
    let parsedInput = input;
    if (
        typeof input === 'string' &&
        input.length &&
        data.instancePath.length === 0
    ) {
        parsedInput = JSON.parse(input);
    }
    if (!isObject(parsedInput)) {
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: `${data.schemaPath}/discriminator`,
            message: `Error at ${
                data.instancePath
            }. Expected object. Got ${typeof parsedInput}.`,
        });
        return undefined;
    }
    if (!(discriminator in parsedInput)) {
        data.errors.push({
            instancePath: `${data.instancePath}/${discriminator}`,
            schemaPath: `${data.schemaPath}/discriminator`,
            message: `Error at ${data.instancePath}/${discriminator}. Discriminator field "${discriminator}" cannot be undefined`,
        });
        return undefined;
    }
    const acceptedDiscriminatorVals = Object.keys(mapping);
    const discriminatorVal = parsedInput[discriminator];
    if (!acceptedDiscriminatorVals.includes(discriminatorVal)) {
        data.errors.push({
            instancePath: `${data.instancePath}/${discriminator}`,
            schemaPath: `${data.schemaPath}/discriminator`,
            message: `Error at ${data.instancePath}/${discriminator}. "${
                parsedInput[discriminator]
            }" is not one of the accepted discriminator values: [${acceptedDiscriminatorVals.join(
                ', ',
            )}]`,
        });
        return undefined;
    }
    const targetSchema = mapping[parsedInput[discriminator]];
    if (!targetSchema) {
        throw discriminatorMappingError(discriminatorVal, data);
    }
    if (coerce) {
        const result = targetSchema.metadata[validatorKey].coerce(parsedInput, {
            instancePath: data.instancePath,
            schemaPath: `${data.schemaPath}/mapping/${discriminatorVal}`,
            errors: data.errors,
            discriminatorKey: discriminator,
            discriminatorValue: discriminatorVal,
        });
        return result;
    }
    const result = targetSchema.metadata[validatorKey].decode(parsedInput, {
        instancePath: data.instancePath,
        schemaPath: `${data.schemaPath}/mapping/${discriminatorVal}`,
        errors: data.errors,
        discriminatorKey: discriminator,
        discriminatorValue: discriminatorVal,
    });
    return result;
}

function discriminatorMappingError(
    discriminatorVal: string,
    data: ValidationContext,
) {
    return new ValidationError({
        message: `Error fetching discriminator schema for "${discriminatorVal}"`,
        errors: [
            {
                message: 'Error fetching discriminator schema',
                instancePath: data.instancePath,
                schemaPath: data.schemaPath,
            },
        ],
    });
}
