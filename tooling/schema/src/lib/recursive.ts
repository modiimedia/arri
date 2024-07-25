import {
    type ADiscriminatorSchema,
    type AObjectSchema,
    type ARefSchema,
    type ASchemaOptions,
    SCHEMA_METADATA,
    type ValidationContext,
} from "../schemas";

let recursiveTypeCount = 0;

type RecursiveCallback<T> = (
    self: ARefSchema<T>,
) => AObjectSchema<T> | ADiscriminatorSchema<T>;

/**
 * @example
 * ```ts
 * type BinaryTree = {
 *   left: BinaryTree | null;
 *   right: BinaryTree | null;
 * }
 *
 * const BinaryTree = a.recursive<BinaryTree>(
 *   (self) => a.object({
 *     left: a.nullable(self),
 *     right: a.nullable(self),
 *   })
 * );
 * ```
 */
export function recursive<T = any>(
    callback: RecursiveCallback<T>,
    metadata?: ASchemaOptions,
): AObjectSchema<T> | ADiscriminatorSchema<T>;
/**
 * Recursive ID Shorthand
 *
 * @example
 * ```ts
 * type BinaryTree = {
 *   left: BinaryTree | null;
 *   right: BinaryTree | null;
 * }
 *
 * const BinaryTree = a.recursive<BinaryTree>(
 *   "BinaryTree",
 *   (self) => a.object({
 *     left: a.nullable(self),
 *     right: a.nullable(self),
 *   })
 * );
 * ```
 */
export function recursive<T = any>(
    id: string,
    callback: RecursiveCallback<T>,
): AObjectSchema<T> | ADiscriminatorSchema<T>;
export function recursive<T = any>(
    propA: RecursiveCallback<T> | string,
    propB?: ASchemaOptions | RecursiveCallback<T>,
): AObjectSchema<T> | ADiscriminatorSchema<T> {
    const isIdShorthand = typeof propA === "string";
    const callback = isIdShorthand ? (propB as RecursiveCallback<T>) : propA;
    const options = isIdShorthand
        ? { id: propA }
        : ((propB ?? {}) as ASchemaOptions);
    const recursiveFns: Record<
        string,
        {
            validate: (input: unknown) => any;
            parse: (input: unknown, data: ValidationContext) => any;
            coerce: (input: unknown, data: ValidationContext) => any;
            serialize: (input: unknown, data: ValidationContext) => any;
        }
    > = {};
    if (!options.id) {
        recursiveTypeCount++;
        console.warn(
            `[@arrirpc/schema] WARNING: It is highly recommended to specify an ID for recursive types.`,
        );
    }
    const id = options.id ?? `TypeRef${recursiveTypeCount}`;
    const mainSchema = callback({
        ref: id,
        metadata: {
            [SCHEMA_METADATA]: {
                output: "" as T,
                parse(input, context) {
                    if (recursiveFns[id]) {
                        return recursiveFns[id]!.parse(input, context);
                    }
                },
                serialize(input, context) {
                    if (recursiveFns[id]) {
                        return recursiveFns[id]!.serialize(input, context);
                    }
                    return "";
                },
                validate(input): input is T {
                    if (recursiveFns[id]) {
                        return recursiveFns[id]!.validate(input);
                    }
                    return false;
                },
                coerce(input, context) {
                    if (recursiveFns[id]) {
                        return recursiveFns[id]!.coerce(input, context);
                    }
                },
            },
        },
    });
    mainSchema.metadata.id = id;
    mainSchema.metadata.description =
        options?.description ?? mainSchema.metadata.description;
    mainSchema.metadata.isDeprecated =
        options?.isDeprecated ?? mainSchema.metadata.isDeprecated;
    recursiveFns[id] = {
        validate: mainSchema.metadata[SCHEMA_METADATA].validate,
        parse: mainSchema.metadata[SCHEMA_METADATA].parse,
        serialize: mainSchema.metadata[SCHEMA_METADATA].serialize as any,
        coerce: mainSchema.metadata[SCHEMA_METADATA].coerce,
    };

    return mainSchema;
}
