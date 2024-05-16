import {
    type ASchemaOptions,
    type AStringEnumSchema,
    SCHEMA_METADATA,
} from "../schemas";

export const stringEnum = enumerator;

/**
 * An enumeration of string values
 *
 * This is an implementation of:
 * https://jsontypedef.com/docs/jtd-in-5-minutes/#enum-schemas
 *
 * @example
 * const Schema = a.enumerator(["A", "B"])
 * a.validate(Schema, "A") // true
 * a.validate(Schema, "B") // true
 * a.validate(Schema, "C") // false
 */
export function enumerator<TKeys extends string, TValues extends TKeys[]>(
    values: TValues,
    opts?: ASchemaOptions,
): AStringEnumSchema<TValues>;
/**
 * An enumeration of string values
 *
 * This is an implementation of:
 * https://jsontypedef.com/docs/jtd-in-5-minutes/#enum-schemas
 *
 * @example
 * const Schema = a.enumerator("Schema", ["A", "B"])
 * a.validate(Schema, "A") // true
 * a.validate(Schema, "B") // true
 * a.validate(Schema, "C") // false
 */
export function enumerator<TKeys extends string, TValues extends TKeys[]>(
    id: string,
    values: TValues,
): AStringEnumSchema<TValues>;
export function enumerator<TKeys extends string, TValues extends TKeys[]>(
    paramA: TValues | string,
    paramB?: ASchemaOptions | TValues,
): AStringEnumSchema<TValues> {
    const isIdShorthand = typeof paramA === "string";
    const enumVal = isIdShorthand ? (paramB as TValues) : paramA;
    const meta = isIdShorthand
        ? { id: paramA }
        : (paramB as ASchemaOptions | undefined);
    const isType = (input: unknown): input is TKeys => {
        if (typeof input !== "string") {
            return false;
        }
        for (const val of enumVal) {
            if (val === input) {
                return true;
            }
        }
        return false;
    };
    return {
        enum: enumVal,
        metadata: {
            id: meta?.id,
            description: meta?.description,
            isDeprecated: meta?.isDeprecated,
            [SCHEMA_METADATA]: {
                output: paramA[0] ?? ("" as any),
                parse(input, data) {
                    if (isType(input)) {
                        return input;
                    }
                    data.errors.push({
                        instancePath: data.instancePath,
                        schemaPath: `${data.schemaPath}/enum`,
                        message: `Error at ${
                            data.instancePath
                        }. Invalid enum value. Expected one of the following values: [${enumVal.join(
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
                        message: `Error at ${
                            data.instancePath
                        }. Invalid enum value. Expected one of the following values: [${enumVal.join(
                            ", ",
                        )}]`,
                    });
                    return undefined;
                },
                validate: isType,
                serialize(input, data) {
                    if (data.instancePath.length === 0) {
                        return input;
                    }
                    return `"${input}"`;
                },
            },
        },
    };
}
