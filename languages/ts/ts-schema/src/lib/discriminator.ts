import {
    ASchema,
    type ASchemaOptions,
    AUnionSchemaWithAdapters,
    InferInternallyTaggedUnionType,
    MergedInternallyTaggedUnion,
} from '../schemas';
import { union } from './union';

export interface ADiscriminatorSchemaOptions<
    T extends string | undefined = undefined,
> extends ASchemaOptions {
    valueKey?: T;
}

/**
 * Create a tagged union with a discriminator key such as "type"
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
    TTagKey extends string,
    TMapping extends Record<string, ASchema<any>>,
    TValueKey extends string | undefined = undefined,
>(
    tag: TTagKey,
    mapping: TMapping,
    opts?: ADiscriminatorSchemaOptions<TValueKey>,
): AUnionSchemaWithAdapters<
    InferInternallyTaggedUnionType<
        TMapping,
        TTagKey,
        TValueKey,
        MergedInternallyTaggedUnion<TMapping, TTagKey, TValueKey>
    >
>;
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
    TTagKey extends string,
    TMapping extends Record<string, ASchema<any>>,
    TValueKey extends string | undefined = undefined,
>(
    id: string,
    tag: TTagKey,
    mapping: TMapping,
    opts?: ADiscriminatorSchemaOptions<TValueKey>,
): AUnionSchemaWithAdapters<
    InferInternallyTaggedUnionType<
        TMapping,
        TTagKey,
        TValueKey,
        MergedInternallyTaggedUnion<TMapping, TTagKey, TValueKey>
    >
>;
export function discriminator<
    TTagKey extends string,
    TMapping extends Record<string, ASchema<any>>,
    TValueKey extends string | undefined = undefined,
>(
    propA: string | TTagKey,
    propB: TTagKey | TMapping,
    propC?: TMapping | ADiscriminatorSchemaOptions<TValueKey>,
    propD?: ADiscriminatorSchemaOptions<TValueKey>,
): AUnionSchemaWithAdapters<
    InferInternallyTaggedUnionType<
        TMapping,
        TTagKey,
        TValueKey,
        MergedInternallyTaggedUnion<TMapping, TTagKey, TValueKey>
    >
> {
    const isIdShorthand = typeof propB === 'string';
    const tagKey = isIdShorthand ? propB : propA;
    const mapping = (isIdShorthand ? propC : propB) as TMapping;
    const opts = (
        isIdShorthand ? (propD ?? {}) : (propC ?? {})
    ) as ADiscriminatorSchemaOptions<TValueKey>;
    if (isIdShorthand) {
        opts.id = propA;
    }
    const valueKey = opts.valueKey;
    return union(mapping as any, {
        id: opts.id,
        isDeprecated: opts.isDeprecated,
        description: opts.description,
        tagKey: tagKey,
        valueKey: valueKey,
    });
}
