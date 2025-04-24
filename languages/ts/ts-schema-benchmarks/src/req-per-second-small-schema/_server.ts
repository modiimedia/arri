import assert from 'node:assert';
import http from 'node:http';

export type SmallUserSchema = {
    id: string;
    name: string;
    email: string | null;
    array: number[];
    object: {
        foo: boolean;
        bar: string | null;
    };
};

const smallUserSchemaGoodInput = JSON.stringify({
    id: '12345',
    name: 'john doe',
    email: null,
    array: [1, 2, 3, 4, 5],
    object: {
        foo: true,
        bar: 'foo',
    },
});
const smallUserSchemaBadInputs = [
    JSON.stringify({
        id: '12345',
        name: 'john doe',
        email: null,
        array: [1, 2, 3, 4, '5'],
        object: {
            foo: true,
            bar: 'foo',
        },
    }),
    JSON.stringify({
        id: '12345',
        name: 'john doe',
        email: null,
        array: [1, 2, 3, 4, 5],
        object: {
            foo: 1,
            bar: 'foo',
        },
    }),
];

export type LargeUserSchema = {
    id: string;
    username: string;
    email: string | null;
    password: string;
    profile: {
        firstName: string;
        lastName: string;
        age?: number | undefined; // integer
        address: _AddressSchema;
        nestedObjects?: _NestedObjectSchema[] | undefined;
    };
    orders: Array<{
        orderId: string;
        orderDate: Date;
        products: Array<_ProductSchema>;
        totalAmount: number; // integer
        shippingAddress: _AddressSchema;
    }>;
    preferences: {
        theme: 'light' | 'dark';
        notificationsEnabled: boolean;
        language: 'en' | 'es' | 'fr' | 'de';
    };
    reviews: Array<{
        reviewId: string;
        productId: string;
        rating: number; // integer
        comment?: string | undefined;
        reviewDate: Date;
    }>;
    metadata?: Record<string, any>;
    optionalString?: string | undefined;
    optionalNumber?: number | undefined;
    optionalBoolean?: boolean | undefined;
    optionalDate?: Date | undefined;
    optionalArray?: string[] | undefined;
    optionalObject?:
        | {
              a: string;
              b: number;
          }
        | undefined;
    nullableString: string | null;
    mapType: Record<string, number>;
};

type _NestedObjectSchema = {
    id: string;
    name: string;
    description?: string | undefined;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    value: number; // integer;
    tags: string[];
};

export type _AddressSchema = {
    street: string;
    city: string;
    zipCode: string;
    country: string;
};

type _ProductSchema = {
    productId: string;
    productName: string;
    price: number; // integer;
    quantity: number; // integer;
    category: 'Electronics' | 'Clothing' | 'Books' | 'Home';
    attributes: Record<string, string>;
};

const now = new Date();

const largeUserSchemaGoodInput = JSON.stringify({
    id: '1',
    username: 'foo',
    email: null,
    password: 'bar',
    profile: {
        firstName: 'foo',
        lastName: 'bar',
        age: 1000,
        address: {
            street: 'foo',
            city: 'bar',
            zipCode: 'alkksf',
            country: 'baz',
        },
        nestedObjects: [
            {
                id: '',
                name: '',
                isActive: false,
                createdAt: now,
                updatedAt: now,
                value: 50,
                tags: ['foo', 'bar', 'baz'],
            },
        ],
    },
    orders: [
        {
            orderId: '',
            orderDate: now,
            products: [
                {
                    productId: '3',
                    productName: 'asdfa',
                    price: 150,
                    quantity: 50,
                    category: 'Electronics',
                    attributes: {
                        foo: 'foo',
                        bar: 'bar',
                    },
                },
                {
                    productId: '3',
                    productName: 'asdfa',
                    price: 150,
                    quantity: 50,
                    category: 'Electronics',
                    attributes: {
                        foo: 'foo',
                        bar: 'bar',
                    },
                },
            ],
            totalAmount: 50,
            shippingAddress: {
                street: 'foo',
                city: 'bar',
                zipCode: 'baz',
                country: 'fooFoo',
            },
        },
    ],
    preferences: {
        theme: 'light',
        notificationsEnabled: false,
        language: 'en',
    },
    reviews: [
        {
            reviewId: '1',
            productId: '2',
            rating: 5,
            reviewDate: now,
        },
    ],
    nullableString: null,
    optionalArray: ['foo', 'bar', 'baz'],
    optionalBoolean: false,
    optionalDate: now,
    optionalNumber: 5,
    optionalObject: {
        a: 'foo',
        b: 5,
    },
    optionalString: undefined,
    mapType: {},
} satisfies LargeUserSchema);

const largeUserSchemaBadInput = JSON.stringify({
    id: '1',
    username: 'foo',
    email: null,
    password: 'bar',
    profile: {
        firstName: 'foo',
        lastName: 'bar',
        age: 1000,
        address: {
            street: 'foo',
            city: 'bar',
            zipCode: 'alkksf',
            country: 'baz',
        },
        nestedObjects: [
            {
                id: '',
                name: '',
                isActive: false,
                createdAt: now,
                updatedAt: now,
                value: 50,
                tags: ['foo', 'bar', 'baz'],
            },
        ],
    },
    orders: [
        {
            orderId: '',
            orderDate: now,
            products: [
                {
                    productId: '3',
                    productName: 'asdfa',
                    price: 150,
                    quantity: 50,
                    category: 'Electronics',
                    attributes: {
                        foo: 'foo',
                        bar: 'bar',
                    },
                },
                {
                    productId: '3',
                    productName: 'asdfa',
                    price: 150.85,
                    quantity: 50,
                    category: 'Electronics',
                    attributes: {
                        foo: 'foo',
                        bar: 'bar',
                    },
                },
            ],
            totalAmount: 50,
            shippingAddress: {
                street: 'foo',
                city: 'bar',
                zipCode: 'baz',
                country: 'fooFoo',
            },
        },
    ],
    preferences: {
        theme: 'light',
        notificationsEnabled: false,
        language: 'en',
    },
    reviews: [
        {
            reviewId: '1',
            productId: '2',
            rating: 5,
            reviewDate: now,
        },
    ],
    nullableString: null,
    optionalArray: ['foo', 'bar', 'baz'],
    optionalBoolean: false,
    optionalDate: now,
    optionalNumber: 5,
    optionalObject: {
        a: 'foo',
        b: 5.5,
    },
    optionalString: undefined,
    mapType: {},
});

export function createServer(
    smallSchema: {
        parse: (input: string) => SmallUserSchema;
        serialize?: (input: SmallUserSchema) => string;
    },
    largeSchema: {
        parse: (input: string) => LargeUserSchema;
        serialize?: (input: LargeUserSchema) => string;
    },
) {
    smallSchema.parse(smallUserSchemaGoodInput);
    for (const input of smallUserSchemaBadInputs) {
        try {
            smallSchema.parse(input);
            assert(false, 'this should fail');
        } catch (_) {
            assert(true);
        }
    }
    if (smallSchema.serialize) {
        JSON.parse(
            smallSchema.serialize({
                id: '12345',
                name: 'john doe',
                email: null,
                array: [1, 2, 3, 4, 5],
                object: {
                    foo: false,
                    bar: 'john doe',
                },
            }),
        );
    }
    largeSchema.parse(largeUserSchemaGoodInput);
    try {
        largeSchema.parse(largeUserSchemaBadInput);
        assert(false, 'this should fail');
    } catch (_) {
        assert(true);
    }
    const server = http.createServer((req, res) => {
        if (req.headers['content-type'] !== 'application/json') {
            res.writeHead(400, 'bad request');
            res.end('bad request');
            return;
        }

        if (req.url === '/large-schema') {
            const body: Uint8Array[] = [];
            req.on('data', (chunk) => body.push(chunk));
            req.on('end', () => {
                let parsedBody: LargeUserSchema;
                try {
                    parsedBody = largeSchema.parse(
                        Buffer.concat(body).toString(),
                    );
                } catch (err) {
                    res.writeHead(400);
                    res.end(err instanceof Error ? err.message : `${err}`);
                    return;
                }

                try {
                    const payload =
                        largeSchema.serialize?.(parsedBody) ??
                        JSON.stringify(parsedBody);
                    res.writeHead(200, 'ok');
                    res.end(payload);
                } catch (err) {
                    res.writeHead(500);
                    res.end(err instanceof Error ? err.message : `${err}`);
                    return;
                }
            });
        }

        if (req.url === '/small-schema') {
            const body: Uint8Array[] = [];
            req.on('data', (chunk) => body.push(chunk));
            req.on('end', () => {
                let parsedBody: SmallUserSchema;
                try {
                    parsedBody = smallSchema.parse(
                        Buffer.concat(body).toString(),
                    );
                } catch (err) {
                    res.writeHead(400);
                    res.end(err instanceof Error ? err.message : `${err}`);
                    return;
                }

                try {
                    const payload =
                        smallSchema.serialize?.(parsedBody) ??
                        JSON.stringify(parsedBody);
                    res.writeHead(200, 'ok');
                    res.end(payload);
                } catch (err) {
                    res.writeHead(500);
                    res.end(err instanceof Error ? err.message : `${err}`);
                    return;
                }
            });
        }

        res.writeHead(404);
        res.end('not found');
        return;
    });
    return server;
}
