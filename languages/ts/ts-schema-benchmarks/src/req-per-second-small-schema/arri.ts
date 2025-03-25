import { a } from '@arrirpc/schema';

import { createServer } from './_server';

const SmallUserSchema = a.object({
    id: a.string(),
    name: a.string(),
    email: a.nullable(a.string()),
    array: a.array(a.number()),
    object: a.object({
        foo: a.boolean(),
        bar: a.nullable(a.string()),
    }),
});

const $$SmallUserSchema = a.compile(SmallUserSchema);

const nestedObjectSchema = a.object({
    id: a.string(),
    name: a.string(),
    description: a.optional(a.string()),
    isActive: a.boolean(),
    createdAt: a.timestamp(),
    updatedAt: a.timestamp(),
    value: a.uint32(),
    tags: a.array(a.string()),
});

const addressSchema = a.object({
    street: a.string(),
    city: a.string(),
    zipCode: a.string(),
    country: a.string(),
});

const productSchema = a.object({
    productId: a.string(),
    productName: a.string(),
    price: a.uint32(),
    quantity: a.uint32(),
    category: a.enumerator(['Electronics', 'Clothing', 'Books', 'Home']),
    attributes: a.record(a.string()),
});

const LargeUserSchema = a.object({
    id: a.string(),
    username: a.string(),
    email: a.nullable(a.string()),
    password: a.string(),
    profile: a.object({
        firstName: a.string(),
        lastName: a.string(),
        age: a.optional(a.uint32()),
        address: addressSchema,
        nestedObjects: a.optional(a.array(nestedObjectSchema)),
    }),
    orders: a.array(
        a.object({
            orderId: a.string(),
            orderDate: a.timestamp(),
            products: a.array(productSchema),
            totalAmount: a.uint32(),
            shippingAddress: addressSchema,
        }),
    ),
    preferences: a.object({
        theme: a.enumerator(['light', 'dark']),
        notificationsEnabled: a.boolean(),
        language: a.enumerator(['en', 'es', 'fr', 'de']),
    }),
    reviews: a.array(
        a.object({
            reviewId: a.string(),
            productId: a.string(),
            rating: a.int32(),
            comment: a.optional(a.string()),
            reviewDate: a.timestamp(),
        }),
    ),
    metadata: a.optional(a.record(a.any())),
    optionalString: a.optional(a.string()),
    optionalNumber: a.optional(a.number()),
    optionalBoolean: a.optional(a.boolean()),
    optionalDate: a.optional(a.timestamp()),
    optionalArray: a.optional(a.array(a.string())),
    optionalObject: a.optional(a.object({ a: a.string(), b: a.number() })),
    nullableString: a.nullable(a.string()),
    mapType: a.record(a.number()),
});

const $$LargeUserSchema = a.compile(LargeUserSchema);

export default createServer(
    {
        parse: $$SmallUserSchema.parseUnsafe,
        serialize: $$SmallUserSchema.serializeUnsafe,
    },
    {
        parse: $$LargeUserSchema.parseUnsafe,
        serialize: $$LargeUserSchema.serializeUnsafe as any,
    },
);
