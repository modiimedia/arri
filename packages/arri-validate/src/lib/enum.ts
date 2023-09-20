import {
    type ASchemaOptions,
    type AStringEnumSchema,
    SCHEMA_METADATA,
} from "../schemas";

/**
 * An enumeration of string values
 *
 * This is an implementation of:
 * https://jsontypedef.com/docs/jtd-in-5-minutes/#enum-schemas
 */
export function stringEnum<
    TKeys extends string,
    TValues extends TKeys[],
    TNullable extends boolean = false,
>(
    values: TValues,
    opts: ASchemaOptions = {},
): AStringEnumSchema<TValues, TNullable> {
    const isType = (input: unknown): input is TKeys => {
        if (typeof input !== "string") {
            return false;
        }
        for (const val of values) {
            if (val === input) {
                return true;
            }
        }
        return false;
    };
    return {
        enum: values,
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: values[0],
                parse(input, data) {
                    if (isType(input)) {
                        return input;
                    }
                    data.errors.push({
                        instancePath: data.instancePath,
                        schemaPath: `${data.schemaPath}/enum`,
                        message: `Invalid enum value. Expected one of the following values: [${values.join(
                            ", ",
                        )}]`,
                    });
                    return undefined;
                },
                coerce: (input, data) => {
                    if (isType(input)) {
                        return input;
                    }
                    data.errors.push({
                        instancePath: data.instancePath,
                        schemaPath: `${data.schemaPath}/enum`,
                        message: `Invalid enum value. Expected one of the following values: [${values.join(
                            ", ",
                        )}]`,
                    });
                    return undefined;
                },
                validate: isType,
                serialize: (input) => input?.toString() ?? "null",
            },
        },
    };
}
