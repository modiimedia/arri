import { a } from "arri-validate";
import { kotlinClassFromSchema } from "./index";

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

        if (boolean != other?.boolean) return false
        if (string != other?.string) return false
        if (timestamp != other?.timestamp) return false
        if (float64 != other?.float64) return false
        if (float32 != other?.float32) return false
        if (int8 != other?.int8) return false
        if (int16 != other?.int16) return false
        if (int32 != other?.int32) return false
        if (int64 != other?.int64) return false
        if (uint8 != other?.uint8) return false
        if (uint16 != other?.uint16) return false
        if (uint32 != other?.uint32) return false
        if (uint64 != other?.uint64) return false
        if (enum != other?.enum) return false

        return true
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

        if (message != other?.message) return false
        if (messageId != other?.messageId) return false

        return true
    }
}

`);
    });
});
