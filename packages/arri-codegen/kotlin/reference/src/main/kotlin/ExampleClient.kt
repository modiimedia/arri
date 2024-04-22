import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.*
import java.time.Instant
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

private val JsonInstance = Json {
    encodeDefaults = true
    ignoreUnknownKeys = true
}

private val timestampFormatter =
    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        .withZone(ZoneId.ofOffset("GMT", ZoneOffset.UTC))

interface ExampleClientModel {
    fun toJson(): String
    fun toUrlQueryParams(): String
}

class ExampleClient {
}

data class NestedObject(
    val id: String,
    val content: String,
) : ExampleClientModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"id\":"
        output += buildString { printQuoted(id) }
        output += ",\"content\":"
        output += buildString { printQuoted(content) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("id=${id}")
        queryParts.add("content=${content}")
        return queryParts.joinToString("&")
    }

    companion object Factory {
        @JvmStatic
        fun fromJson(input: String): NestedObject {
            return NestedObject.fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        fun fromJsonElement(input: JsonElement): NestedObject {
            val id = input.jsonObject["id"]?.jsonPrimitive?.contentOrNull ?: ""
            val content = input.jsonObject["content"]?.jsonPrimitive?.contentOrNull ?: ""
            return NestedObject(
                id,
                content,
            )
        }
    }

}

data class ObjectWithEveryField(
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
    val enum: Enumerator,
    val `object`: NestedObject,
    val array: List<Boolean>,
    val record: Map<String, Boolean>,
    val discriminator: Discriminator,
    val any: JsonElement,
) : ExampleClientModel {

    override fun toJson(): String {
        var output = "{"
        output += "\"string\":"
        output += buildString { printQuoted(string) }
        output += ",\"boolean\":"
        output += boolean
        output += ",\"timestamp\":"
        output += "\"${timestampFormatter.format(timestamp)}\""
        output += ",\"float32\":"
        output += float32
        output += ",\"float64\":"
        output += float64
        output += ",\"int8\":"
        output += int8
        output += ",\"uint8\":"
        output += uint8
        output += ",\"int16\":"
        output += int16
        output += ",\"uint16\":"
        output += uint16
        output += ",\"int32\":"
        output += int32
        output += ",\"uint32\":"
        output += uint32
        output += ",\"int64\":"
        output += "\"${int64}\""
        output += ",\"uint64\":"
        output += "\"${uint64}\""
        output += ",\"enum\":"
        output += "\"${enum.serialValue}\""
        output += ",\"object\":"
        output += `object`.toJson()
        output += ",\"array\":"
        output += "["
        for ((index, item) in array.withIndex()) {
            if (index != 0) {
                output += ","
            }
            output += item
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
        output += ",\"discriminator\":"
        output += discriminator.toJson()
        output += ",\"any\":"
        output += JsonInstance.encodeToString(any)
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("id=${string}")
        queryParts.add("boolean=${boolean}")
        queryParts.add("timestamp=${timestampFormatter.format(timestamp)}")
        queryParts.add("float32=${float32}")
        queryParts.add("float64=${float64}")
        queryParts.add("int8=${int8}")
        queryParts.add("uint8=${uint8}")
        queryParts.add("int16=${int16}")
        queryParts.add("uint16=${uint16}")
        queryParts.add("int32=${int32}")
        queryParts.add("uint32=${uint32}")
        queryParts.add("int64=${int64}")
        queryParts.add("uint64=${uint64}")
        queryParts.add("enum=${enum.serialValue}")
        println("WARNING: nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryField/object")
        println("WARNING: arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryField/array")
        println("WARNING: nested objects cannot be serialized to query params. Skipping at /ObjectWithEveryField/record")
        println("WARNING: nested objects cannot be serialized to query params. Skipping at /ObjectWithEveryField/discriminator")
        return queryParts.joinToString("&")
    }

    companion object Factory {
        @JvmStatic
        fun fromJson(input: String): ObjectWithEveryField {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        fun fromJsonElement(input: JsonElement): ObjectWithEveryField {
            val string: String = input.jsonObject["string"]?.jsonPrimitive?.contentOrNull ?: ""
            val boolean: Boolean = input.jsonObject["boolean"]?.jsonPrimitive?.booleanOrNull ?: false
            val timestamp: Instant =
                if (input.jsonObject["timestamp"]?.jsonPrimitive?.isString == true)
                    Instant.parse(input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                else Instant.now()
            val float32: Float = input.jsonObject["float32"]?.jsonPrimitive?.floatOrNull ?: 0.0F
            val float64: Double = input.jsonObject["float64"]?.jsonPrimitive?.doubleOrNull ?: 0.0
            val int8: Byte = input.jsonObject["int8"]?.jsonPrimitive?.intOrNull?.toByte() ?: 0
            val uint8: UByte = input.jsonObject["uint8"]?.jsonPrimitive?.intOrNull?.toUByte() ?: 0u
            val int16: Short = input.jsonObject["int16"]?.jsonPrimitive?.intOrNull?.toShort() ?: 0
            val uint16: UShort = input.jsonObject["uint16"]?.jsonPrimitive?.intOrNull?.toUShort() ?: 0u
            val int32: Int = input.jsonObject["int32"]?.jsonPrimitive?.intOrNull ?: 0
            val uint32: UInt = input.jsonObject["uint32"]?.jsonPrimitive?.contentOrNull?.toUIntOrNull() ?: 0u
            val int64: Long = input.jsonObject["int64"]?.jsonPrimitive?.longOrNull ?: 0L
            val uint64: ULong = input.jsonObject["uint64"]?.jsonPrimitive?.contentOrNull?.toULongOrNull() ?: 0UL
            val enum: Enumerator = Enumerator.fromJsonElement(input.jsonObject["enum"] ?: JsonPrimitive(""))
            val `object`: NestedObject =
                NestedObject.fromJsonElement(input.jsonObject["object"]?.jsonObject ?: JsonObject(mapOf()))
            val array: MutableList<Boolean> = mutableListOf()
            if (input.jsonObject["array"]?.jsonArray != null) {
                for (item in input.jsonObject["array"]!!.jsonArray) {
                    array.add(item.jsonPrimitive.booleanOrNull ?: false)
                }
            }
            val record: MutableMap<String, Boolean> = mutableMapOf()
            if (input.jsonObject["record"]?.jsonObject != null) {
                for (entry in input.jsonObject["record"]!!.jsonObject) {
                    record[entry.key] = entry.value.jsonPrimitive.booleanOrNull ?: false
                }
            }
            val discriminator: Discriminator = Discriminator.fromJsonElement(
                input.jsonObject["discriminator"]?.jsonObject ?: JsonObject(
                    mapOf()
                )
            )
            val any: JsonElement = input.jsonObject["any"] ?: JsonNull
            return ObjectWithEveryField(
                string,
                boolean,
                timestamp,
                float32,
                float64,
                int8,
                uint8,
                int16,
                uint16,
                int32,
                uint32,
                int64,
                uint64,
                enum,
                `object`,
                array,
                record,
                discriminator,
                any,
            )
        }
    }
}

enum class Enumerator {
    Foo,
    Bar,
    Baz;

    val serialValue: String
        get() = when (this) {
            Foo -> "FOO"
            Bar -> "BAR"
            Baz -> "BAZ"
        }

    companion object Factory {
        @JvmStatic
        fun fromJson(input: String): Enumerator {
            return Enumerator.fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        fun fromJsonElement(input: JsonElement): Enumerator {
            return when (input.jsonPrimitive.contentOrNull) {
                "FOO" -> Foo
                "BAR" -> Bar
                "BAZ" -> Baz
                else -> Foo
            }
        }
    }
}

sealed interface Discriminator : ExampleClientModel {
    val typeName: String

    companion object {
        @JvmStatic
        fun fromJson(input: String): Discriminator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        fun fromJsonElement(input: JsonElement): Discriminator {
            return when (input.jsonObject["typeName"]?.jsonPrimitive?.contentOrNull) {
                "A" -> DiscriminatorA.fromJsonElement(input)
                "B" -> DiscriminatorB.fromJsonElement(input)
                "C" -> DiscriminatorC.fromJsonElement(input)
                else -> DiscriminatorA.fromJsonElement(input)
            }
        }
    }
}

data class DiscriminatorA(
    val id: String,
) : Discriminator {
    override val typeName get() = "A"

    override fun toJson(): String {
        var output = "{"
        output += "\"typeName\":\"A\""
        output += ",\"id\":"
        output += buildString { printQuoted(id) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("typeName=A")
        queryParts.add("id=${id}")
        return queryParts.joinToString("&")
    }

    companion object Factory {
        @JvmStatic
        fun fromJson(input: String): DiscriminatorA {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        fun fromJsonElement(input: JsonElement): DiscriminatorA {
            val id = input.jsonObject["id"]?.jsonPrimitive?.contentOrNull ?: ""
            return DiscriminatorA(
                id
            )
        }
    }
}

data class DiscriminatorB(
    val id: String,
    val name: String,
) : Discriminator {
    override val typeName get() = "B"

    override fun toJson(): String {
        var output = "{"
        output += "\"typeName\":\"B\""
        output += ",\"id\":"
        output += buildString { printQuoted(id) }
        output += ",\"name\":"
        output += buildString { printQuoted(name) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("typeName=B")
        queryParts.add("id=${id}")
        queryParts.add("name=${name}")
        return queryParts.joinToString("&")
    }

    companion object Factory {
        @JvmStatic
        fun fromJson(input: String): DiscriminatorB {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        fun fromJsonElement(input: JsonElement): DiscriminatorB {
            val id = input.jsonObject["id"]?.jsonPrimitive?.contentOrNull ?: ""
            val name = input.jsonObject["name"]?.jsonPrimitive?.contentOrNull ?: ""
            return DiscriminatorB(
                id,
                name,
            )
        }
    }
}

data class DiscriminatorC(val id: String, val name: String, val date: Instant) : Discriminator {
    override val typeName get() = "C"
    override fun toJson(): String {
        var output = "{"
        output += "\"typeName\":\"C\""
        output += ",\"id\":"
        output += buildString { printQuoted(id) }
        output += ",\"name\":"
        output += buildString { printQuoted(name) }
        output += ",\"date\":"
        output += "\"${timestampFormatter.format(date)}\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("typeName=C")
        queryParts.add("id=${id}")
        queryParts.add("name=${name}")
        queryParts.add("date=${timestampFormatter.format(date)}")
        return queryParts.joinToString("&")
    }

    companion object Factory {
        @JvmStatic
        fun fromJson(input: String): DiscriminatorC {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        fun fromJsonElement(input: JsonElement): DiscriminatorC {
            val id = input.jsonObject["id"]?.jsonPrimitive?.contentOrNull ?: ""
            val name = input.jsonObject["name"]?.jsonPrimitive?.contentOrNull ?: ""
            val date =
                if (input.jsonObject["date"]?.jsonPrimitive?.isString == true)
                    Instant.parse(input.jsonObject["date"]!!.jsonPrimitive.content)
                else Instant.now()
            return DiscriminatorC(
                id,
                name,
                date,
            )
        }
    }
}

data class ObjectWithOptionalFields(
    val string: String? = null,
    val boolean: Boolean? = null,
    val timestamp: Instant? = null,
    val float32: Float? = null,
    val float64: Double? = null,
    val int8: Byte? = null,
    val uint8: UByte? = null,
    val int16: Short? = null,
    val uint16: UShort? = null,
    val int32: Int? = null,
    val uint32: UInt? = null,
    val int64: Long? = null,
    val uint64: ULong? = null,
    val enum: Enumerator? = null,
    val `object`: NestedObject? = null,
    val array: List<Boolean>? = null,
    val record: Map<String, Boolean>? = null,
    val discriminator: Discriminator? = null,
    val any: JsonElement? = null
) : ExampleClientModel {
    override fun toJson(): String {
        var output = "{"
        var hasProperties = false
        if (string != null) {
            output += "\"string\":"
            output += buildString { printQuoted(string) }
            hasProperties = true
        }
        if (boolean != null) {
            if (hasProperties) output += ","
            output += "\"boolean\":"
            output += boolean
            hasProperties = true
        }
        if (timestamp != null) {
            if (hasProperties) output += ","
            output += "\"timestamp\":"
            output += "\"${timestampFormatter.format(timestamp)}\""
            hasProperties = true
        }
        if (float32 != null) {
            if (hasProperties) output += ","
            output += "\"float32\":"
            output += float32
            hasProperties = true
        }
        if (float64 != null) {
            if (hasProperties) output += ","
            output += "\"float64\":"
            output += float64
            hasProperties = true
        }
        if (int8 != null) {
            if (hasProperties) output += ","
            output += "\"int8\":"
            output += int8
            hasProperties = true
        }
        if (uint8 != null) {
            if (hasProperties) output += ","
            output += "\"uint8\":"
            output += uint8
            hasProperties = true
        }
        if (int16 != null) {
            if (hasProperties) output += ","
            output += "\"int16\":"
            output += int16
            hasProperties = true
        }
        if (uint16 != null) {
            if (hasProperties) output += ","
            output += "\"uint16\":"
            output += uint16
            hasProperties = true
        }
        if (int32 != null) {
            if (hasProperties) output += ","
            output += "\"int32\":"
            output += int32
            hasProperties = true
        }
        if (uint32 != null) {
            if (hasProperties) output += ","
            output += "\"uint32\":"
            output += uint32
            hasProperties = true
        }
        if (int64 != null) {
            if (hasProperties) output += ","
            output += "\"int64\":"
            output += "\"${int64}\""
            hasProperties = true
        }
        if (uint64 != null) {
            if (hasProperties) output += ","
            output += "\"uint64\":"
            output += "\"${uint64}\""
            hasProperties = true
        }
        if (enum != null) {
            if (hasProperties) output += ","
            output += "\"enum\":"
            output += "\"${enum.serialValue}\""
            hasProperties = true
        }
        if (`object` != null) {
            if (hasProperties) output += ","
            output += "\"object\":"
            output += `object`.toJson()
            hasProperties = true
        }
        if (array != null) {
            if (hasProperties) output += ","
            output += "\"array\":"
            output += "["
            for ((index, item) in array.withIndex()) {
                if (index != 0) {
                    output += ","
                }
                output += item
            }
            output += "]"
            hasProperties = true
        }
        if (record != null) {
            if (hasProperties) output += ","
            output += "\"record\":"
            output += "{"
            for ((index, entry) in record.entries.withIndex()) {
                if (index != 0) {
                    output += ","
                }
                output += "\"${entry.key}\":"
                output += entry.value
            }
            output += "}"
            hasProperties = true
        }
        if (discriminator != null) {
            if (hasProperties) output += ","
            output += "\"discriminator\":"
            output += discriminator.toJson()
            hasProperties = true
        }
        if (any != null) {
            if (hasProperties) output += ","
            output += "\"any\":"
            output += JsonInstance.encodeToString(any)
            hasProperties = true
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        TODO("Not yet implemented")
    }

    companion object Factory {
        @JvmStatic
        fun fromJson(input: String): ObjectWithOptionalFields {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        fun fromJsonElement(input: JsonElement): ObjectWithOptionalFields {
            val string: String? = input.jsonObject["string"]?.jsonPrimitive?.contentOrNull
            val boolean: Boolean? = input.jsonObject["boolean"]?.jsonPrimitive?.booleanOrNull
            val timestamp: Instant? =
                if (input.jsonObject["timestamp"]?.jsonPrimitive?.contentOrNull != null)
                    Instant.parse(input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                else null
            val float32: Float? = input.jsonObject["float32"]?.jsonPrimitive?.floatOrNull
            val float64: Double? = input.jsonObject["float64"]?.jsonPrimitive?.doubleOrNull
            val int8: Byte? = input.jsonObject["int8"]?.jsonPrimitive?.contentOrNull?.toByteOrNull()
            val uint8: UByte? = input.jsonObject["uint8"]?.jsonPrimitive?.contentOrNull?.toUByteOrNull()
            val int16: Short? = input.jsonObject["int16"]?.jsonPrimitive?.contentOrNull?.toShortOrNull()
            val uint16: UShort? = input.jsonObject["uint16"]?.jsonPrimitive?.contentOrNull?.toUShortOrNull()
            val int32: Int? = input.jsonObject["int32"]?.jsonPrimitive?.intOrNull
            val uint32: UInt? = input.jsonObject["uint32"]?.jsonPrimitive?.contentOrNull?.toUIntOrNull()
            val int64: Long? = input.jsonObject["int64"]?.jsonPrimitive?.contentOrNull?.toLongOrNull()
            val uint64: ULong? = input.jsonObject["uint64"]?.jsonPrimitive?.contentOrNull?.toULongOrNull()
            val enum: Enumerator? =
                if (input.jsonObject["enum"]?.jsonPrimitive?.isString == true)
                    Enumerator.fromJsonElement(input.jsonObject["enum"]!!)
                else null
            val `object`: NestedObject? =
                if (input.jsonObject["object"] != null)
                    NestedObject.fromJsonElement(input.jsonObject["object"]!!)
                else null
            val array: MutableList<Boolean>? =
                if (input.jsonObject["array"]?.jsonArray != null) mutableListOf() else null
            if (array != null) {
                for (item in input.jsonObject["array"]!!.jsonArray) {
                    array.add(item.jsonPrimitive.booleanOrNull ?: false)
                }
            }
            val record: MutableMap<String, Boolean>? =
                if (input.jsonObject["record"]?.jsonObject != null)
                    mutableMapOf()
                else null
            if (record != null) {
                for (entry in input.jsonObject["record"]!!.jsonObject) {
                    record[entry.key] = entry.value.jsonPrimitive.booleanOrNull ?: false
                }
            }
            val discriminator: Discriminator? =
                if (input.jsonObject["discriminator"] != null)
                    Discriminator.fromJsonElement(input.jsonObject["discriminator"]!!)
                else null
            val any: JsonElement? = input.jsonObject["any"]
            return ObjectWithOptionalFields(
                string,
                boolean,
                timestamp,
                float32,
                float64,
                int8,
                uint8,
                int16,
                uint16,
                int32,
                uint32,
                int64,
                uint64,
                enum,
                `object`,
                array,
                record,
                discriminator,
                any,
            )
        }
    }
}

data class ObjectWithNullableFields(
    val string: String?,
    val boolean: Boolean?,
    val timestamp: Instant?,
    val float32: Float?,
    val float64: Double?,
    val int8: Byte?,
    val uint8: UByte?,
    val int16: Short?,
    val uint16: UShort?,
    val int32: Int?,
    val uint32: UInt?,
    val int64: Long?,
    val uint64: ULong?,
    val enum: Enumerator?,
    val `object`: NestedObject?,
    val array: List<Boolean>?,
    val record: Map<String, Boolean>?,
    val discriminator: Discriminator?,
    val any: JsonElement?
) : ExampleClientModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"string\":"
        if (string != null) {
            output += buildString { printQuoted(string) }
        } else {
            output += "null"
        }
        output += ",\"boolean\":"
        output += boolean ?: "null"
        output += ",\"timestamp\":"
        if (timestamp != null) {
            output += "\"${timestampFormatter.format(timestamp)}\""
        } else {
            output += "null"
        }
        output += ",\"float32\":"
        output += float32 ?: "null"
        output += ",\"float64\":"
        output += float64 ?: "null"
        output += ",\"int8\":"
        output += int8 ?: "null"
        output += ",\"uint8\":"
        output += uint8 ?: "null"
        output += ",\"int16\":"
        output += int16 ?: "null"
        output += ",\"uint16\":"
        output += uint16 ?: "null"
        output += ",\"int32\":"
        output += int32 ?: "null"
        output += ",\"uint32\":"
        output += uint32 ?: "null"
        output += ",\"int64\":"
        if (int64 != null) {
            output += "\"${int64}\""
        } else {
            output += "null"
        }
        output += ",\"uint64\":"
        if (uint64 != null) {
            output += "\"${uint64}\""
        } else {
            output += "null"
        }
        output += ",\"enum\":"
        if (enum != null) {
            output += "\"${enum.serialValue}\""
        } else {
            output += "null"
        }
        output += ",\"object\":"
        output += `object`?.toJson() ?: "null"
        output += ",\"array\":"
        if (array != null) {
            output += "["
            for ((index, item) in array.withIndex()) {
                if (index != 0) {
                    output += ","
                }
                output += item
            }
            output += "]"
        } else {
            output += "null"
        }
        output += ",\"record\":"
        if (record != null) {
            output += "{"
            for ((index, entry) in record.entries.withIndex()) {
                if (index != 0) {
                    output += ","
                }
                output += "\"${entry.key}\":"
                output += entry.value
            }
            output += "}"
        } else {
            output += "null"
        }
        output += ",\"discriminator\":"
        output += discriminator?.toJson() ?: "null"
        output += ",\"any\":"
        if (any != null) {
            output += JsonInstance.encodeToString(any)
        } else {
            output += "null"
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        TODO("Not yet implemented")
    }

    companion object Factory {
        @JvmStatic
        fun fromJson(input: String): ObjectWithNullableFields {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        fun fromJsonElement(input: JsonElement): ObjectWithNullableFields {
            val string: String? = input.jsonObject["string"]?.jsonPrimitive?.contentOrNull
            val boolean: Boolean? = input.jsonObject["boolean"]?.jsonPrimitive?.booleanOrNull
            val timestamp: Instant? =
                if (input.jsonObject["timestamp"]?.jsonPrimitive?.contentOrNull != null)
                    Instant.parse(input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                else null
            val float32: Float? = input.jsonObject["float32"]?.jsonPrimitive?.floatOrNull
            val float64: Double? = input.jsonObject["float64"]?.jsonPrimitive?.doubleOrNull
            val int8: Byte? = input.jsonObject["int8"]?.jsonPrimitive?.contentOrNull?.toByteOrNull()
            val uint8: UByte? = input.jsonObject["uint8"]?.jsonPrimitive?.contentOrNull?.toUByteOrNull()
            val int16: Short? = input.jsonObject["int16"]?.jsonPrimitive?.contentOrNull?.toShortOrNull()
            val uint16: UShort? = input.jsonObject["uint16"]?.jsonPrimitive?.contentOrNull?.toUShortOrNull()
            val int32: Int? = input.jsonObject["int32"]?.jsonPrimitive?.intOrNull
            val uint32: UInt? = input.jsonObject["uint32"]?.jsonPrimitive?.contentOrNull?.toUIntOrNull()
            val int64: Long? = input.jsonObject["int64"]?.jsonPrimitive?.contentOrNull?.toLongOrNull()
            val uint64: ULong? = input.jsonObject["uint64"]?.jsonPrimitive?.contentOrNull?.toULongOrNull()
            val enum: Enumerator? =
                if (input.jsonObject["enum"]?.jsonPrimitive?.isString == true)
                    Enumerator.fromJsonElement(input.jsonObject["enum"]!!)
                else null
            val `object`: NestedObject? =
                if (input.jsonObject["object"] != null && input.jsonObject["object"]?.jsonNull == null)
                    NestedObject.fromJsonElement(input.jsonObject["object"]!!)
                else null
            val array: MutableList<Boolean>? =
                if (input.jsonObject["array"] != null && input.jsonObject["array"]?.jsonNull == null) mutableListOf() else null
            if (array != null) {
                for (item in input.jsonObject["array"]!!.jsonArray) {
                    array.add(item.jsonPrimitive.booleanOrNull ?: false)
                }
            }
            val record: MutableMap<String, Boolean>? =
                if (input.jsonObject["record"] != null && input.jsonObject["record"]?.jsonNull == null)
                    mutableMapOf()
                else null
            if (record != null) {
                for (entry in input.jsonObject["record"]!!.jsonObject) {
                    record[entry.key] = entry.value.jsonPrimitive.booleanOrNull ?: false
                }
            }
            val discriminator: Discriminator? =
                if (input.jsonObject["discriminator"] != null && input.jsonObject["discriminator"]?.jsonNull == null)
                    Discriminator.fromJsonElement(input.jsonObject["discriminator"]!!)
                else null
            val any: JsonElement? = input.jsonObject["any"]
            return ObjectWithNullableFields(
                string,
                boolean,
                timestamp,
                float32,
                float64,
                int8,
                uint8,
                int16,
                uint16,
                int32,
                uint32,
                int64,
                uint64,
                enum,
                `object`,
                array,
                record,
                discriminator,
                any,
            )
        }
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
