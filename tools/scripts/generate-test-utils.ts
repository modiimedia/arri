import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "pathe";
import prettier from "prettier";
import { type AppDefinition } from "../../packages/arri-codegen/utils/dist";
import { a } from "../../packages/arri-validate/src/_index";

const Enumerator = a.enumerator(["FOO", "BAR", "BAZ"], { id: "Enumerator" });
type Enumerator = a.infer<typeof Enumerator>;

const NestedObject = a.object(
    {
        id: a.string(),
        content: a.string(),
    },
    { id: "NestedObject" },
);
type NestedObject = a.infer<typeof NestedObject>;

const Discriminator = a.discriminator(
    "typeName",
    {
        A: a.object({
            id: a.string(),
        }),
        B: a.object({
            id: a.string(),
            name: a.string(),
        }),
        C: a.object({
            id: a.string(),
            name: a.string(),
            date: a.timestamp(),
        }),
    },
    {
        id: "Discriminator",
    },
);
type Discriminator = a.infer<typeof Discriminator>;

const ObjectWithEveryField = a.object(
    {
        string: a.string(),
        boolean: a.boolean(),
        timestamp: a.timestamp(),
        float32: a.float32(),
        float64: a.float64(),
        int8: a.int8(),
        uint8: a.uint8(),
        int16: a.int16(),
        uint16: a.uint16(),
        int32: a.int32(),
        uint32: a.uint32(),
        int64: a.int64(),
        uint64: a.uint64(),
        enum: a.enumerator(["FOO", "BAR", "BAZ"]),
        object: NestedObject,
        array: a.array(a.boolean()),
        record: a.record(a.boolean()),
        discriminator: Discriminator,
        any: a.any(),
    },
    {
        id: "ObjectWithEveryType",
    },
);
type ObjectWithEveryField = a.infer<typeof ObjectWithEveryField>;

const ObjectWithOptionalFields = a.partial(ObjectWithEveryField, {
    id: "ObjectWithOptionalFields",
});
type ObjectWithOptionalFields = a.infer<typeof ObjectWithOptionalFields>;

const ObjectWithNullableFields = a.object(
    {
        string: a.nullable(a.string()),
        boolean: a.nullable(a.boolean()),
        timestamp: a.nullable(a.timestamp()),
        float32: a.nullable(a.float32()),
        float64: a.nullable(a.float64()),
        int8: a.nullable(a.int8()),
        uint8: a.nullable(a.uint8()),
        int16: a.nullable(a.int16()),
        uint16: a.nullable(a.uint16()),
        int32: a.nullable(a.int32()),
        uint32: a.nullable(a.uint32()),
        int64: a.nullable(a.int64()),
        uint64: a.nullable(a.uint64()),
        enum: a.nullable(Enumerator),
        object: a.nullable(NestedObject),
        array: a.nullable(a.array(a.boolean())),
        record: a.nullable(a.record(a.boolean())),
        discriminator: a.nullable(Discriminator),
        any: a.nullable(a.any()),
    },
    {
        id: "ObjectWithNullableFields",
    },
);
type ObjectWithNullableFields = a.infer<typeof ObjectWithNullableFields>;

const def: AppDefinition = {
    arriSchemaVersion: "0.0.4",
    procedures: {},
    models: {
        NestedObject,
        Object: ObjectWithEveryField,
        ObjectWithOptionalFields,
        ObjectWithNullableFields,
    },
};

async function main() {
    const outDir = path.resolve(__dirname, "../../tests/utils");
    if (!existsSync(outDir)) {
        mkdirSync(outDir);
    }
    writeFileSync(
        path.resolve(outDir, `AppDefinition.json`),
        await prettier.format(JSON.stringify(def), {
            parser: "json",
            tabWidth: 2,
            endOfLine: "lf",
        }),
    );
    const targetDate = new Date("01/01/2001 10:00 AM CST");

    const nestedObject: NestedObject = {
        id: "1",
        content: "hello world",
    };
    writeFileSync(
        path.resolve(outDir, "NestedObject_NoSpecialChars.json"),
        a.serialize(NestedObject, nestedObject),
    );

    const nestedObjectWithSpecialChars: NestedObject = {
        id: "1",
        content:
            'double-quote: " | backslash: \\ | backspace: \b | form-feed: \f | newline: \n | carriage-return: \r | tab: \t | unicode: \u0000',
    };
    writeFileSync(
        path.resolve(outDir, "NestedObject_SpecialChars.json"),
        a.serialize(NestedObject, nestedObjectWithSpecialChars),
    );

    const objectWithEveryFieldValue: ObjectWithEveryField = {
        string: "",
        boolean: false,
        timestamp: targetDate,
        float32: 1.5,
        float64: 1.5,
        int8: 1,
        uint8: 1,
        int16: 10,
        uint16: 10,
        int32: 100,
        uint32: 100,
        int64: 1000n,
        uint64: 1000n,
        enum: "BAZ",
        object: {
            id: "1",
            content: "hello world",
        },
        array: [true, false, false],
        record: {
            A: true,
            B: false,
        },
        discriminator: {
            typeName: "C",
            id: "",
            name: "",
            date: targetDate,
        },
        any: "hello world",
    };
    writeFileSync(
        path.resolve(outDir, "ObjectWithEveryField.json"),
        a.serialize(ObjectWithEveryField, objectWithEveryFieldValue),
    );
    const objectWithOptionalFieldsAllUndefined: ObjectWithOptionalFields = {};
    writeFileSync(
        path.resolve(outDir, "ObjectWithOptionalFields_AllUndefined.json"),
        a.serialize(
            ObjectWithOptionalFields,
            objectWithOptionalFieldsAllUndefined,
        ),
    );
    const objectWithOptionalFieldsNoUndefined: ObjectWithOptionalFields =
        objectWithEveryFieldValue;
    writeFileSync(
        path.resolve(outDir, "ObjectWithOptionalFields_NoUndefined.json"),
        a.serialize(
            ObjectWithOptionalFields,
            objectWithOptionalFieldsNoUndefined,
        ),
    );
    const objectWithNullableFieldsAllNull: ObjectWithNullableFields = {
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
        any: undefined,
    };
    writeFileSync(
        path.resolve(outDir, "ObjectWithNullableFields__AllNull.json"),
        a.serialize(ObjectWithNullableFields, objectWithNullableFieldsAllNull),
    );
    const objectWithNullableFieldsNoNull: ObjectWithNullableFields = {
        string: "",
        boolean: true,
        timestamp: targetDate,
        float32: 1.5,
        float64: 1.5,
        int8: 1,
        uint8: 1,
        int16: 10,
        uint16: 10,
        int32: 100,
        uint32: 100,
        int64: 1000n,
        uint64: 1000n,
        enum: "BAZ",
        object: {
            id: "",
            content: "",
        },
        array: [true, false, false],
        record: {
            A: true,
            B: false,
        },
        discriminator: {
            typeName: "C",
            id: "",
            name: "",
            date: targetDate,
        },
        any: {
            message: "hello world",
        },
    };
    writeFileSync(
        path.resolve(outDir, "ObjectWithNullableFields__NoNull.json"),
        a.serialize(ObjectWithNullableFields, objectWithNullableFieldsNoNull),
    );
}

void main();
