import { normalizeWhitespace } from "arri-codegen-utils";
import { a } from "arri-validate";
import {
    kotlinClassFromSchema,
    kotlinPropertyFromSchema,
    kotlinSealedClassedFromSchema,
} from "./index";

describe("Model Generation", () => {
    it("handles every scalar field type", () => {
        const User = a.object(
            {
                boolean: a.boolean(),
                string: a.string(),
                timestamp: a.timestamp(),
                float64: a.float64(),
                float32: a.float32(),
                int8: a.int8(),
                int16: a.int16(),
                int32: a.int32(),
                int64: a.int64(),
                uint8: a.uint8(),
                uint16: a.uint16(),
                uint32: a.uint32(),
                uint64: a.uint64(),
                enum: a.enumerator(["OPTION_A", "OPTION_B"]),
            },
            {
                id: "User",
            },
        );
        const result = kotlinClassFromSchema(User, {
            instancePath: "User",
            schemaPath: "",
            generatedTypes: [],
        });
        expect(result.content).toBe(`@Serializable
data class User(
    val boolean: Boolean,
    val string: String,
    @Serializable(with = InstantAsStringSerializer::class)
    val timestamp: Instant,
    val float64: Double,
    val float32: Float,
    val int8: Byte,
    val int16: Short,
    val int32: Int,
    val int64: Long,
    val uint8: UByte,
    val uint16: UShort,
    val uint32: UInt,
    val uint64: ULong,
    val enum: UserEnum,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as User

        if (boolean != other.boolean) return false
        if (string != other.string) return false
        if (timestamp != other.timestamp) return false
        if (float64 != other.float64) return false
        if (float32 != other.float32) return false
        if (int8 != other.int8) return false
        if (int16 != other.int16) return false
        if (int32 != other.int32) return false
        if (int64 != other.int64) return false
        if (uint8 != other.uint8) return false
        if (uint16 != other.uint16) return false
        if (uint32 != other.uint32) return false
        if (uint64 != other.uint64) return false
        if (enum != other.enum) return false

        return true
    }

    override fun hashCode(): Int {
        var result = boolean.hashCode()
        result = 31 * result + string.hashCode()
        result = 31 * result + timestamp.hashCode()
        result = 31 * result + float64.hashCode()
        result = 31 * result + float32.hashCode()
        result = 31 * result + int8.hashCode()
        result = 31 * result + int16.hashCode()
        result = 31 * result + int32.hashCode()
        result = 31 * result + int64.hashCode()
        result = 31 * result + uint8.hashCode()
        result = 31 * result + uint16.hashCode()
        result = 31 * result + uint32.hashCode()
        result = 31 * result + uint64.hashCode()
        result = 31 * result + enum.hashCode()
        return result
    }
}

enum class UserEnum() {
    @SerialName("OPTION_A")
    OptionA,
    @SerialName("OPTION_B")
    OptionB,
}`);
    });
    it("handles nullable and optional types", () => {
        const Schema = a.object({
            message: a.nullable(a.string()),
            messageId: a.optional(a.string()),
        });
        const result = kotlinClassFromSchema(Schema, {
            generatedTypes: [],
            instancePath: "Schema",
            schemaPath: "",
        });
        expect(result.content).toBe(`@Serializable
data class Schema(
    val message: String?,
    val messageId: String? = null,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Schema

        if (message != other.message) return false
        if (messageId != other.messageId) return false

        return true
    }

    override fun hashCode(): Int {
        var result = (message?.hashCode() ?: 0)
        return result
    }
}

`);
    });

    it("handle arrays and nested arrays", () => {
        const Schema = a.object({
            messages: a.array(a.string()),
            favoriteMessages: a.nullable(a.array(a.string())),
            users: a.array(
                a.object(
                    {
                        id: a.string(),
                        email: a.nullable(a.string()),
                    },
                    { id: "User" },
                ),
            ),
            positions: a.array(a.array(a.number())),
        });

        const result = kotlinClassFromSchema(Schema, {
            generatedTypes: ["User"],
            instancePath: "Schema",
            schemaPath: "",
        });
        expect(normalizeWhitespace(result.content ?? "")).toBe(
            normalizeWhitespace(`@Serializable
data class Schema(
    val messages: Array<String>,
    val favoriteMessages: Array<String>?,
    val users: Array<User>,
    val positions: Array<Array<Double>>,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        
        other as Schema

        if (!messages.contentEquals(other.messages)) return false
        if (favoriteMessages?.contentEquals(other.favoriteMessages) != true) return false
        if (!users.contentEquals(other.users)) return false
        if (!positions.contentEquals(other.positions)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = messages.contentHashCode()
        result = 31 * result + (favoriteMessages?.contentHashCode() ?: 0)
        result = 31 * result + users.contentHashCode()
        result = 31 * result + positions.contentHashCode()
        return result
    }
}

`),
        );
    });

    it("handles discriminated unions", () => {
        const Message = a.discriminator(
            "type",
            {
                TEXT: a.object({
                    id: a.string(),
                    userId: a.string(),
                    content: a.string(),
                }),
                IMAGE: a.object({
                    id: a.string(),
                    userId: a.string(),
                    imageUrl: a.string(),
                }),
            },
            { id: "Message" },
        );
        const result = kotlinSealedClassedFromSchema(Message, {
            generatedTypes: [],
            instancePath: "message",
            schemaPath: "",
        });
        expect(normalizeWhitespace(result.content ?? "")).toBe(
            normalizeWhitespace(`@Serializable
sealed class Message()

@Serializable
@SerialName("TEXT")
data class MessageText(
    val id: String,
    val userId: String,
    val content: String,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as MessageText

        if (id != other.id) return false
        if (userId != other.userId) return false
        if (content != other.content) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + userId.hashCode()
        result = 31 * result + content.hashCode()
        return result
    }
}

@Serializable
@SerialName("IMAGE")
data class MessageImage(
    val id: String,
    val userId: String,
    val imageUrl: String,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        
        other as MessageImage

        if (id != other.id) return false
        if (userId != other.userId) return false
        if (imageUrl != other.imageUrl) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + userId.hashCode()
        result = 31 * result + imageUrl.hashCode()
        return result
    }
}`),
        );
    });

    it("handles records", () => {
        const Schema = a.object({
            postIds: a.record(a.string()),
            users: a.record(
                a.object(
                    {
                        id: a.string(),
                        email: a.nullable(a.string()),
                    },
                    {
                        id: "User",
                    },
                ),
            ),
        });
        const result = kotlinPropertyFromSchema(Schema, {
            generatedTypes: ["User"],
            instancePath: "Schema",
            schemaPath: "",
        });
        expect(normalizeWhitespace(result.content ?? "")).toBe(
            normalizeWhitespace(`@Serializable
data class Schema(
    val postIds: Map<String, String>,
    val users: Map<String, User>,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        
        other as Schema

        if (postIds != other.postIds) return false
        if (users != other.users) return false

        return true
    }

    override fun hashCode(): Int {
        var result = postIds.hashCode()
        result = 31 * result + users.hashCode()
        return result
    }
}`),
        );
    });
});
