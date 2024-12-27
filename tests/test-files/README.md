Below are all of the contents of the test JSON files in an easier to read format. Since all of the test files are minified.

## Book.json

```json
{
  "id": "1",
  "name": "The Adventures of Tom Sawyer",
  "createdAt": "2001-01-01T16:00:00.000Z",
  "updatedAt": "2001-01-01T16:00:00.000Z"
}
```

## BookParams.json

```json
{ "bookId": "1" }
```

## NestedObject_NoSpecialChars.json

```json
{ "id": "1", "content": "hello world" }
```

## NestedObject_SpecialChars.json

```json
{
  "id": "1",
  "content": "double-quote: \" | backslash: \\ | backspace: \b | form-feed: \f | newline: \n | carriage-return: \r | tab: \t | unicode: \u0000"
}
```

## ObjectWithEveryType.json

```json
{
  "string": "",
  "boolean": false,
  "timestamp": "2001-01-01T16:00:00.000Z",
  "float32": 1.5,
  "float64": 1.5,
  "int8": 1,
  "uint8": 1,
  "int16": 10,
  "uint16": 10,
  "int32": 100,
  "uint32": 100,
  "int64": "1000",
  "uint64": "1000",
  "enum": "BAZ",
  "object": { "id": "1", "content": "hello world" },
  "array": [true, false, false],
  "record": { "A": true, "B": false },
  "discriminator": {
    "typeName": "C",
    "id": "",
    "name": "",
    "date": "2001-01-01T16:00:00.000Z"
  },
  "any": "hello world"
}
```

## ObjectWithEveryType_ReversedRecord.json

```json
{
  "string": "",
  "boolean": false,
  "timestamp": "2001-01-01T16:00:00.000Z",
  "float32": 1.5,
  "float64": 1.5,
  "int8": 1,
  "uint8": 1,
  "int16": 10,
  "uint16": 10,
  "int32": 100,
  "uint32": 100,
  "int64": "1000",
  "uint64": "1000",
  "enum": "BAZ",
  "object": { "id": "1", "content": "hello world" },
  "array": [true, false, false],
  "record": { "B": false, "A": true },
  "discriminator": {
    "typeName": "C",
    "id": "",
    "name": "",
    "date": "2001-01-01T16:00:00.000Z"
  },
  "any": "hello world"
}
```

## ObjectWithOptionalFields_AllUndefined.json

```json
{}
```

## ObjectWithOptionalFields_NoUndefined.json

```json
{
  "string": "",
  "boolean": false,
  "timestamp": "2001-01-01T16:00:00.000Z",
  "float32": 1.5,
  "float64": 1.5,
  "int8": 1,
  "uint8": 1,
  "int16": 10,
  "uint16": 10,
  "int32": 100,
  "uint32": 100,
  "int64": "1000",
  "uint64": "1000",
  "enum": "BAZ",
  "object": { "id": "1", "content": "hello world" },
  "array": [true, false, false],
  "record": { "A": true, "B": false },
  "discriminator": {
    "typeName": "C",
    "id": "",
    "name": "",
    "date": "2001-01-01T16:00:00.000Z"
  },
  "any": "hello world"
}
```

## ObjectWithOptionalFields_NoUndefined_ReversedRecord.json

```json
{
  "string": "",
  "boolean": false,
  "timestamp": "2001-01-01T16:00:00.000Z",
  "float32": 1.5,
  "float64": 1.5,
  "int8": 1,
  "uint8": 1,
  "int16": 10,
  "uint16": 10,
  "int32": 100,
  "uint32": 100,
  "int64": "1000",
  "uint64": "1000",
  "enum": "BAZ",
  "object": { "id": "1", "content": "hello world" },
  "array": [true, false, false],
  "record": { "B": false, "A": true },
  "discriminator": {
    "typeName": "C",
    "id": "",
    "name": "",
    "date": "2001-01-01T16:00:00.000Z"
  },
  "any": "hello world"
}
```

## ObjectWithNullableFields_AllNull.json

```json
{
  "string": null,
  "boolean": null,
  "timestamp": null,
  "float32": null,
  "float64": null,
  "int8": null,
  "uint8": null,
  "int16": null,
  "uint16": null,
  "int32": null,
  "uint32": null,
  "int64": null,
  "uint64": null,
  "enum": null,
  "object": null,
  "array": null,
  "record": null,
  "discriminator": null,
  "any": null
}
```

## ObjectWithNullableFields_NoNull.json

```json
{
  "string": "",
  "boolean": true,
  "timestamp": "2001-01-01T16:00:00.000Z",
  "float32": 1.5,
  "float64": 1.5,
  "int8": 1,
  "uint8": 1,
  "int16": 10,
  "uint16": 10,
  "int32": 100,
  "uint32": 100,
  "int64": "1000",
  "uint64": "1000",
  "enum": "BAZ",
  "object": { "id": "", "content": "" },
  "array": [true, false, false],
  "record": { "A": true, "B": false },
  "discriminator": {
    "typeName": "C",
    "id": "",
    "name": "",
    "date": "2001-01-01T16:00:00.000Z"
  },
  "any": { "message": "hello world" }
}
```

## ObjectWithNullableFields_NoNull_ReversedRecord.json

```json
{
  "string": "",
  "boolean": true,
  "timestamp": "2001-01-01T16:00:00.000Z",
  "float32": 1.5,
  "float64": 1.5,
  "int8": 1,
  "uint8": 1,
  "int16": 10,
  "uint16": 10,
  "int32": 100,
  "uint32": 100,
  "int64": "1000",
  "uint64": "1000",
  "enum": "BAZ",
  "object": { "id": "", "content": "" },
  "array": [true, false, false],
  "record": { "B": false, "A": true },
  "discriminator": {
    "typeName": "C",
    "id": "",
    "name": "",
    "date": "2001-01-01T16:00:00.000Z"
  },
  "any": { "message": "hello world" }
}
```

## RecursiveObject.json

```json
{
  "left": {
    "left": { "left": null, "right": { "left": null, "right": null } },
    "right": null
  },
  "right": { "left": null, "right": null }
}
```
