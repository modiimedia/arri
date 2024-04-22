import kotlinx.serialization.json.*
import java.time.Instant

class ExampleClient {
}

data class ExamplePayload(
    val string: String,
    val boolean: Boolean,
    val timestamp: Instant,
    val float32: Float,
    val float64: Double,
    val int8: Byte,
    val uint8: UByte,
    val int16: Short,
    val uint16: UShort,
    val int32: Int,
    val uint32: UInt,
    val int64: Long,
    val uint64: ULong,
    val enum: ExampleEnum,
    val _object: ExampleObject,
    val array: List<Boolean>,
    val record: Map<String, Boolean>,
    val any: JsonElement,
) {
    companion object Factory {
        fun fromJson(input: JsonElement): ExamplePayload {
            return ExamplePayload(
                string =
                    if (input.jsonObject["string"]?.jsonPrimitive?.isString == true)
                        input.jsonObject["string"]!!.jsonPrimitive.content
                    else "",
                boolean =
                    if (input.jsonObject["boolean"]?.jsonPrimitive?.booleanOrNull is Boolean)
                        input.jsonObject["boolean"]!!.jsonPrimitive.boolean
                    else false,
                timestamp =
                    if (input.jsonObject["timestamp"]?.jsonPrimitive?.isString == true)
                        Instant.parse(input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else Instant.now(),
                float32 =
                    if (input.jsonObject["float32"]?.jsonPrimitive?.floatOrNull is Float)
                        input.jsonObject["float32"]!!.jsonPrimitive.float
                    else 0.0f,
                float64 =
                    if (input.jsonObject["float64"]?.jsonPrimitive?.doubleOrNull is Double)
                        input.jsonObject["float64"]!!.jsonPrimitive.double
                    else 0.0,
                int8 =
                    if (input.jsonObject["int8"]?.jsonPrimitive?.intOrNull is Int)
                       input.jsonObject["int8"]!!.jsonPrimitive.int.toByte()
                    else 0,
                uint8 =
                    if (input.jsonObject["uint8"]?.jsonPrimitive?.intOrNull is Int)
                        input.jsonObject["uint8"]!!.jsonPrimitive.int.toUByte()
                    else 0u,
                int16 =
                    if (input.jsonObject["int16"]?.jsonPrimitive?.intOrNull is Int)
                        input.jsonObject["int16"]!!.jsonPrimitive.int.toShort()
                    else 0,
                uint16 =
                    if (input.jsonObject["uint16"]?.jsonPrimitive?.intOrNull is Int)
                        input.jsonObject["uint16"]!!.jsonPrimitive.int.toUShort()
                    else 0u,
                int32 =
                    if (input.jsonObject["int32"]?.jsonPrimitive?.intOrNull is Int)
                        input.jsonObject["int32"]!!.jsonPrimitive.int
                    else 0,
                uint32 =
                    if (input.jsonObject["uint32"]?.jsonPrimitive?.longOrNull is Long)
                        input.jsonObject["uint32"]!!.jsonPrimitive.long.toUInt()
                    else 0u,
                int64 =
                    if (input.jsonObject["int64"]?.jsonPrimitive?.longOrNull is Long)
                        input.jsonObject["int64"]!!.jsonPrimitive.long
                    else 0L,
                uint64 =
                    if (input.jsonObject["uint64"]?.jsonPrimitive?.isString == true)
                        input.jsonObject["uint64"]!!.jsonPrimitive.content.toULongOrNull() ?: 0UL
                    else 0UL,
                enum = ExampleEnum.fromJson(input.jsonObject["enum"] ?: JsonPrimitive("")),
                _object = ExampleObject.fromJson(input.jsonObject["object"] ?: JsonObject(mapOf())),
                array = listOf(),
                record = mapOf(),
                any = JsonNull,
            )
        }
    }
}

enum class ExampleEnum {
    Foo,
    Bar,
    Baz;

    companion object Factory {
        fun fromJson(input: JsonElement): ExampleEnum {
            if (input.jsonPrimitive.isString) {
                return when (input.jsonPrimitive.content) {
                    "FOO" -> Foo
                    "BAR" -> Bar
                    "BAZ" -> Baz
                    else -> Foo
                }
            }
            return Foo
        }
    }

    fun toJsonString(): String {
        return when (this) {
            Foo -> "FOO"
            Bar -> "BAR"
            Baz -> "BAZ"
        }
    }
}

data class ExampleObject(
    val id: String,
    val content: String,
) {
    companion object Factory {
        fun fromJson(input: JsonElement): ExampleObject {
            return ExampleObject(
                id =
                    input.jsonObject["id"]?.jsonPrimitive?.contentOrNull ?: "",
                content =
                    input.jsonObject["content"]?.jsonPrimitive?.contentOrNull ?: ""
            )
        }
    }

    fun toJsonString(): String {
        var result = "{"
        result += "\"id\":"
        result += "\"${id}\""
        result += ",\"content\":"
        result += "\"${content}\""
        return result
    }
}