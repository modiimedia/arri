import { ValidationError } from "ajv";
import { type SchemaFormDiscriminator } from "@modii/jtd";
import { AJV } from "./validation";
import {
    ADiscriminatorSchema,
    AObjectSchema,
    ASchemaOptions,
    InferType,
    ResolveObject,
    SCHEMA_METADATA,
} from "../schemas";

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
    const schema: SchemaFormDiscriminator = {
        discriminator,
        mapping,
    };
    const validator = AJV.compile(schema as any);
    const isType = (
        input: unknown,
    ): input is InferDiscriminatorType<
        TDiscriminatorKey,
        TMapping,
        JoinedDiscriminator<TDiscriminatorKey, TMapping>
    > => validator(input);
    const parser = AJV.compileParser(schema);
    const serializer = AJV.compileSerializer(schema);
    return {
        ...(schema as any),
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: {} as any,
                validate: isType,
                parse: (input: unknown) => {
                    if (typeof input === "string") {
                        const result = parser(input);
                        if (isType(result)) {
                            return result;
                        }
                        throw new ValidationError(validator.errors ?? []);
                    }
                    if (isType(input)) {
                        return input;
                    }
                    throw new ValidationError(validator.errors ?? []);
                },
                coerce: (input) => {
                    if (typeof input === "string") {
                        const result = parser(input);
                        if (isType(result)) {
                            return result;
                        }
                        throw new ValidationError(validator.errors ?? []);
                    }
                    if (isType(input)) {
                        return input;
                    }
                    throw new ValidationError(validator.errors ?? []);
                },
                serialize: serializer,
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
