import { ValidationError } from "ajv";
import { type SchemaFormDiscriminator } from "jtd";
import { type ObjectSchema } from "./object";
import {
    type InputOptions,
    type ArriSchema,
    SCHEMA_METADATA,
    type InferType,
    type ResolveObject,
} from "./typedefs";
import { AJV } from "./validation";

type JoinedDiscriminator<
    TUnionKey extends string,
    TInput extends Record<string, ObjectSchema<any>>,
> = {
    [TKey in keyof TInput]: InferType<TInput[TKey]> & Record<TUnionKey, TKey>;
};

export interface DiscriminatorSchema<T> extends ArriSchema<T> {
    discriminator: string;
    mapping: Record<string, ObjectSchema<any>>;
}

type InferDiscriminatorType<
    TDiscriminatorKey extends string,
    TMapping extends Record<string, ObjectSchema<any>>,
    TJoinedMapping extends JoinedDiscriminator<TDiscriminatorKey, TMapping>,
> = ResolveObject<TJoinedMapping[keyof TJoinedMapping]>;

export function discriminator<
    TDiscriminatorKey extends string,
    TMapping extends Record<string, ObjectSchema<any>>,
>(
    discriminator: TDiscriminatorKey,
    mapping: TMapping,
    opts: InputOptions = {},
): DiscriminatorSchema<
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
