import {
    type ASchemaOptions,
    type AStringEnumSchema,
    SCHEMA_METADATA,
    ValidationContext,
} from '../schemas';
import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../standardSchema';

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
    const isIdShorthand = typeof paramA === 'string';
    const enumVal = isIdShorthand ? (paramB as TValues) : paramA;
    const meta = isIdShorthand
        ? { id: paramA }
        : (paramB as ASchemaOptions | undefined);
    const isType = (input: unknown): input is TKeys => {
        if (typeof input !== 'string') {
            return false;
        }
        for (const val of enumVal) {
            if (val === input) {
                return true;
            }
        }
        return false;
    };
    const parse = (input: unknown, context: ValidationContext) => {
        if (isType(input)) {
            return input;
        }
        context.errors.push({
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/enum`,
            message: `Error at ${
                context.instancePath
            }. Invalid enum value. Expected one of the following values: [${enumVal.join(
                ', ',
            )}]`,
        });
        return undefined;
    };
    const result: AStringEnumSchema<TValues> = {
        enum: enumVal,
        metadata: {
            id: meta?.id,
            description: meta?.description,
            isDeprecated: meta?.isDeprecated,
            [SCHEMA_METADATA]: {
                output: paramA[0] ?? ('' as any),
                parse,
                coerce: (input, context) => {
                    if (isType(input)) {
                        return input;
                    }
                    context.errors.push({
                        instancePath: context.instancePath,
                        schemaPath: `${context.schemaPath}/enum`,
                        message: `Error at ${
                            context.instancePath
                        }. Invalid enum value. Expected one of the following values: [${enumVal.join(
                            ', ',
                        )}]`,
                    });
                    return undefined;
                },
                validate: isType,
                serialize(input, context) {
                    if (context.instancePath.length === 0) {
                        return input;
                    }
                    return `"${input}"`;
                },
            },
        },
        '~standard': createStandardSchemaProperty(isType, parse),
    };
    hideInvalidProperties(result);
    return result;
}
