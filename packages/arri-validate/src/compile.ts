/* eslint-disable @typescript-eslint/dot-notation */
import {
    a,
    type ValidationData,
    type NumberType,
    NumberValidationMap,
    type ValueError,
    ValidationError,
} from "./_index";

const NotificationSchema = a.discriminator("notificationType", {
    POST_LIKE: a.object({
        postId: a.string(),
        userId: a.string(),
    }),
    POST_COMMENT: a.object({
        postId: a.string(),
        userId: a.string(),
        commentText: a.string(),
    }),
});

const UserSchema = a.object({
    id: a.string(),
    name: a.optional(a.string()),
    createdAt: a.timestamp(),
    updatedAt: a.timestamp(),
    role: a.stringEnum(["standard", "admin", "moderator"]),
    numFollowers: a.uint32(),
    numFollowing: a.uint32(),
    rating: a.float64(),
    settings: a.optional(
        a.object({
            preferredTheme: a.stringEnum(["light", "dark", "system"]),
            allowNotifications: a.boolean(),
        }),
    ),
    recentNotifications: a.nullable(a.array(NotificationSchema)),
});
type UserSchema = a.infer<typeof UserSchema>;

function UserSchemaFromJson(json: Record<any, any>): UserSchema {
    const errors: ValueError[] = [];
    const result = {
        id: stringFromJson(json["id"], {
            instancePath: "/id",
            schemaPath: "/properties/id/type",
            errors,
        }),
        name: stringFromJson(json["name"], {
            instancePath: "/name",
            schemaPath: "/properties/name/type",
            errors,
        }),
        createdAt: timestampFromJson(json["createdAt"], {
            instancePath: "/createdAt",
            schemaPath: "/properties/createdAt/type",
            errors,
        }),
        updatedAt: timestampFromJson(json["updatedAt"], {
            instancePath: "/updatedAt",
            schemaPath: "/properties/updatedAt/type",
            errors,
        }),
    };
    if (errors.length) {
        throw new ValidationError({
            message: `Invalid input. ${errors[0]?.message}`,
            errors,
        });
    }
    return result as any;
}

function compiledExample(input: unknown): UserSchema {
    let parsedInput: Record<any, any>;
    if (typeof input === "string") {
        parsedInput = JSON.parse(input);
    } else if (typeof input === "object" && input) {
        parsedInput = input;
    } else {
        throw new ValidationError({
            errors: [],
            message: `Invalid input. Expected Object or JSON string.`,
        });
    }
    return UserSchemaFromJson(parsedInput);
}

function stringFromJson(
    input: unknown,
    data: ValidationData,
): string | undefined {
    if (typeof input !== "string") {
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: data.schemaPath,
            message: `Expected string. Got ${typeof input}`,
        });
        return undefined;
    }
    return input;
}

function numberFromJson(
    input: unknown,
    type: NumberType,
    data: ValidationData,
): number | undefined {
    if (typeof input !== "number") {
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: data.schemaPath,
            message: `Expected number. Got ${typeof input}`,
        });
        return undefined;
    }
    if (Number.isNaN(input)) {
        data.errors.push({
            instancePath: data.instancePath,
            schemaPath: data.schemaPath,
            message: `Expected number. Got NaN`,
        });
        return undefined;
    }
    const validationMap = NumberValidationMap[type];
    switch (type) {
        case "float32":
        case "float64":
            return input;
        case "int32":
        case "int16":
        case "uint16":
        case "uint32":
        case "uint8":
        case "int8":
            if (
                validateInt(
                    input,
                    validationMap.min ?? 0,
                    validationMap.max ?? 0,
                )
            ) {
                return input;
            }
            data.errors.push({
                instancePath: data.instancePath,
                schemaPath: data.schemaPath,
                message: `Expected integer between ${validationMap.min} and ${validationMap.max}.`,
            });
            return undefined;
    }
}

function validateInt(input: number, minVal: number, maxValue: number) {
    return Number.isInteger(input) && input >= minVal && input <= maxValue;
}

function timestampFromJson(
    json: unknown,
    data: ValidationData,
): Date | undefined {
    if (json instanceof Date) {
        return json;
    }
    if (typeof json === "string") {
        const result = Date.parse(json);
        if (Number.isNaN(result)) {
            data.errors.push({
                instancePath: data.instancePath,
                schemaPath: data.schemaPath,
                message: `Invalid date string`,
            });
            return undefined;
        }
        return new Date(result);
    }
    data.errors.push({
        instancePath: data.instancePath,
        schemaPath: data.schemaPath,
        message: `Expected ISO 8601 date string or instance of Date`,
    });
    return undefined;
}
