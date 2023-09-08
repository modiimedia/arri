import {
    SCHEMA_METADATA,
    type ArriSchema,
    type InputOptions,
} from "./typedefs";

export function nullable<T>(
    input: ArriSchema<T>,
    opts: InputOptions = {},
): ArriSchema<T | null> {
    const isType = (val: unknown): val is T | null => {
        if (val === null) {
            return true;
        }
        return input.metadata[SCHEMA_METADATA].validate(val);
    };
    return {
        ...input,
        nullable: true,
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: null as T | null,
                optional: input.metadata[SCHEMA_METADATA].optional,
                validate: isType,
                parse: (val: unknown) => {
                    if (val === null) {
                        return null;
                    }
                    return input.metadata[SCHEMA_METADATA].parse(val);
                },
                coerce: (val: unknown) => {
                    if (val === null) {
                        return null;
                    }
                    if (val === "null") {
                        return null;
                    }
                    return input.metadata[SCHEMA_METADATA].coerce(val);
                },
                serialize: (val) => {
                    if (val === null) {
                        return "null";
                    }
                    return input.metadata[SCHEMA_METADATA].serialize(val);
                },
            },
        },
    };
}

export function optional<T>(
    input: ArriSchema<T>,
    opts: InputOptions = {},
): ArriSchema<T | undefined> {
    const isType = (val: unknown): val is T | undefined => {
        if (typeof val === "undefined") {
            return true;
        }
        return input.metadata[SCHEMA_METADATA].validate(val);
    };
    return {
        ...input,
        metadata: {
            id: opts.id,
            description: opts.description,
            [SCHEMA_METADATA]: {
                output: undefined as T | undefined,
                optional: true,
                validate: isType,
                parse: (val) => {
                    if (typeof val === "undefined") {
                        return val;
                    }
                    return input.metadata[SCHEMA_METADATA].parse(val);
                },
                coerce: (val) => {
                    if (typeof val === "undefined") {
                        return val;
                    }
                    if (val === "undefined") {
                        return undefined;
                    }
                    return input.metadata[SCHEMA_METADATA].coerce(val);
                },
                serialize: (val) => {
                    if (typeof val === "undefined") {
                        return "undefined";
                    }
                    return input.metadata[SCHEMA_METADATA].serialize(val);
                },
            },
        },
    };
}
