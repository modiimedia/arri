import {
    type ADiscriminatorSchema,
    type AObjectSchema,
    type ASchemaOptions,
    type InferType,
    type ResolveObject,
    SCHEMA_METADATA,
    isObject,
    type ValidationData,
} from "../schemas";

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
    opts: ASchemaOptions = {},
): ADiscriminatorSchema<
    InferDiscriminatorType<
        TDiscriminatorKey,
        TMapping,
        JoinedDiscriminator<TDiscriminatorKey, TMapping>
    >
> {
    return {
        discriminator,
        mapping,
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: {} as any,
                validate(
                    input,
                ): input is InferType<
                    ADiscriminatorSchema<
                        InferDiscriminatorType<
                            TDiscriminatorKey,
                            TMapping,
                            JoinedDiscriminator<TDiscriminatorKey, TMapping>
                        >
                    >
                > {
                    return validate(discriminator, mapping, input);
                },
                parse(input, data) {
                    return parse(discriminator, mapping, input, data, false);
                },
                coerce: (input, data) => {
                    return parse(discriminator, mapping, input, data, true);
                },
                serialize(input, data) {
                    const discriminatorVal = input[discriminator];
                    const targetSchema = mapping[discriminatorVal];
                    return targetSchema.metadata[SCHEMA_METADATA].serialize(
                        input,
                        {
                            instancePath: data.instancePath,
                            schemaPath: `${data.schemaPath}/mapping/${discriminatorVal}`,
                            errors: data.errors,
                            discriminatorKey: discriminator,
                            discriminatorValue: discriminatorVal,
                        },
                    );
                },
            },
        },
    };
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
    return targetSchema.metadata[SCHEMA_METADATA].validate(input);
}

function parse(
    discriminator: string,
    mapping: Record<string, AObjectSchema<any>>,
    input: unknown,
    data: ValidationData,
    coerce = false,
) {
    let parsedInput = input;
    if (typeof input === "string" && data.instancePath.length === 0) {
        parsedInput = JSON.parse(input);
    }
    if (!isObject(parsedInput)) {
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: data.schemaPath,
            message: `Expected object. Got ${typeof parsedInput}.`,
        });
        return undefined;
    }
    if (!(discriminator in parsedInput)) {
        data.errors.push({
            instancePath: `${data.instancePath}/${discriminator}`,
            schemaPath: `${data.schemaPath}/discriminator`,
            message: `Discriminator field "${discriminator}" cannot be undefined`,
        });
        return undefined;
    }
    const acceptedDiscriminatorVals = Object.keys(mapping);
    const discriminatorVal = parsedInput[discriminator];
    if (!acceptedDiscriminatorVals.includes(discriminatorVal)) {
        data.errors.push({
            instancePath: `${data.instancePath}/${discriminator}`,
            schemaPath: `${data.schemaPath}/discriminator`,
            message: `"${
                parsedInput[discriminator]
            }" is not one of the accepted discriminator values: [${acceptedDiscriminatorVals.join(
                ", ",
            )}]`,
        });
        return undefined;
    }
    const targetSchema = mapping[parsedInput[discriminator]];
    if (coerce) {
        const result = targetSchema.metadata[SCHEMA_METADATA].coerce(
            parsedInput,
            {
                instancePath: data.instancePath,
                schemaPath: `${data.schemaPath}/mapping/${discriminatorVal}`,
                errors: data.errors,
                discriminatorKey: discriminator,
                discriminatorValue: discriminatorVal,
            },
        );
        return result;
    }
    const result = targetSchema.metadata[SCHEMA_METADATA].parse(parsedInput, {
        instancePath: data.instancePath,
        schemaPath: `${data.schemaPath}/mapping/${discriminatorVal}`,
        errors: data.errors,
        discriminatorKey: discriminator,
        discriminatorValue: discriminatorVal,
    });
    return result;
}
