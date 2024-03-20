import {
    type ASchema,
    type ASchemaOptions,
    SCHEMA_METADATA,
    type ARefSchema,
    type AObjectSchema,
    type ADiscriminatorSchema,
    type ValidationData,
} from "../schemas";

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

let recursiveTypeCount = 0;

const recursiveFns: Record<
    string,
    {
        validate: (input: unknown) => any;
        parse: (input: unknown, data: ValidationData) => any;
        coerce: (input: unknown, data: ValidationData) => any;
        serialize: (input: unknown, data: ValidationData) => any;
    }
> = {};

export function recursive<T>(
    callback: (
        self: ARefSchema<T>,
    ) => AObjectSchema<T> | ADiscriminatorSchema<T>,
    options: WithRequired<ASchemaOptions, "id">,
): ASchema<T> {
    if (!options?.id) {
        recursiveTypeCount++;
    }
    const id = options?.id ?? `TypeRef${recursiveTypeCount}`;
    const mainSchema = callback({
        ref: id,
        metadata: {
            [SCHEMA_METADATA]: {
                output: "" as T,
                parse(input, data) {
                    if (recursiveFns[id]) {
                        return recursiveFns[id].parse(input, data);
                    }
                },
                serialize(input, data) {
                    if (recursiveFns[id]) {
                        return recursiveFns[id].serialize(input, data);
                    }
                    return "";
                },
                validate(input): input is T {
                    if (recursiveFns[id]) {
                        return recursiveFns[id].validate(input);
                    }
                    return false;
                },
                coerce(input, data) {
                    if (recursiveFns[id]) {
                        return recursiveFns[id].coerce(input, data);
                    }
                },
            },
        },
    });
    mainSchema.metadata.id = id;
    mainSchema.metadata.description =
        options.description ?? mainSchema.metadata.description;
    mainSchema.metadata.isDeprecated =
        options.isDeprecated ?? mainSchema.metadata.isDeprecated;
    recursiveFns[id] = {
        validate: mainSchema.metadata[SCHEMA_METADATA].validate,
        parse: mainSchema.metadata[SCHEMA_METADATA].parse,
        serialize: mainSchema.metadata[SCHEMA_METADATA].serialize as any,
        coerce: mainSchema.metadata[SCHEMA_METADATA].coerce,
    };

    return mainSchema;
}
