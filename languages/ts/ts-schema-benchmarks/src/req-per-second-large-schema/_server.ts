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

export type LargeUserSchema = {
    id: string;
    username: string;
    email: string | null;
    password: string;
    profile: {
        firstName: string;
        lastName: string;
        age?: number; // integer
        address: _AddressSchema;
    };
    orders: Array<{
        orderId: string;
        orderDate: Date;
        products: Array<_ProductSchema>;
        totalAmount: number; // integer
        shippingAddress: _AddressSchema;
    }>;
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
    preferences: {
        theme: 'light' | 'dark';
        notificationsEnabled: boolean;
        language: 'en' | 'es' | 'fr' | 'de';
    };
    reviews: Array<{
        reviewId: string;
        productId: string;
        rating: number; // integer
        comment?: string;
        reviewDate: Date;
    }>;
    metadata?: Record<string, any>;
    optionalString?: string;
    optionalNumber?: number;
    optionalBoolean?: boolean;
    optionalDate?: Date;
    optionalArray?: string[];
    optionalObject?: {
        a: string;
        b: number;
    };
    nullableString: string | null;
    bigintType: bigint;
    mapType: Record<string, number>;
};

export function createServer<T extends SmallUserSchema>(
    parse: (input: string) => T,
    serialize?: (input: T) => string,
) {
    const server = http.createServer((req, res) => {
        if (req.headers['content-type'] !== 'application/json') {
            res.writeHead(400, 'bad request');
            res.end('bad request');
            return;
        }
        const body: Uint8Array[] = [];
        req.on('data', (chunk) => body.push(chunk));
        req.on('end', () => {
            let parsedBody: T;
            try {
                parsedBody = parse(Buffer.concat(body).toString());
            } catch (err) {
                res.writeHead(400);
                res.end(err instanceof Error ? err.message : `${err}`);
                return;
            }

            try {
                const payload =
                    serialize?.(parsedBody) ?? JSON.stringify(parsedBody);
                res.writeHead(200, 'ok');
                res.end(payload);
            } catch (err) {
                res.writeHead(500);
                res.end(err instanceof Error ? err.message : `${err}`);
                return;
            }
        });
    });
    return server;
}
