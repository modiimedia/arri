import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.*
import java.time.Instant
import java.time.format.DateTimeFormatter

private val JsonInstance = Json {
    encodeDefaults = true
    ignoreUnknownKeys = true
}

val timestampFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")

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
        fun fromJson(input: String): ExamplePayload {
            return ExamplePayload.fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        fun fromJsonElement(input: JsonElement): ExamplePayload {

            val array = mutableListOf<Boolean>()
            for (item in input.jsonObject["array"]?.jsonArray ?: listOf()) {
                array.add(item.jsonPrimitive.booleanOrNull ?: false)
            }
            val record = mutableMapOf<String, Boolean>()
            if (input.jsonObject["record"] != null) {
                for (item in input.jsonObject["record"]!!.jsonObject.entries) {
                    record[item.key] = item.value.jsonPrimitive.booleanOrNull ?: false
                }
            }

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
                enum = ExampleEnum.fromJsonElement(input.jsonObject["enum"] ?: JsonPrimitive("")),
                _object = ExampleObject.fromJsonElement(input.jsonObject["object"] ?: JsonObject(mapOf())),
                array = array,
                record = record,
                any = input.jsonObject["any"] ?: JsonNull,
            )
        }
    }

    fun toJson(): String {
        var output = "{"
        output += "\"string\":"
        output += buildString { printQuoted(string) }
        output += ",\"boolean\":"
        output += boolean.toString()
        output += ",\"timestamp\":"
        output += "\"${timestampFormatter.format(timestamp)}\""
        output += ",\"float32\":"
        output += float32.toString()
        output += ",\"float64\":"
        output += float64.toString()
        output += ",\"int8\":"
        output += int8.toString()
        output += ",\"uint8\":"
        output += uint8.toString()
        output += ",\"int16\":"
        output += int16.toString()
        output += ",\"uint16\":"
        output += uint16.toString()
        output += ",\"int32\":"
        output += int32.toString()
        output += ",\"uint32\":"
        output += uint32.toString()
        output += ",\"int64\":"
        output += "\"${int64}\""
        output += ",\"uint64\":"
        output += "\"${uint64}\""
        output += ",\"enum\":"
        output += "\"${enum.serialValue}\""
        output += ",\"object\":"
        output += _object.toJsonString()
        output += ",\"array\":"
        output += "["
        for ((index, arrayItem) in array.withIndex()) {
            if (index != 0) {
                output += ","
            }
            output += arrayItem
        }
        output += "]"
        output += ",\"record\":"
        output += "{"
        for ((index, entry) in record.entries.withIndex()) {
            if (index != 0) {
                output += ","
            }
            output += "\"${entry.key}\":"
            output += entry.value
        }
        output += "}"
        output += ",\"any\":"
        output += JsonInstance.encodeToString(any)
        output += "}"
        return output
    }
}

enum class ExampleEnum {
    Foo,
    Bar,
    Baz;

    companion object Factory {
        fun fromJson(input: String): ExampleEnum {
            return ExampleEnum.fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        fun fromJsonElement(input: JsonElement): ExampleEnum {
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

    val serialValue: String
        get() =
            when (this) {
                Foo -> "FOO"
                Bar -> "BAR"
                Baz -> "BAZ"
            }

}

data class ExampleObject(
    val id: String,
    val content: String,
) {
    companion object Factory {
        fun fromJson(input: String): ExampleObject {
            return ExampleObject.fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        fun fromJsonElement(input: JsonElement): ExampleObject {
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
        result += buildString { printQuoted(id) }
        result += ",\"content\":"
        result += buildString { printQuoted(content) }
        result += "}"
        return result
    }
}

// Implementation copied from https://github.com/Kotlin/kotlinx.serialization/blob/d0ae697b9394103879e6c7f836d0f7cf128f4b1e/formats/json/commonMain/src/kotlinx/serialization/json/internal/StringOps.kt#L45
internal const val STRING = '"'

private fun toHexChar(i: Int): Char {
    val d = i and 0xf
    return if (d < 10) (d + '0'.code).toChar()
    else (d - 10 + 'a'.code).toChar()
}

internal val ESCAPE_STRINGS: Array<String?> = arrayOfNulls<String>(93).apply {
    for (c in 0..0x1f) {
        val c1 = toHexChar(c shr 12)
        val c2 = toHexChar(c shr 8)
        val c3 = toHexChar(c shr 4)
        val c4 = toHexChar(c)
        this[c] = "\\u$c1$c2$c3$c4"
    }
    this['"'.code] = "\\\""
    this['\\'.code] = "\\\\"
    this['\t'.code] = "\\t"
    this['\b'.code] = "\\b"
    this['\n'.code] = "\\n"
    this['\r'.code] = "\\r"
    this[0x0c] = "\\f"
}

internal val ESCAPE_MARKERS: ByteArray = ByteArray(93).apply {
    for (c in 0..0x1f) {
        this[c] = 1.toByte()
    }
    this['"'.code] = '"'.code.toByte()
    this['\\'.code] = '\\'.code.toByte()
    this['\t'.code] = 't'.code.toByte()
    this['\b'.code] = 'b'.code.toByte()
    this['\n'.code] = 'n'.code.toByte()
    this['\r'.code] = 'r'.code.toByte()
    this[0x0c] = 'f'.code.toByte()
}

internal fun StringBuilder.printQuoted(value: String) {
    append(STRING)
    var lastPos = 0
    for (i in value.indices) {
        val c = value[i].code
        if (c < ESCAPE_STRINGS.size && ESCAPE_STRINGS[c] != null) {
            append(value, lastPos, i) // flush prev
            append(ESCAPE_STRINGS[c])
            lastPos = i + 1
        }
    }

    if (lastPos != 0) append(value, lastPos, value.length)
    else append(value)
    append(STRING)
}
