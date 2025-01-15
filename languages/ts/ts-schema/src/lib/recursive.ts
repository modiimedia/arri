import * as UValidator from '@arrirpc/schema-interface';

import {
    createStandardSchemaProperty,
    createUValidatorProperty,
    hideInvalidProperties,
} from '../adapters';
import {
    type ADiscriminatorSchema,
    type AObjectSchema,
    type ARefSchema,
    type ASchemaOptions,
    SchemaValidator,
    ValidationsKey,
} from '../schemas';

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
        decode(input, context) {
            if (context.depth >= context.maxDepth) {
                context.errors.push({
                    message: 'Max depth exceeded',
                    instancePath: context.instancePath,
                    schemaPath: context.schemaPath,
                });
                return undefined;
            }
            if (recursiveFns[id]) {
                return recursiveFns[id].decode(input, {
                    ...context,
                    depth: context.depth + 1,
                });
            }
        },
        encode(input, context) {
            if (context.depth >= context.maxDepth) {
                context.errors.push({
                    message: 'Max depth exceeded',
                    instancePath: context.instancePath,
                    schemaPath: context.schemaPath,
                });
                return undefined;
            }
            if (recursiveFns[id]) {
                return recursiveFns[id]!.encode(input, context);
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

    const refSchema: ARefSchema<T> = {
        ref: id,
        [ValidationsKey]: validator,
        [UValidator.v1]: createUValidatorProperty(validator),
        '~standard': createStandardSchemaProperty(
            validator.validate,
            validator.decode,
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
        validate: mainSchema[ValidationsKey].validate,
        decode: mainSchema[ValidationsKey].decode,
        encode: mainSchema[ValidationsKey].encode,
        coerce: mainSchema[ValidationsKey].coerce,
    };
    return mainSchema;
}
