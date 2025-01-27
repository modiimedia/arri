import {
    createStandardSchemaProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    ADiscriminatorSchemaWithAdapters,
    AObjectSchemaWithAdapters,
    type ARefSchema,
    ARefSchemaWithAdapters,
    type ASchemaOptions,
    SchemaValidator,
    VALIDATOR_KEY,
} from '../schemas';

let recursiveTypeCount = 0;

type RecursiveCallback<T> = (
    self: ARefSchema<T>,
) => AObjectSchemaWithAdapters<T> | ADiscriminatorSchemaWithAdapters<T>;

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
): AObjectSchemaWithAdapters<T> | ADiscriminatorSchemaWithAdapters<T>;
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
): AObjectSchemaWithAdapters<T> | ADiscriminatorSchemaWithAdapters<T>;
export function recursive<T = any>(
    propA: RecursiveCallback<T> | string,
    propB?: ASchemaOptions | RecursiveCallback<T>,
): AObjectSchemaWithAdapters<T> | ADiscriminatorSchemaWithAdapters<T> {
    const isIdShorthand = typeof propA === 'string';
    const callback = isIdShorthand ? (propB as RecursiveCallback<T>) : propA;
    const options = isIdShorthand
        ? { id: propA }
        : ((propB ?? {}) as ASchemaOptions);

    if (!options.id) {
        recursiveTypeCount++;
        console.warn(
            `[@arrirpc/schema] WARNING: It is highly recommended to specify an ID for recursive types.`,
        );
    }
    const id = options.id ?? `TypeRef${recursiveTypeCount}`;
    const recursiveFns: Record<
        string,
        Omit<SchemaValidator<any>, 'output'>
    > = {};
    const validator: SchemaValidator<T> = {
        output: '' as T,
        parse(input, context) {
            if (context.depth >= context.maxDepth) {
                context.errors.push({
                    message: 'Max depth exceeded',
                    instancePath: context.instancePath,
                    schemaPath: context.schemaPath,
                });
                return undefined;
            }
            if (recursiveFns[id]) {
                return recursiveFns[id].parse(input, {
                    ...context,
                    depth: context.depth + 1,
                });
            }
        },
        serialize(input, context) {
            if (context.depth >= context.maxDepth) {
                context.errors.push({
                    message: 'Max depth exceeded',
                    instancePath: context.instancePath,
                    schemaPath: context.schemaPath,
                });
                return undefined;
            }
            if (recursiveFns[id]) {
                return recursiveFns[id]!.serialize(input, context);
            }
            return '';
        },
        validate(input): input is T {
            if (recursiveFns[id]) {
                return recursiveFns[id]!.validate(input);
            }
            return false;
        },
        coerce(input, context) {
            if (context.depth >= context.maxDepth) {
                context.errors.push({
                    message: 'Max depth exceeded',
                    instancePath: context.instancePath,
                    schemaPath: context.schemaPath,
                });
                return undefined;
            }
            if (recursiveFns[id]) {
                return recursiveFns[id]!.coerce(input, context);
            }
        },
    };

    const refSchema: ARefSchemaWithAdapters<T> = {
        ref: id,
        [VALIDATOR_KEY]: validator,
        '~standard': createStandardSchemaProperty(
            validator.validate,
            validator.parse,
        ),
    };
    hideInvalidProperties(refSchema);
    const mainSchema = callback(refSchema);
    if (!mainSchema.metadata) mainSchema.metadata = {};
    mainSchema.metadata.id = id;
    mainSchema.metadata.description =
        options?.description ?? mainSchema.metadata.description;
    mainSchema.metadata.isDeprecated =
        options?.isDeprecated ?? mainSchema.metadata.isDeprecated;
    recursiveFns[id] = {
        validate: mainSchema[VALIDATOR_KEY].validate,
        parse: mainSchema[VALIDATOR_KEY].parse,
        serialize: mainSchema[VALIDATOR_KEY].serialize,
        coerce: mainSchema[VALIDATOR_KEY].coerce,
    };
    return mainSchema;
}
