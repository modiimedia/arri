import {
    ArriEnumValidator,
    ArriModelValidator,
    arriRequest,
    arriSseRequest,
    arriWsRequest,
    INT8_MAX,
    INT8_MIN,
    INT16_MAX,
    INT16_MIN,
    INT32_MAX,
    INT32_MIN,
    isObject,
    serializeString,
    SseOptions,
    UINT8_MAX,
    UINT16_MAX,
    UINT32_MAX,
    WsOptions,
} from "@arrirpc/client";

type HeaderMap = Record<string, string | undefined>;

export class ExampleClient {
    private readonly _baseUrl: string;
    private readonly _headers: HeaderMap | (() => HeaderMap);
    constructor(
        options: {
            baseUrl?: string;
            headers?: HeaderMap | (() => HeaderMap);
        } = {},
    ) {
        this._baseUrl = options.baseUrl ?? "";
        this._headers = options.headers ?? {};
    }

    async sendObject(params: NestedObject) {
        return arriRequest<NestedObject, NestedObject>({
            url: `${this._baseUrl}/send-object`,
            method: "post",
            headers: this._headers,
            params: params,
            parser: $$NestedObject.fromJsonString,
            serializer: $$NestedObject.toJsonString,
            clientVersion: "20",
        });
    }
}

export class ExampleClientBooksService {
    private readonly _baseUrl: string;
    private readonly _headers: HeaderMap | (() => HeaderMap);
    constructor(
        options: {
            baseUrl?: string;
            headers?: HeaderMap | (() => HeaderMap);
        } = {},
    ) {
        this._baseUrl = options.baseUrl ?? "";
        this._headers = options.headers ?? {};
    }
    async getBook(params: BookParams) {
        return arriRequest<Book, BookParams>({
            url: `${this._baseUrl}/books/get-book`,
            method: "get",
            headers: this._headers,
            params: params,
            parser: $$Book.fromJsonString,
            serializer: $$BookParams.toUrlQueryString,
            clientVersion: "20",
        });
    }
    async createBook(params: Book) {
        return arriRequest<Book, Book>({
            url: `${this._baseUrl}/books/create-book`,
            method: "post",
            headers: this._headers,
            params: params,
            parser: $$Book.fromJsonString,
            serializer: $$Book.toJsonString,
            clientVersion: "20",
        });
    }
    async watchBook(params: BookParams, options: SseOptions<Book> = {}) {
        return arriSseRequest<Book, BookParams>(
            {
                url: `${this._baseUrl}/books/watch-book`,
                method: "get",
                headers: this._headers,
                params: params,
                parser: $$Book.fromJsonString,
                serializer: $$BookParams.toUrlQueryString,
                clientVersion: "20",
            },
            options,
        );
    }
    async createConnection(options: WsOptions<Book> = {}) {
        return arriWsRequest({
            url: `${this._baseUrl}/books/create-connection`,
            headers: this._headers,
            parser: $$Book.fromJsonString,
            serializer: $$BookParams.toJsonString,
            onOpen: options.onOpen,
            onClose: options.onClose,
            onError: options.onError,
            onConnectionError: options.onConnectionError,
            onMessage: options.onMessage,
            clientVersion: "20",
        });
    }
}

export interface Book {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
export const $$Book: ArriModelValidator<Book> = {
    new(): Book {
        return {
            id: "",
            name: "",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    },
    validate(input: unknown): input is Book {
        return (
            isObject(input) &&
            input.id === "string" &&
            input.name === "string" &&
            input.createdAt instanceof Date &&
            input.updatedAt instanceof Date
        );
    },
    fromJson(input: Record<string, unknown>): Book {
        let id: string;
        if (typeof input.id === "string") {
            id = input.id;
        } else {
            id = "";
        }
        let name: string;
        if (typeof input.name === "string") {
            name = input.name;
        } else {
            name = "";
        }
        let createdAt: Date;
        if (typeof input.createdAt === "string") {
            createdAt = new Date(input.createdAt);
        } else if (input.createdAt instanceof Date) {
            createdAt = input.createdAt;
        } else {
            createdAt = new Date();
        }
        let updatedAt: Date;
        if (typeof input.updatedAt === "string") {
            updatedAt = new Date(input.updatedAt);
        } else if (input.updatedAt instanceof Date) {
            updatedAt = input.updatedAt;
        } else {
            updatedAt = new Date();
        }
        return {
            id,
            name,
            createdAt,
            updatedAt,
        };
    },
    fromJsonString(input: string): Book {
        return $$Book.fromJson(JSON.parse(input));
    },
    toJsonString(input: Book): string {
        let json = "{";
        json += '"id":';
        json += serializeString(input.id);
        json += ',"name":';
        json += serializeString(input.name);
        json += ',"createdAt":';
        json += `"${input.createdAt.toISOString()}"`;
        json += `,"updatedAt":`;
        json += `"${input.updatedAt.toISOString()}"`;
        json += "}";
        return json;
    },
    toUrlQueryString(input): string {
        const queryParts: string[] = [];
        queryParts.push(`id=${input.id}`);
        queryParts.push(`name=${input.name}`);
        queryParts.push(`createdAt=${input.createdAt.toISOString()}`);
        queryParts.push(`updatedAt=${input.updatedAt.toISOString()}`);
        return queryParts.join("&");
    },
};

export interface BookParams {
    bookId: string;
}
export const $$BookParams: ArriModelValidator<BookParams> = {
    new(): BookParams {
        return {
            bookId: "",
        };
    },
    validate(input: unknown): input is BookParams {
        return isObject(input) && typeof input.bookId === "string";
    },
    fromJson(input: Record<string, unknown>): BookParams {
        let bookId: string;
        if (typeof input.bookId === "string") {
            bookId = input.bookId;
        } else {
            bookId = "";
        }
        return {
            bookId,
        };
    },
    fromJsonString(input: string): BookParams {
        return $$BookParams.fromJson(JSON.parse(input));
    },
    toJsonString(input: BookParams): string {
        let json = "{";
        json += `"bookId":`;
        json += serializeString(input.bookId);
        json += "}";
        return json;
    },
    toUrlQueryString(input): string {
        const queryParts: string[] = [];
        queryParts.push(`bookId=${input.bookId}`);
        return queryParts.join("&");
    },
};

export interface NestedObject {
    id: string;
    content: string;
}
export const $$NestedObject: ArriModelValidator<NestedObject> = {
    new(): NestedObject {
        return {
            id: "",
            content: "",
        };
    },
    validate(input: unknown): input is NestedObject {
        return (
            isObject(input) &&
            typeof input.id === "string" &&
            typeof input.content === "string"
        );
    },
    fromJson(input: Record<string, unknown>): NestedObject {
        let id: string;
        if (typeof input.id === "string") {
            id = input.id;
        } else {
            id = "";
        }
        let content: string;
        if (typeof input.content === "string") {
            content = input.content;
        } else {
            content = "";
        }
        return {
            id,
            content,
        };
    },
    fromJsonString(input: string): NestedObject {
        return $$NestedObject.fromJson(JSON.parse(input));
    },
    toJsonString(input: NestedObject): string {
        let json = "{";
        json += '"id":';
        json += serializeString(input.id);
        json += ',"content":';
        json += serializeString(input.content);
        json += "}";
        return json;
    },
    toUrlQueryString(input): string {
        const queryParts: string[] = [];
        queryParts.push(`id=${input.id}`);
        queryParts.push(`content=${input.content}`);
        return queryParts.join("&");
    },
};

export interface ObjectWithEveryType {
    string: string;
    boolean: boolean;
    timestamp: Date;
    float32: number;
    float64: number;
    int8: number;
    uint8: number;
    int16: number;
    uint16: number;
    int32: number;
    uint32: number;
    int64: bigint;
    uint64: bigint;
    enum: Enumerator;
    object: NestedObject;
    array: boolean[];
    record: Record<string, boolean>;
    discriminator: Discriminator;
    any: any;
}
export const $$ObjectWithEveryType: ArriModelValidator<ObjectWithEveryType> = {
    new(): ObjectWithEveryType {
        return {
            string: "",
            boolean: false,
            timestamp: new Date(),
            float32: 0,
            float64: 0,
            int8: 0,
            uint8: 0,
            int16: 0,
            uint16: 0,
            int32: 0,
            uint32: 0,
            int64: BigInt(0),
            uint64: BigInt(0),
            enum: "FOO",
            object: $$NestedObject.new(),
            array: [],
            record: {},
            discriminator: $$Discriminator.new(),
            any: undefined,
        };
    },
    validate(input): input is ObjectWithEveryType {
        return (
            isObject(input) &&
            typeof input.string === "string" &&
            typeof input.boolean === "boolean" &&
            input.timestamp instanceof Date &&
            typeof input.float32 === "number" &&
            typeof input.float64 === "number" &&
            typeof input.int8 === "number" &&
            Number.isInteger(input.int8) &&
            (input.int8 as number) >= INT8_MIN &&
            (input.int8 as number) <= INT8_MAX &&
            typeof input.uint8 === "number" &&
            (input.uint8 as number) >= 0 &&
            (input.uint8 as number) <= UINT8_MAX &&
            typeof input.int16 === "number" &&
            Number.isInteger(input.int16) &&
            (input.int16 as number) >= INT16_MIN &&
            (input.int16 as number) <= INT16_MAX &&
            typeof input.uint16 === "number" &&
            Number.isInteger(input.uint16) &&
            (input.uint16 as number) >= 0 &&
            (input.uint16 as number) <= UINT16_MAX &&
            typeof input.int32 === "number" &&
            Number.isInteger(input.int32) &&
            (input.int32 as number) >= INT32_MIN &&
            (input.int32 as number) <= UINT32_MAX &&
            typeof input.uint32 === "number" &&
            Number.isInteger(input.uint32) &&
            (input.uint32 as number) >= 0 &&
            (input.uint32 as number) <= UINT32_MAX &&
            typeof input.int64 === "bigint" &&
            typeof input.uint64 === "bigint" &&
            (input.uint64 as bigint) >= BigInt(0) &&
            $$Enumerator.validate(input.enum) &&
            $$NestedObject.validate(input.object) &&
            Array.isArray(input.array) &&
            input.array.every((value) => typeof value === "boolean") &&
            isObject(input.record) &&
            Object.entries(input.record).every(
                ([_, value]) => typeof value === "boolean",
            ) &&
            $$Discriminator.validate(input.discriminator)
        );
    },
    fromJson(input): ObjectWithEveryType {
        let _string: string;
        if (typeof input.string === "string") {
            _string = input.string;
        } else {
            _string = "";
        }
        let _boolean: boolean;
        if (typeof input.boolean === "boolean") {
            _boolean = input.boolean;
        } else {
            _boolean = false;
        }
        let _timestamp: Date;
        if (typeof input.timestamp === "string") {
            _timestamp = new Date(input.timestamp);
        } else if (input instanceof Date) {
            _timestamp = input;
        } else {
            _timestamp = new Date();
        }
        let _float32: number;
        if (typeof input.float32 === "number") {
            _float32 = input.float32;
        } else {
            _float32 = 0;
        }
        let _float64: number;
        if (typeof input.float64 === "number") {
            _float64 = input.float64;
        } else {
            _float64 = 0;
        }
        let _int8: number;
        if (
            typeof input.int8 === "number" &&
            Number.isInteger(input.int8) &&
            input.int8 >= INT8_MIN &&
            input.int8 <= INT8_MAX
        ) {
            _int8 = input.int8;
        } else {
            _int8 = 0;
        }
        let _uint8: number;
        if (
            typeof input.uint8 === "number" &&
            Number.isInteger(input.uint8) &&
            input.uint8 >= 0 &&
            input.uint8 <= UINT8_MAX
        ) {
            _uint8 = input.uint8;
        } else {
            _uint8 = 0;
        }
        let _int16: number;
        if (
            typeof input.int16 === "number" &&
            Number.isInteger(input.int16) &&
            input.int16 >= INT16_MIN &&
            input.int16 <= INT16_MAX
        ) {
            _int16 = input.int16;
        } else {
            _int16 = 0;
        }
        let _uint16: number;
        if (
            typeof input.uint16 === "number" &&
            Number.isInteger(input.uint16) &&
            input.uint16 >= 0 &&
            input.uint16 <= UINT16_MAX
        ) {
            _uint16 = input.uint16;
        } else {
            _uint16 = 0;
        }
        let _int32: number;
        if (
            typeof input.int32 === "number" &&
            Number.isInteger(input.int32) &&
            input.int32 >= INT32_MIN &&
            input.int32 <= INT32_MAX
        ) {
            _int32 = input.int32;
        } else {
            _int32 = 0;
        }
        let _uint32: number;
        if (
            typeof input.uint32 === "number" &&
            Number.isInteger(input.uint32) &&
            input.uint32 >= 0 &&
            input.uint32 <= UINT32_MAX
        ) {
            _uint32 = input.uint32;
        } else {
            _uint32 = 0;
        }
        let _int64: bigint;
        if (typeof input.int64 === "string") {
            _int64 = BigInt(input.int64);
        } else {
            _int64 = BigInt(0);
        }
        let _uint64: bigint;
        if (typeof input.uint64 === "string") {
            _uint64 = BigInt(input.uint64);
        } else {
            _uint64 = BigInt(0);
        }
        let _enum: Enumerator;
        if ($$Enumerator.validate(input.enum)) {
            _enum = input.enum;
        } else {
            _enum = "FOO";
        }
        let _object: NestedObject;
        if (isObject(input.object)) {
            _object = $$NestedObject.fromJson(input.object);
        } else {
            _object = $$NestedObject.new();
        }
        let _array: boolean[];
        if (Array.isArray(input.array)) {
            _array = [];
            for (const _element of input.array) {
                if (typeof _element === "boolean") {
                    _array.push(_element);
                } else {
                    _array.push(false);
                }
            }
        } else {
            _array = [];
        }
        let _record: Record<string, boolean>;
        if (isObject(input.record)) {
            _record = {};
            for (const key of Object.keys(input.record)) {
                if (typeof input.record[key] === "boolean") {
                    _record[key] = input.record[key];
                } else {
                    _record[key] = false;
                }
            }
        } else {
            _record = {};
        }
        let _discriminator: Discriminator;
        if (isObject(input.discriminator)) {
            _discriminator = $$Discriminator.fromJson(input.discriminator);
        } else {
            _discriminator = $$Discriminator.new();
        }
        let _any: any;
        _any = input.any;
        return {
            string: _string,
            boolean: _boolean,
            timestamp: _timestamp,
            float32: _float32,
            float64: _float64,
            int8: _int8,
            uint8: _uint8,
            int16: _int16,
            uint16: _uint16,
            int32: _int32,
            uint32: _uint32,
            int64: _int64,
            uint64: _uint64,
            enum: _enum,
            object: _object,
            array: _array,
            record: _record,
            discriminator: _discriminator,
            any: _any,
        };
    },
    fromJsonString(input): ObjectWithEveryType {
        return $$ObjectWithEveryType.fromJson(JSON.parse(input));
    },
    toJsonString(input): string {
        let json = "{";
        json += '"string":';
        json += serializeString(input.string);
        json += ',"boolean":';
        json += input.boolean.toString();
        json += ',"timestamp":';
        json += `"${input.timestamp.toISOString()}"`;
        json += ',"float32":';
        json += input.float32.toString();
        json += ',"float64":';
        json += input.float64.toString();
        json += ',"int8":';
        json += input.int8.toString();
        json += ',"uint8":';
        json += input.uint8.toString();
        json += ',"int16":';
        json += input.int16.toString();
        json += ',"uint16":';
        json += input.uint16.toString();
        json += ',"int32":';
        json += input.int32.toString();
        json += ',"uint32":';
        json += input.uint32.toString();
        json += ',"int64":';
        json += `"${input.int64.toString()}"`;
        json += ',"uint64":';
        json += `"${input.uint64.toString()}"`;
        json += ',"enum":';
        json += `"${input.enum}"`;
        json += ',"object":';
        json += $$NestedObject.toJsonString(input.object);
        json += ',"array":';
        json += "[";
        for (let i = 0; i < input.array.length; i++) {
            const _element = input.array[i]!;
            if (i !== 0) json += ",";
            json += _element.toString();
        }
        json += "]";
        json += ',"record":';
        json += "{";
        let _recordPropertyCount = 0;
        for (const [_key, _value] of Object.entries(input.record)) {
            if (_recordPropertyCount !== 0) {
                json += ",";
            }
            json += `"${_key}":`;
            json += _value.toString();
            _recordPropertyCount++;
        }
        json += "}";
        json += ',"discriminator":';
        json += $$Discriminator.toJsonString(input.discriminator);
        json += ',"any":';
        json += JSON.stringify(input.any);
        json += "}";
        return json;
    },
    toUrlQueryString(input): string {
        const queryParts: string[] = [];
        queryParts.push(`string=${input.string}`);
        queryParts.push(`boolean=${input.boolean}`);
        queryParts.push(`timestamp=${input.timestamp.toISOString()}`);
        queryParts.push(`float32=${input.float32}`);
        queryParts.push(`float64=${input.float64}`);
        queryParts.push(`int8=${input.int8}`);
        queryParts.push(`uint8=${input.uint8}`);
        queryParts.push(`int16=${input.int16}`);
        queryParts.push(`uint16=${input.uint16}`);
        queryParts.push(`int32=${input.int32}`);
        queryParts.push(`uint32=${input.uint32}`);
        queryParts.push(`int64=${input.int64}`);
        queryParts.push(`uint64=${input.uint64}`);
        queryParts.push(`enum=${input.enum}`);
        console.warn(
            `[WARNING] Cannot serialize nested objects to query params. Ignoring property at /ObjectWithEveryType/object.`,
        );
        console.warn(
            `[WARNING] Cannot serialize arrays to query params. Ignoring property at /ObjectWithEveryType/array.`,
        );
        console.warn(
            `[WARNING] Cannot serialize nested objects to query params. Ignoring property at /ObjectWithEveryType/record.`,
        );
        console.warn(
            `[WARNING] Cannot serialize any's to query params. Ignoring property at /ObjectWithEveryType/any.`,
        );
        return queryParts.join("&");
    },
};

export type Enumerator = (typeof $$EnumeratorValues)[number];
const $$EnumeratorValues = ["FOO", "BAR", "BAZ"] as const;
export const $$Enumerator: ArriEnumValidator<Enumerator> = {
    new(): Enumerator {
        return $$EnumeratorValues[0];
    },
    validate(input): input is Enumerator {
        return (
            typeof input === "string" &&
            $$EnumeratorValues.includes(input as any)
        );
    },
    values: $$EnumeratorValues,
    fromSerialValue(input): Enumerator {
        if ($$EnumeratorValues.includes(input as any)) {
            return input as Enumerator;
        }
        if ($$EnumeratorValues.includes(input.toLowerCase() as any)) {
            return input.toLowerCase() as Enumerator;
        }
        if ($$EnumeratorValues.includes(input.toUpperCase() as any)) {
            return input.toUpperCase() as Enumerator;
        }
        return "FOO";
    },
};

export type Discriminator = DiscriminatorA | DiscriminatorB | DiscriminatorC;
export const $$Discriminator: ArriModelValidator<Discriminator> = {
    new(): Discriminator {
        return $$DiscriminatorA.new();
    },
    validate(input): input is Discriminator {
        if (!isObject(input)) {
            return false;
        }
        if (typeof input.typeName !== "string") {
            return false;
        }
        switch (input.typeName) {
            case "A":
                return $$DiscriminatorA.validate(input);
            case "B":
                return $$DiscriminatorB.validate(input);
            case "C":
                return $$DiscriminatorC.validate(input);
            default:
                return false;
        }
    },
    fromJson(input): Discriminator {
        switch (input.typeName) {
            case "A":
                return $$DiscriminatorA.fromJson(input);
            case "B":
                return $$DiscriminatorB.fromJson(input);
            case "C":
                return $$DiscriminatorC.fromJson(input);
            default:
                return $$DiscriminatorA.new();
        }
    },
    fromJsonString(input): Discriminator {
        return $$Discriminator.fromJson(JSON.parse(input));
    },
    toJsonString(input): string {
        switch (input.typeName) {
            case "A":
                return $$DiscriminatorA.toJsonString(input);
            case "B":
                return $$DiscriminatorB.toJsonString(input);
            case "C":
                return $$DiscriminatorC.toJsonString(input);
            default:
                input satisfies never;
                throw new Error(`Unhandled case "${(input as any).typeName}"`);
        }
    },
    toUrlQueryString(input): string {
        switch (input.typeName) {
            case "A":
                return $$DiscriminatorA.toUrlQueryString(input);
            case "B":
                return $$DiscriminatorB.toUrlQueryString(input);
            case "C":
                return $$DiscriminatorC.toUrlQueryString(input);
            default:
                throw new Error(`Unhandled case`);
        }
    },
};
export interface DiscriminatorA {
    typeName: "A";
    id: string;
}
const $$DiscriminatorA: ArriModelValidator<DiscriminatorA> = {
    new(): DiscriminatorA {
        return {
            typeName: "A",
            id: "",
        };
    },
    validate(input): input is DiscriminatorA {
        return (
            isObject(input) &&
            input.typeName === "A" &&
            typeof input.id === "string"
        );
    },
    fromJson(input): DiscriminatorA {
        const typeName = "A";
        let id: string;
        if (typeof input.id === "string") {
            id = input.id;
        } else {
            id = "";
        }
        return {
            typeName,
            id,
        };
    },
    fromJsonString(input): DiscriminatorA {
        return $$DiscriminatorA.fromJson(JSON.parse(input));
    },
    toJsonString(input): string {
        let json = "{";
        json += '"typeName":"A"';
        json += ',"id":';
        json += serializeString(input.id);
        json += "}";
        return json;
    },
    toUrlQueryString(input): string {
        const queryParts: string[] = [];
        queryParts.push(`typeName=A`);
        queryParts.push(`id=${input.id}`);
        return queryParts.join("&");
    },
};
export interface DiscriminatorB {
    typeName: "B";
    id: string;
    name: string;
}
const $$DiscriminatorB: ArriModelValidator<DiscriminatorB> = {
    new(): DiscriminatorB {
        return {
            typeName: "B",
            id: "",
            name: "",
        };
    },
    validate(input): input is DiscriminatorB {
        return (
            isObject(input) &&
            input.typeName === "B" &&
            typeof input.id === "string" &&
            typeof input.name === "string"
        );
    },
    fromJson(input): DiscriminatorB {
        const typeName = "B";
        let id: string;
        if (typeof input.id === "string") {
            id = input.id;
        } else {
            id = "";
        }
        let name: string;
        if (typeof input.name === "string") {
            name = input.name;
        } else {
            name = "";
        }
        return {
            typeName,
            id,
            name,
        };
    },
    fromJsonString(input): DiscriminatorB {
        return $$DiscriminatorB.fromJson(JSON.parse(input));
    },
    toJsonString(input): string {
        let json = "{";
        json += '"typeName":"B"';
        json += ',"id":';
        json += serializeString(input.id);
        json += ',"name":';
        json += serializeString(input.name);
        json += "}";
        return json;
    },
    toUrlQueryString(input): string {
        const queryParts: string[] = [];
        queryParts.push("typeName=B");
        queryParts.push(`id=${input.id}`);
        queryParts.push(`name=${input.name}`);
        return queryParts.join("&");
    },
};
export interface DiscriminatorC {
    typeName: "C";
    id: string;
    name: string;
    date: Date;
}
const $$DiscriminatorC: ArriModelValidator<DiscriminatorC> = {
    new(): DiscriminatorC {
        return {
            typeName: "C",
            id: "",
            name: "",
            date: new Date(),
        };
    },
    validate(input): input is DiscriminatorC {
        return (
            isObject(input) &&
            input.typeName === "C" &&
            typeof input.id === "string" &&
            typeof input.name === "string" &&
            input.date instanceof Date
        );
    },
    fromJson(input): DiscriminatorC {
        const typeName = "C";
        let id: string;
        if (typeof input.id === "string") {
            id = input.id;
        } else {
            id = "";
        }
        let name: string;
        if (typeof input.name === "string") {
            name = input.name;
        } else {
            name = "";
        }
        let date: Date;
        if (typeof input.date === "string") {
            date = new Date(input.date);
        } else if (input.date instanceof Date) {
            date = input.date;
        } else {
            date = new Date();
        }
        return {
            typeName,
            id,
            name,
            date,
        };
    },
    fromJsonString(input): DiscriminatorC {
        return $$DiscriminatorC.fromJson(JSON.parse(input));
    },
    toJsonString(input): string {
        let json = "{";
        json += '"typeName":"C"';
        json += ',"id":';
        json += serializeString(input.id);
        json += ',"name":';
        json += serializeString(input.name);
        json += ',"date":';
        json += `"${input.date.toISOString()}"`;
        json += "}";
        return json;
    },
    toUrlQueryString(input): string {
        const queryParts: string[] = [];
        queryParts.push("typeName=C");
        queryParts.push(`id=${input.id}`);
        queryParts.push(`name=${input.name}`);
        queryParts.push(`date=${input.date.toISOString()}`);
        return queryParts.join("&");
    },
};

export interface ObjectWithOptionalFields {
    string?: string;
    boolean?: boolean;
    timestamp?: Date;
    float32?: number;
    float64?: number;
    int8?: number;
    uint8?: number;
    int16?: number;
    uint16?: number;
    int32?: number;
    uint32?: number;
    enum?: Enumerator;
    object?: NestedObject;
    array?: boolean[];
    record?: Record<string, boolean>;
    discriminator?: Discriminator;
    any?: any;
}
export const $$ObjectWithOptionalFields: ArriModelValidator<ObjectWithOptionalFields> =
    {
        new(): ObjectWithOptionalFields {
            return {};
        },
    };

export interface ObjectWithNullableFields {
    string: string | null;
    boolean: boolean | null;
    timestamp: Date | null;
    float32: number | null;
    float64: number | null;
    int8: number | null;
    uint8: number | null;
    int16: number | null;
    uint16: number | null;
    int32: number | null;
    uint32: number | null;
    int64: bigint | null;
    uint64: bigint | null;
    enum: Enumerator | null;
    object: NestedObject | null;
    array: boolean[] | null;
    record: Record<string, boolean> | null;
    discriminator: Discriminator | null;
    any: any;
}
export const $$ObjectWithNullableFields: ArriModelValidator<ObjectWithNullableFields> =
    {
        new(): ObjectWithNullableFields {
            return {
                string: null,
                boolean: null,
                timestamp: null,
                float32: null,
                float64: null,
                int8: null,
                uint8: null,
                int16: null,
                uint16: null,
                int32: null,
                uint32: null,
                int64: null,
                uint64: null,
                enum: null,
                object: null,
                array: null,
                record: null,
                discriminator: null,
                any: null,
            };
        },
    };

export interface RecursiveObject {
    left: RecursiveObject | null;
    right: RecursiveObject | null;
}
export const $$RecursiveObject: ArriModelValidator<RecursiveObject> = {
    new(): RecursiveObject {
        return {
            left: null,
            right: null,
        };
    },
    validate(input): input is RecursiveObject {
        return (
            isObject(input) &&
            (input.left === null || $$RecursiveObject.validate(input.left)) &&
            (input.right === null || $$RecursiveObject.validate(input.right))
        );
    },
    fromJson(input): RecursiveObject {
        let left: RecursiveObject | null;
        if (isObject(input.left)) {
            left = $$RecursiveObject.fromJson(input.left);
        } else {
            left = null;
        }
        let right: RecursiveObject | null;
        if (isObject(input.right)) {
            right = $$RecursiveObject.fromJson(input.right);
        } else {
            right = null;
        }
        return {
            left,
            right,
        };
    },
    fromJsonString(input): RecursiveObject {
        return $$RecursiveObject.fromJson(JSON.parse(input));
    },
    toJsonString(input): string {
        let json = "{";
        json += '"left":';
        if (input.left) {
            json += $$RecursiveObject.toJsonString(input.left);
        } else {
            json += "null";
        }
        json += ',"right":';
        if (input.right) {
            json += $$RecursiveObject.toJsonString(input.right);
        } else {
            json += "null";
        }
        json += "}";
        return json;
    },
    toUrlQueryString(input): string {
        const queryParts: string[] = [];
        // TODO:
        return queryParts.join("&");
    },
};
