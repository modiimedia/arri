@file:Suppress(
    "FunctionName", "LocalVariableName", "UNNECESSARY_NOT_NULL_ASSERTION", "ClassName", "NAME_SHADOWING",
    "USELESS_IS_CHECK", "unused", "RemoveRedundantQualifierName", "CanBeParameter", "RedundantUnitReturnType",
    "RedundantExplicitType"
)

import io.ktor.client.*
import io.ktor.client.plugins.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.utils.io.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.*
import java.nio.ByteBuffer
import java.time.Instant
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

private const val generatedClientVersion = "20"
private val timestampFormatter =
    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        .withZone(ZoneId.ofOffset("GMT", ZoneOffset.UTC))
private val JsonInstance = Json {
    encodeDefaults = true
    ignoreUnknownKeys = true
}
private typealias headersFn = (() -> MutableMap<String, String>?)?


class ExampleClient(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val headers: headersFn,
) {
    suspend fun sendObject(params: NestedObject): NestedObject {
        val response = __prepareRequest(
            client = httpClient,
            url = "$baseUrl/send-object",
            method = HttpMethod.Post,
            params = params,
            headers = headers?.invoke(),
        ).execute()
        if (response.headers["Content-Type"] != "application/json") {
            throw ExampleClientError(
                code = 0,
                errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }
        if (response.status.value in 200..299) {
            return NestedObject.fromJson(response.bodyAsText())
        }
        throw ExampleClientError.fromJson(response.bodyAsText())
    }

    val books: ExampleClientBooksService = ExampleClientBooksService(
        httpClient = httpClient,
        baseUrl = baseUrl,
        headers = headers,
    )
}

class ExampleClientBooksService(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val headers: headersFn,
) {
    /**
     * Get a book
     */
    suspend fun getBook(params: BookParams): Book {
        val response = __prepareRequest(
            client = httpClient,
            url = "$baseUrl/books/get-book",
            method = HttpMethod.Get,
            params = params,
            headers = headers?.invoke(),
        ).execute()
        if (response.headers["Content-Type"] != "application/json") {
            throw ExampleClientError(
                code = 0,
                errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }
        if (response.status.value in 200..299) {
            return Book.fromJson(response.bodyAsText())
        }
        throw ExampleClientError.fromJson(response.bodyAsText())
    }

    /**
     * Create a book
     */
    @Deprecated(message = "This method was marked as deprecated by the server")
    suspend fun createBook(params: Book): Book {
        val response = __prepareRequest(
            client = httpClient,
            url = "$baseUrl/books/create-book",
            method = HttpMethod.Post,
            params = params,
            headers = headers?.invoke(),
        ).execute()
        if (response.headers["Content-Type"] != "application/json") {
            throw ExampleClientError(
                code = 0,
                errorMessage = "Expected server to return Content-Type \"application/json\". Got \"${response.headers["Content-Type"]}\"",
                data = JsonPrimitive(response.bodyAsText()),
                stack = null,
            )
        }
        if (response.status.value in 200..299) {
            return Book.fromJson(response.bodyAsText())
        }
        throw ExampleClientError.fromJson(response.bodyAsText())
    }

    @Deprecated(message = "This method was marked as deprecated by the server")
    fun watchBook(
        scope: CoroutineScope,
        params: BookParams,
        lastEventId: String? = null,
        bufferCapacity: Int = 1024,
        onOpen: ((response: HttpResponse) -> Unit) = {},
        onClose: (() -> Unit) = {},
        onError: ((error: ExampleClientError) -> Unit) = {},
        onConnectionError: ((error: ExampleClientError) -> Unit) = {},
        onData: ((data: Book) -> Unit) = {},
    ): Job {
        val job = scope.launch {
            __handleSseRequest(
                scope = scope,
                httpClient = httpClient,
                url = "$baseUrl/books/watch-book",
                method = HttpMethod.Get,
                params = params,
                headers = headers,
                backoffTime = 0,
                maxBackoffTime = 30000L,
                lastEventId = lastEventId,
                bufferCapacity = bufferCapacity,
                onOpen = onOpen,
                onClose = onClose,
                onError = onError,
                onConnectionError = onConnectionError,
                onData = { str ->
                    val data = Book.fromJson(str)
                    onData(data)
                }
            )
        }
        return job
    }
}

interface ExampleClientModel {
    fun toJson(): String
    fun toUrlQueryParams(): String
}

interface ExampleClientModelFactory<T> {
    fun new(): T
    fun fromJson(input: String): T
    fun fromJsonElement(
        __input: JsonElement,
        instancePath: String = "",
    ): T
}

data class ExampleClientError(
    val code: Int,
    val errorMessage: String,
    val data: JsonElement?,
    val stack: List<String>?,
) : Exception(errorMessage), ExampleClientModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"code\":"
        output += "$code"
        output += ",\"message\":"
        output += buildString { printQuoted(errorMessage) }
        if (data != null) {
            output += ",\"data\":"
            output += JsonInstance.encodeToString(data)
        }
        if (stack != null) {
            output += ",\"stack\":"
            output += "["
            for ((__index, __element) in stack.withIndex()) {
                if (__index > 0) {
                    output += ","
                }
                output += buildString { printQuoted(__element) }
            }
            output += "]"
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("code=${code}")
        queryParts.add("message=${errorMessage}")
        return queryParts.joinToString("&")
    }

    companion object Factory : ExampleClientModelFactory<ExampleClientError> {
        override fun new(): ExampleClientError {
            return ExampleClientError(
                code = 0,
                errorMessage = "",
                data = null,
                stack = null
            )
        }

        override fun fromJson(input: String): ExampleClientError {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        override fun fromJsonElement(__input: JsonElement, instancePath: String): ExampleClientError {
            if (__input !is JsonObject) {
                __logError("[WARNING] ExampleClientError.fromJsonElement() expected JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ExampleClientError.")
            }
            val code = when (__input.jsonObject["code"]) {
                is JsonPrimitive -> __input.jsonObject["code"]!!.jsonPrimitive.intOrNull ?: 0
                else -> 0
            }
            val errorMessage = when (__input.jsonObject["message"]) {
                is JsonPrimitive -> __input.jsonObject["message"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val data = when (__input.jsonObject["data"]) {
                is JsonNull -> null
                is JsonElement -> __input.jsonObject["data"]!!
                else -> null
            }
            val stack = when (__input.jsonObject["stack"]) {
                is JsonArray -> {
                    val stackVal = mutableListOf<String>()
                    for (item in __input.jsonObject["stack"]!!.jsonArray) {
                        stackVal.add(
                            when (item) {
                                is JsonPrimitive -> item.contentOrNull ?: ""
                                else -> ""
                            }
                        )
                    }
                    stackVal
                }

                else -> null

            }
            return ExampleClientError(
                code,
                errorMessage,
                data,
                stack,
            )
        }

    }
}

/**
 * This is a book
 */
data class Book(
    /**
     * The book ID
     */
    val id: String,
    /**
     * The book title
     */
    val name: String,
    /**
     * When the book was created
     */
    @Deprecated(message = "This field was marked as deprecated by the server")
    val createdAt: Instant,
    @Deprecated(message = "This field was marked as deprecated by the server")
    val updatedAt: Instant,
) : ExampleClientModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"id\":"
        output += buildString { printQuoted(id) }
        output += ",\"name\":"
        output += buildString { printQuoted(name) }
        output += ",\"createdAt\":"
        output += "\"${timestampFormatter.format(createdAt)}\""
        output += ",\"updatedAt\":"
        output += "\"${timestampFormatter.format(updatedAt)}\""
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("id=$id")
        queryParts.add("name=$name")
        queryParts.add(
            "createdAt=${
                timestampFormatter.format(createdAt)
            }"
        )
        queryParts.add(
            "updatedAt=${
                timestampFormatter.format(updatedAt)
            }"
        )
        return queryParts.joinToString("&")
    }

    companion object Factory : ExampleClientModelFactory<Book> {
        @JvmStatic
        override fun new(): Book {
            return Book(
                id = "",
                name = "",
                createdAt = Instant.now(),
                updatedAt = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): Book {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): Book {
            if (__input !is JsonObject) {
                __logError("[WARNING] Book.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty Book.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val name: String = when (__input.jsonObject["name"]) {
                is JsonPrimitive -> __input.jsonObject["name"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val createdAt: Instant = when (__input.jsonObject["createdAt"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["createdAt"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["createdAt"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
            }
            val updatedAt: Instant = when (__input.jsonObject["updatedAt"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["updatedAt"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["updatedAt"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
            }
            return Book(
                id,
                name,
                createdAt,
                updatedAt,
            )
        }

    }
}

data class BookParams(
    val bookId: String,
) : ExampleClientModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"bookId\":"
        output += buildString { printQuoted(bookId) }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("bookId=$bookId")
        return queryParts.joinToString("&")
    }

    companion object Factory : ExampleClientModelFactory<BookParams> {
        @JvmStatic
        override fun new(): BookParams {
            return BookParams(
                bookId = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): BookParams {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): BookParams {
            if (__input !is JsonObject) {
                __logError("[WARNING] BookParams.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty BookParams.")
                return new()
            }
            val bookId: String = when (__input.jsonObject["bookId"]) {
                is JsonPrimitive -> __input.jsonObject["bookId"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return BookParams(
                bookId,
            )
        }

    }
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
        queryParts.add("id=$id")
        queryParts.add("content=$content")
        return queryParts.joinToString("&")
    }

    companion object Factory : ExampleClientModelFactory<NestedObject> {
        @JvmStatic
        override fun new(): NestedObject {
            return NestedObject(
                id = "",
                content = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): NestedObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): NestedObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] NestedObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty NestedObject.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val content: String = when (__input.jsonObject["content"]) {
                is JsonPrimitive -> __input.jsonObject["content"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return NestedObject(
                id,
                content,
            )
        }
    }

}

data class ObjectWithEveryType(
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
    val array: MutableList<Boolean>,
    val record: MutableMap<String, Boolean>,
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
        output += "\"$int64\""
        output += ",\"uint64\":"
        output += "\"$uint64\""
        output += ",\"enum\":"
        output += "\"${enum.serialValue}\""
        output += ",\"object\":"
        output += `object`.toJson()
        output += ",\"array\":"
        output += "["
        for ((__index, __element) in array.withIndex()) {
            if (__index != 0) {
                output += ","
            }
            output += __element
        }
        output += "]"
        output += ",\"record\":"
        output += "{"
        for ((__index, __entry) in record.entries.withIndex()) {
            if (__index != 0) {
                output += ","
            }
            output += "\"${__entry.key}\":"
            output += __entry.value
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
        queryParts.add("string=$string")
        queryParts.add("boolean=$boolean")
        queryParts.add(
            "timestamp=${
                timestampFormatter.format(timestamp)
            }"
        )
        queryParts.add("float32=$float32")
        queryParts.add("float64=$float64")
        queryParts.add("int8=$int8")
        queryParts.add("uint8=$uint8")
        queryParts.add("int16=$int16")
        queryParts.add("uint16=$uint16")
        queryParts.add("int32=$int32")
        queryParts.add("uint32=$uint32")
        queryParts.add("int64=$int64")
        queryParts.add("uint64=$uint64")
        queryParts.add("enum=${enum.serialValue}")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/object.")
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithEveryType/array.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/record.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithEveryType/discriminator.")
        __logError("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithEveryType/any.")
        return queryParts.joinToString("&")
    }

    companion object Factory : ExampleClientModelFactory<ObjectWithEveryType> {
        @JvmStatic
        override fun new(): ObjectWithEveryType {
            return ObjectWithEveryType(
                string = "",
                boolean = false,
                timestamp = Instant.now(),
                float32 = 0.0F,
                float64 = 0.0,
                int8 = 0,
                uint8 = 0u,
                int16 = 0,
                uint16 = 0u,
                int32 = 0,
                uint32 = 0u,
                int64 = 0L,
                uint64 = 0UL,
                enum = Enumerator.new(),
                `object` = NestedObject.new(),
                array = mutableListOf(),
                record = mutableMapOf(),
                discriminator = Discriminator.new(),
                any = JsonNull,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithEveryType {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithEveryType {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithEveryType.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithEveryType.")
                return new()
            }
            val string: String = when (__input.jsonObject["string"]) {
                is JsonPrimitive -> __input.jsonObject["string"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val boolean: Boolean = when (__input.jsonObject["boolean"]) {
                is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull ?: false
                else -> false
            }
            val timestamp: Instant = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
            }

            val float32: Float = when (__input.jsonObject["float32"]) {
                is JsonPrimitive -> __input.jsonObject["float32"]!!.jsonPrimitive.floatOrNull ?: 0.0F
                else -> 0.0F
            }
            val float64: Double = when (__input.jsonObject["float64"]) {
                is JsonPrimitive -> __input.jsonObject["float64"]!!.jsonPrimitive.doubleOrNull ?: 0.0
                else -> 0.0
            }
            val int8: Byte = when (__input.jsonObject["int8"]) {
                is JsonPrimitive -> __input.jsonObject["int8"]!!.jsonPrimitive.contentOrNull?.toByteOrNull() ?: 0
                else -> 0
            }
            val uint8: UByte = when (__input.jsonObject["uint8"]) {
                is JsonPrimitive -> __input.jsonObject["uint8"]!!.jsonPrimitive.contentOrNull?.toUByteOrNull() ?: 0u
                else -> 0u
            }
            val int16: Short = when (__input.jsonObject["int16"]) {
                is JsonPrimitive -> __input.jsonObject["int16"]!!.jsonPrimitive.contentOrNull?.toShortOrNull() ?: 0
                else -> 0
            }
            val uint16: UShort = when (__input.jsonObject["uint16"]) {
                is JsonPrimitive -> __input.jsonObject["uint16"]!!.jsonPrimitive.contentOrNull?.toUShortOrNull() ?: 0u
                else -> 0u
            }
            val int32: Int = when (__input.jsonObject["int32"]) {
                is JsonPrimitive -> __input.jsonObject["int32"]!!.jsonPrimitive.intOrNull ?: 0
                else -> 0
            }
            val uint32: UInt = when (__input.jsonObject["uint32"]) {
                is JsonPrimitive -> __input.jsonObject["uint32"]!!.jsonPrimitive.contentOrNull?.toUIntOrNull() ?: 0u
                else -> 0u
            }
            val int64: Long = when (__input.jsonObject["int64"]) {
                is JsonPrimitive -> __input.jsonObject["int64"]!!.jsonPrimitive.longOrNull ?: 0L
                else -> 0L
            }
            val uint64: ULong = when (__input.jsonObject["uint64"]) {
                is JsonPrimitive -> __input.jsonObject["uint64"]!!.jsonPrimitive.contentOrNull?.toULongOrNull() ?: 0UL
                else -> 0UL
            }
            val enum: Enumerator = when (__input.jsonObject["enum"]) {
                is JsonNull -> Enumerator.new()
                is JsonPrimitive -> Enumerator.fromJsonElement(__input.jsonObject["enum"]!!, "$instancePath/enum")
                else -> Enumerator.new()
            }
            val `object`: NestedObject = when (__input.jsonObject["object"]) {
                is JsonObject -> NestedObject.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> NestedObject.new()
            }
            val array: MutableList<Boolean> = when (__input.jsonObject["array"]) {
                is JsonArray -> {
                    val __value: MutableList<Boolean> = mutableListOf()
                    for (__element in __input.jsonObject["array"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonPrimitive -> __element!!.jsonPrimitive.booleanOrNull ?: false
                                else -> false
                            }
                        )
                    }
                    __value
                }

                else -> mutableListOf()
            }
            val record: MutableMap<String, Boolean> = when (__input.jsonObject["record"]) {
                is JsonObject -> {
                    val __value: MutableMap<String, Boolean> = mutableMapOf()
                    for (__entry in __input.jsonObject["record"]!!.jsonObject.entries) {
                        __value[__entry.key] = when (__entry.value) {
                            is JsonPrimitive -> __entry.value!!.jsonPrimitive.booleanOrNull ?: false
                            else -> false
                        }
                    }
                    __value
                }

                else -> mutableMapOf()
            }
            val discriminator: Discriminator = when (__input.jsonObject["discriminator"]) {
                is JsonObject -> Discriminator.fromJsonElement(
                    __input.jsonObject["discriminator"]!!,
                    "$instancePath/discriminator",
                )

                else -> Discriminator.new()
            }
            val any: JsonElement = when (__input.jsonObject["any"]) {
                is JsonElement -> __input.jsonObject["any"]!!
                else -> JsonNull
            }
            return ObjectWithEveryType(
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

    companion object Factory : ExampleClientModelFactory<Enumerator> {
        @JvmStatic
        override fun new(): Enumerator {
            return Foo
        }

        @JvmStatic
        override fun fromJson(input: String): Enumerator {
            return when (input) {
                Foo.serialValue -> Foo
                Bar.serialValue -> Bar
                Baz.serialValue -> Baz
                else -> Foo
            }
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): Enumerator {
            if (__input !is JsonPrimitive) {
                __logError("[WARNING] Enumerator.fromJsonElement() expected kotlinx.serialization.json.JsonPrimitive at $instancePath. Got ${__input.javaClass}. Initializing empty Enumerator.")
                return new()
            }
            return when (__input.jsonPrimitive.contentOrNull) {
                "FOO" -> Foo
                "BAR" -> Bar
                "BAZ" -> Baz
                else -> new()
            }
        }
    }
}

sealed interface Discriminator : ExampleClientModel {
    val typeName: String

    companion object Factory : ExampleClientModelFactory<Discriminator> {
        @JvmStatic
        override fun new(): Discriminator {
            return DiscriminatorA.new()
        }

        @JvmStatic
        override fun fromJson(input: String): Discriminator {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): Discriminator {
            if (__input !is JsonObject) {
                __logError("[WARNING] Discriminator.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty Discriminator.")
                return new()
            }
            return when (__input.jsonObject["typeName"]) {
                is JsonPrimitive -> when (__input.jsonObject["typeName"]!!.jsonPrimitive.contentOrNull) {
                    "A" -> DiscriminatorA.fromJsonElement(__input, instancePath)
                    "B" -> DiscriminatorB.fromJsonElement(__input, instancePath)
                    "C" -> DiscriminatorC.fromJsonElement(__input, instancePath)
                    else -> new()
                }

                else -> new()
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
        queryParts.add("id=$id")
        return queryParts.joinToString("&")
    }

    companion object Factory : ExampleClientModelFactory<DiscriminatorA> {
        @JvmStatic
        override fun new(): DiscriminatorA {
            return DiscriminatorA(
                id = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): DiscriminatorA {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): DiscriminatorA {
            if (__input !is JsonObject) {
                __logError("[WARNING] DiscriminatorA.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty DiscriminatorA.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return DiscriminatorA(
                id,
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
        queryParts.add("id=$id")
        queryParts.add("name=$name")
        return queryParts.joinToString("&")
    }

    companion object Factory : ExampleClientModelFactory<DiscriminatorB> {
        @JvmStatic
        override fun new(): DiscriminatorB {
            return DiscriminatorB(
                id = "",
                name = "",
            )
        }

        @JvmStatic
        override fun fromJson(input: String): DiscriminatorB {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): DiscriminatorB {
            if (__input !is JsonObject) {
                __logError("[WARNING] DiscriminatorB.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty DiscriminatorB.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val name: String = when (__input.jsonObject["name"]) {
                is JsonPrimitive -> __input.jsonObject["name"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            return DiscriminatorB(
                id,
                name,
            )
        }
    }
}

data class DiscriminatorC(
    val id: String,
    val name: String,
    val date: Instant,
) : Discriminator {
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
        queryParts.add("id=$id")
        queryParts.add("name=$name")
        queryParts.add(
            "date=${
                timestampFormatter.format(date)
            }"
        )
        return queryParts.joinToString("&")
    }

    companion object Factory : ExampleClientModelFactory<DiscriminatorC> {
        @JvmStatic
        override fun new(): DiscriminatorC {
            return DiscriminatorC(
                id = "",
                name = "",
                date = Instant.now(),
            )
        }

        @JvmStatic
        override fun fromJson(input: String): DiscriminatorC {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): DiscriminatorC {
            if (__input !is JsonObject) {
                __logError("[WARNING] DiscriminatorC.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty DiscriminatorC.")
                return new()
            }
            val id: String = when (__input.jsonObject["id"]) {
                is JsonPrimitive -> __input.jsonObject["id"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val name: String = when (__input.jsonObject["name"]) {
                is JsonPrimitive -> __input.jsonObject["name"]!!.jsonPrimitive.contentOrNull ?: ""
                else -> ""
            }
            val date: Instant = when (__input.jsonObject["date"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["date"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["date"]!!.jsonPrimitive.content)
                    else
                        Instant.now()

                else -> Instant.now()
            }
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
    val array: MutableList<Boolean>? = null,
    val record: MutableMap<String, Boolean>? = null,
    val discriminator: Discriminator? = null,
    val any: JsonElement? = null,
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
            output += "\"$int64\""
            hasProperties = true
        }
        if (uint64 != null) {
            if (hasProperties) output += ","
            output += "\"uint64\":"
            output += "\"$uint64\""
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
            for ((__index, __element) in array.withIndex()) {
                if (__index != 0) {
                    output += ","
                }
                output += __element
            }
            output += "]"
            hasProperties = true
        }
        if (record != null) {
            if (hasProperties) output += ","
            output += "\"record\":"
            output += "{"
            for ((__index, __entry) in record.entries.withIndex()) {
                if (__index != 0) {
                    output += ","
                }
                output += "\"${__entry.key}\":"
                output += __entry.value
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
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        if (string != null) {
            queryParts.add("string=$string")
        }
        if (boolean != null) {
            queryParts.add("boolean=$boolean")
        }
        if (timestamp != null) {
            queryParts.add(
                "timestamp=${
                    timestampFormatter.format(timestamp)
                }"
            )
        }
        if (float32 != null) {
            queryParts.add("float32=$float32")
        }
        if (float64 != null) {
            queryParts.add("float64=$float64")
        }
        if (int8 != null) {
            queryParts.add("int8=$int8")
        }
        if (uint8 != null) {
            queryParts.add("uint8=$uint8")
        }
        if (int16 != null) {
            queryParts.add("int16=$int16")
        }
        if (uint16 != null) {
            queryParts.add("uint16=$uint16")
        }
        if (int32 != null) {
            queryParts.add("int32=$int32")
        }
        if (uint32 != null) {
            queryParts.add("uint32=$uint32")
        }
        if (int64 != null) {
            queryParts.add("int64=$int64")
        }
        if (uint64 != null) {
            queryParts.add("uint64=$uint64")
        }
        if (enum != null) {
            queryParts.add("enum=${enum.serialValue}")
        }
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/object.")
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/array.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/record.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/discriminator.")
        __logError("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/any.")
        return queryParts.joinToString("&")
    }

    companion object Factory : ExampleClientModelFactory<ObjectWithOptionalFields> {
        @JvmStatic
        override fun new(): ObjectWithOptionalFields {
            return ObjectWithOptionalFields(
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithOptionalFields {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithOptionalFields {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithOptionalFields.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithOptionalFields.")
                return new()
            }
            val string: String? = when (__input.jsonObject["string"]) {
                is JsonPrimitive -> __input.jsonObject["string"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val boolean: Boolean? = when (__input.jsonObject["boolean"]) {
                is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull
                else -> null
            }
            val timestamp: Instant? = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        null

                else -> null
            }
            val float32: Float? = when (__input.jsonObject["float32"]) {
                is JsonPrimitive -> __input.jsonObject["float32"]!!.jsonPrimitive.floatOrNull
                else -> null
            }
            val float64: Double? = when (__input.jsonObject["float64"]) {
                is JsonPrimitive -> __input.jsonObject["float64"]!!.jsonPrimitive.doubleOrNull
                else -> null
            }
            val int8: Byte? = when (__input.jsonObject["int8"]) {
                is JsonPrimitive -> __input.jsonObject["int8"]!!.jsonPrimitive.contentOrNull?.toByteOrNull()
                else -> null
            }
            val uint8: UByte? = when (__input.jsonObject["uint8"]) {
                is JsonPrimitive -> __input.jsonObject["uint8"]!!.jsonPrimitive.contentOrNull?.toUByteOrNull()
                else -> null
            }
            val int16: Short? = when (__input.jsonObject["int16"]) {
                is JsonPrimitive -> __input.jsonObject["int16"]!!.jsonPrimitive.contentOrNull?.toShortOrNull()
                else -> null
            }
            val uint16: UShort? = when (__input.jsonObject["uint16"]) {
                is JsonPrimitive -> __input.jsonObject["uint16"]!!.jsonPrimitive.contentOrNull?.toUShortOrNull()
                else -> null
            }
            val int32: Int? = when (__input.jsonObject["int32"]) {
                is JsonPrimitive -> __input.jsonObject["int32"]!!.jsonPrimitive.intOrNull
                else -> null
            }
            val uint32: UInt? = when (__input.jsonObject["uint32"]) {
                is JsonPrimitive -> __input.jsonObject["uint32"]!!.jsonPrimitive.contentOrNull?.toUIntOrNull()
                else -> null
            }
            val int64: Long? = when (__input.jsonObject["int64"]) {
                is JsonPrimitive -> __input.jsonObject["int64"]!!.jsonPrimitive.longOrNull
                else -> null
            }
            val uint64: ULong? = when (__input.jsonObject["uint64"]) {
                is JsonPrimitive -> __input.jsonObject["uint64"]!!.jsonPrimitive.contentOrNull?.toULongOrNull()
                else -> null
            }
            val enum: Enumerator? = when (__input.jsonObject["enum"]) {
                is JsonNull -> null
                is JsonPrimitive -> Enumerator.fromJsonElement(__input.jsonObject["enum"]!!, "$instancePath/enum")
                else -> null
            }
            val `object`: NestedObject? = when (__input.jsonObject["object"]) {
                is JsonObject -> NestedObject.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> null
            }

            val array: MutableList<Boolean>? = when (__input.jsonObject["array"]) {
                is JsonArray -> {
                    val __value: MutableList<Boolean> = mutableListOf()
                    for (__element in __input.jsonObject["array"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonPrimitive -> __element!!.jsonPrimitive.booleanOrNull ?: false
                                else -> false
                            }
                        )
                    }
                    __value
                }

                else -> null
            }

            val record: MutableMap<String, Boolean>? = when (__input.jsonObject["record"]) {
                is JsonObject -> {
                    val __value: MutableMap<String, Boolean> = mutableMapOf()
                    for (__entry in __input.jsonObject["record"]!!.jsonObject.entries) {
                        __value[__entry.key] = when (__entry.value) {
                            is JsonPrimitive -> __entry.value!!.jsonPrimitive.booleanOrNull ?: false
                            else -> false
                        }
                    }
                    __value
                }

                else -> null
            }
            val discriminator: Discriminator? = when (__input.jsonObject["discriminator"]) {
                is JsonObject -> Discriminator.fromJsonElement(
                    __input.jsonObject["discriminator"]!!,
                    "$instancePath/discriminator",
                )

                else -> null
            }
            val any: JsonElement? = when (__input.jsonObject["any"]) {
                null -> null
                else -> __input.jsonObject["any"]
            }
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
    val array: MutableList<Boolean>?,
    val record: MutableMap<String, Boolean>?,
    val discriminator: Discriminator?,
    val any: JsonElement?,
) : ExampleClientModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"string\":"
        output += when (string) {
            is String -> buildString { printQuoted(string) }
            else -> "null"
        }
        output += ",\"boolean\":"
        output += boolean
        output += ",\"timestamp\":"
        output += when (timestamp) {
            is Instant -> "\"${timestampFormatter.format(timestamp)}\""
            else -> "null"
        }
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
        output += when (int64) {
            is Long -> "\"$int64\""
            else -> "null"
        }
        output += ",\"uint64\":"
        output += when (uint64) {
            is ULong -> "\"$uint64\""
            else -> "null"
        }
        output += ",\"enum\":"
        output += when (enum) {
            is Enumerator -> "\"${enum.serialValue}\""
            else -> "null"
        }
        output += ",\"object\":"
        output += `object`?.toJson()
        output += ",\"array\":"
        if (array == null) {
            output += "null"
        } else {
            output += "["
            for ((__index, __element) in array.withIndex()) {
                if (__index != 0) {
                    output += ","
                }
                output += __element
            }
            output += "]"
        }
        output += ",\"record\":"
        if (record == null) {
            output += "null"
        } else {
            output += "{"
            for ((__index, __entry) in record.entries.withIndex()) {
                if (__index != 0) {
                    output += ","
                }
                output += "\"${__entry.key}\":"
                output += __entry.value
            }
            output += "}"
        }
        output += ",\"discriminator\":"
        output += discriminator?.toJson()
        output += ",\"any\":"
        output += when (any) {
            null -> "null"
            else -> JsonInstance.encodeToString(any)
        }
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        queryParts.add("string=$string")
        queryParts.add("boolean=$boolean")
        queryParts.add(
            "timestamp=${
                when (timestamp) {
                    is Instant -> timestampFormatter.format(timestamp)
                    else -> "null"
                }
            }"
        )
        queryParts.add("float32=$float32")
        queryParts.add("float64=$float64")
        queryParts.add("int8=$int8")
        queryParts.add("uint8=$uint8")
        queryParts.add("int16=$int16")
        queryParts.add("uint16=$uint16")
        queryParts.add("int32=$int32")
        queryParts.add("uint32=$uint32")
        queryParts.add("int64=$int64")
        queryParts.add("uint64=$uint64")
        queryParts.add("enum=${enum?.serialValue}")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithNullableFields/object.")
        __logError("[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithNullableFields/array.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithNullableFields/record.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithNullableFields/discriminator.")
        __logError("[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithNullableFields/any.")
        return queryParts.joinToString("&")
    }

    companion object Factory : ExampleClientModelFactory<ObjectWithNullableFields> {
        @JvmStatic
        override fun new(): ObjectWithNullableFields {
            return ObjectWithNullableFields(
                string = null,
                boolean = null,
                timestamp = null,
                float32 = null,
                float64 = null,
                int8 = null,
                uint8 = null,
                int16 = null,
                uint16 = null,
                int32 = null,
                uint32 = null,
                int64 = null,
                uint64 = null,
                enum = null,
                `object` = null,
                array = null,
                record = null,
                discriminator = null,
                any = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): ObjectWithNullableFields {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): ObjectWithNullableFields {
            if (__input !is JsonObject) {
                __logError("[WARNING] ObjectWithNullableFields.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty ObjectWithNullableFields.")
                return new()
            }
            val string: String? = when (__input.jsonObject["string"]) {
                is JsonPrimitive -> __input.jsonObject["string"]!!.jsonPrimitive.contentOrNull
                else -> null
            }
            val boolean: Boolean? = when (__input.jsonObject["boolean"]) {
                is JsonPrimitive -> __input.jsonObject["boolean"]!!.jsonPrimitive.booleanOrNull
                else -> null
            }
            val timestamp: Instant? = when (__input.jsonObject["timestamp"]) {
                is JsonPrimitive ->
                    if (__input.jsonObject["timestamp"]!!.jsonPrimitive.isString)
                        Instant.parse(__input.jsonObject["timestamp"]!!.jsonPrimitive.content)
                    else
                        null

                else -> null
            }
            val float32: Float? = when (__input.jsonObject["float32"]) {
                is JsonPrimitive -> __input.jsonObject["float32"]!!.jsonPrimitive.floatOrNull
                else -> null
            }
            val float64: Double? = when (__input.jsonObject["float64"]) {
                is JsonPrimitive -> __input.jsonObject["float64"]!!.jsonPrimitive.doubleOrNull
                else -> null
            }
            val int8: Byte? = when (__input.jsonObject["int8"]) {
                is JsonPrimitive -> __input.jsonObject["int8"]!!.jsonPrimitive.contentOrNull?.toByteOrNull()
                else -> null
            }
            val uint8: UByte? = when (__input.jsonObject["uint8"]) {
                is JsonPrimitive -> __input.jsonObject["uint8"]!!.jsonPrimitive.contentOrNull?.toUByteOrNull()
                else -> null
            }
            val int16: Short? = when (__input.jsonObject["int16"]) {
                is JsonPrimitive -> __input.jsonObject["int16"]!!.jsonPrimitive.contentOrNull?.toShortOrNull()
                else -> null
            }
            val uint16: UShort? = when (__input.jsonObject["uint16"]) {
                is JsonPrimitive -> __input.jsonObject["uint16"]!!.jsonPrimitive.contentOrNull?.toUShortOrNull()
                else -> null
            }
            val int32: Int? = when (__input.jsonObject["int32"]) {
                is JsonPrimitive -> __input.jsonObject["int32"]!!.jsonPrimitive.intOrNull
                else -> null
            }
            val uint32: UInt? = when (__input.jsonObject["uint32"]) {
                is JsonPrimitive -> __input.jsonObject["uint32"]!!.jsonPrimitive.contentOrNull?.toUIntOrNull()
                else -> null
            }
            val int64: Long? = when (__input.jsonObject["int64"]) {
                is JsonPrimitive -> __input.jsonObject["int64"]!!.jsonPrimitive.longOrNull
                else -> null
            }
            val uint64: ULong? = when (__input.jsonObject["uint64"]) {
                is JsonPrimitive -> __input.jsonObject["uint64"]!!.jsonPrimitive.contentOrNull?.toULongOrNull()
                else -> null
            }
            val enum: Enumerator? = when (__input.jsonObject["enum"]) {
                is JsonNull -> null
                is JsonPrimitive -> Enumerator.fromJsonElement(__input.jsonObject["enum"]!!, "$instancePath/enum")
                else -> null
            }
            val `object`: NestedObject? = when (__input.jsonObject["object"]) {
                is JsonObject -> NestedObject.fromJsonElement(
                    __input.jsonObject["object"]!!,
                    "$instancePath/object",
                )

                else -> null
            }
            val array: MutableList<Boolean>? = when (__input.jsonObject["array"]) {
                is JsonArray -> {
                    val __value: MutableList<Boolean> = mutableListOf()
                    for (__element in __input.jsonObject["array"]!!.jsonArray) {
                        __value.add(
                            when (__element) {
                                is JsonPrimitive -> __element!!.jsonPrimitive.booleanOrNull ?: false
                                else -> false
                            }
                        )
                    }
                    __value
                }

                else -> null
            }
            val record: MutableMap<String, Boolean>? = when (__input.jsonObject["record"]) {
                is JsonObject -> {
                    val __value: MutableMap<String, Boolean> = mutableMapOf()
                    for (__entry in __input.jsonObject["record"]!!.jsonObject.entries) {
                        __value[__entry.key] = when (__entry.value) {
                            is JsonPrimitive -> __entry.value!!.jsonPrimitive.booleanOrNull ?: false
                            else -> false
                        }
                    }
                    __value
                }

                else -> null
            }
            val discriminator: Discriminator? = when (__input.jsonObject["discriminator"]) {
                is JsonObject -> Discriminator.fromJsonElement(
                    __input.jsonObject["discriminator"]!!,
                    "$instancePath/discriminator",
                )

                else -> null
            }
            val any: JsonElement? = when (__input.jsonObject["any"]) {
                JsonNull -> null
                null -> null
                else -> __input.jsonObject["any"]
            }
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

data class RecursiveObject(
    val left: RecursiveObject?,
    val right: RecursiveObject?,
) : ExampleClientModel {
    override fun toJson(): String {
        var output = "{"
        output += "\"left\":"
        output += left?.toJson()
        output += ",\"right\":"
        output += right?.toJson()
        output += "}"
        return output
    }

    override fun toUrlQueryParams(): String {
        val queryParts = mutableListOf<String>()
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveObject/left.")
        __logError("[WARNING] nested objects cannot be serialized to query params. Skipping field at /RecursiveObject/right.")
        return queryParts.joinToString("&")
    }

    companion object Factory : ExampleClientModelFactory<RecursiveObject> {
        @JvmStatic
        override fun new(): RecursiveObject {
            return RecursiveObject(
                left = null,
                right = null,
            )
        }

        @JvmStatic
        override fun fromJson(input: String): RecursiveObject {
            return fromJsonElement(JsonInstance.parseToJsonElement(input))
        }

        @JvmStatic
        override fun fromJsonElement(__input: JsonElement, instancePath: String): RecursiveObject {
            if (__input !is JsonObject) {
                __logError("[WARNING] RecursiveObject.fromJsonElement() expected kotlinx.serialization.json.JsonObject at $instancePath. Got ${__input.javaClass}. Initializing empty RecursiveObject.")
                return new()
            }
            val left: RecursiveObject? = when (__input.jsonObject["left"]) {
                is JsonObject -> RecursiveObject.fromJsonElement(
                    __input.jsonObject["left"]!!,
                    "$instancePath/left",
                )

                else -> null
            }
            val right: RecursiveObject? = when (__input.jsonObject["right"]) {
                is JsonObject -> RecursiveObject.fromJsonElement(
                    __input.jsonObject["right"]!!,
                    "$instancePath/right",
                )

                else -> null
            }
            return RecursiveObject(
                left,
                right,
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

private fun __logError(string: String) {
    System.err.println(string)
}

private suspend fun __prepareRequest(
    client: HttpClient,
    url: String,
    method: HttpMethod,
    params: ExampleClientModel?,
    headers: MutableMap<String, String>?,
): HttpStatement {
    var finalUrl = url
    var finalBody = ""
    when (method) {
        HttpMethod.Get, HttpMethod.Head -> {
            finalUrl = "$finalUrl?${params?.toUrlQueryParams() ?: ""}"
        }

        HttpMethod.Post, HttpMethod.Put, HttpMethod.Patch, HttpMethod.Delete -> {
            finalBody = params?.toJson() ?: ""
        }
    }
    val builder = HttpRequestBuilder()
    builder.method = method
    builder.url(finalUrl)
    builder.timeout {
        requestTimeoutMillis = 10 * 60 * 1000
    }
    if (headers != null) {
        for (entry in headers.entries) {
            builder.headers[entry.key] = entry.value
        }
    }
    builder.headers["client-version"] = generatedClientVersion
    if (method != HttpMethod.Get && method != HttpMethod.Head) {
        builder.setBody(finalBody)
    }
    return client.prepareRequest(builder)
}

private fun __parseSseEvent(input: String): __SseEvent {
    val lines = input.split("\n")
    var id: String? = null
    var event: String? = null
    var data: String = ""
    for (line in lines) {
        if (line.startsWith("id: ")) {
            id = line.substring(3).trim()
            continue
        }
        if (line.startsWith("event: ")) {
            event = line.substring(6).trim()
            continue
        }
        if (line.startsWith("data: ")) {
            data = line.substring(5).trim()
            continue
        }
    }
    return __SseEvent(id, event, data)
}

private class __SseEvent(val id: String? = null, val event: String? = null, val data: String)

private class __SseEventParsingResult(val events: List<__SseEvent>, val leftover: String)

private fun __parseSseEvents(input: String): __SseEventParsingResult {
    val inputs = input.split("\n\n").toMutableList()
    if (inputs.isEmpty()) {
        return __SseEventParsingResult(
            events = listOf(),
            leftover = "",
        )
    }
    if (inputs.size == 1) {
        return __SseEventParsingResult(
            events = listOf(),
            leftover = inputs.last(),
        )
    }
    val leftover = inputs.last()
    inputs.removeLast()
    val events = mutableListOf<__SseEvent>()
    for (item in inputs) {
        if (item.contains("data: ")) {
            events.add(__parseSseEvent(item))
        }
    }
    return __SseEventParsingResult(
        events = events,
        leftover = leftover,
    )
}


private suspend fun __handleSseRequest(
    scope: CoroutineScope,
    httpClient: HttpClient,
    url: String,
    method: HttpMethod,
    params: ExampleClientModel?,
    headers: headersFn,
    backoffTime: Long,
    maxBackoffTime: Long,
    lastEventId: String?,
    onOpen: ((response: HttpResponse) -> Unit) = {},
    onClose: (() -> Unit) = {},
    onError: ((error: ExampleClientError) -> Unit) = {},
    onData: ((data: String) -> Unit) = {},
    onConnectionError: ((error: ExampleClientError) -> Unit) = {},
    bufferCapacity: Int,
) {
    val finalHeaders = headers?.invoke() ?: mutableMapOf()
    var lastId = lastEventId
    // exponential backoff maxing out at 32 seconds
    if (backoffTime > 0) {
        withContext(scope.coroutineContext) {
            Thread.sleep(backoffTime)
        }
    }
    var newBackoffTime =
        if (backoffTime == 0L) 2L else if (backoffTime * 2L >= maxBackoffTime) maxBackoffTime else backoffTime * 2L
    if (lastId != null) {
        finalHeaders["Last-Event-ID"] = lastId.toString()
    }
    val request = __prepareRequest(
        client = httpClient,
        url = url,
        method = method,
        params = params,
        headers = finalHeaders,
    )
    try {
        request.execute { httpResponse ->
            try {
                onOpen(httpResponse)
            } catch (e: CancellationException) {
                onClose()
                return@execute
            }
            if (httpResponse.status.value !in 200..299) {
                try {
                    if (httpResponse.headers["Content-Type"] == "application/json") {
                        onConnectionError(
                            ExampleClientError.fromJson(httpResponse.bodyAsText())
                        )
                    } else {
                        onConnectionError(
                            ExampleClientError(
                                code = httpResponse.status.value,
                                errorMessage = httpResponse.status.description,
                                data = JsonPrimitive(httpResponse.bodyAsText()),
                                stack = null,
                            )
                        )
                    }
                } catch (e: CancellationException) {
                    onClose()
                    return@execute
                }
                __handleSseRequest(
                    scope = scope,
                    httpClient = httpClient,
                    url = url,
                    method = method,
                    params = params,
                    headers = headers,
                    backoffTime = newBackoffTime,
                    maxBackoffTime = maxBackoffTime,
                    lastEventId = lastId,
                    bufferCapacity = bufferCapacity,
                    onOpen = onOpen,
                    onClose = onClose,
                    onError = onError,
                    onData = onData,
                    onConnectionError = onConnectionError,
                )
                return@execute
            }
            if (httpResponse.headers["Content-Type"] != "text/event-stream") {
                try {
                    onConnectionError(
                        ExampleClientError(
                            code = 0,
                            errorMessage = "Expected server to return Content-Type \"text/event-stream\". Got \"${httpResponse.headers["Content-Type"]}\"",
                            data = JsonPrimitive(httpResponse.bodyAsText()),
                            stack = null,
                        )
                    )
                } catch (e: CancellationException) {
                    return@execute
                }
                __handleSseRequest(
                    scope = scope,
                    httpClient = httpClient,
                    url = url,
                    method = method,
                    params = params,
                    headers = headers,
                    backoffTime = newBackoffTime,
                    maxBackoffTime = maxBackoffTime,
                    lastEventId = lastId,
                    bufferCapacity = bufferCapacity,
                    onOpen = onOpen,
                    onClose = onClose,
                    onError = onError,
                    onData = onData,
                    onConnectionError = onConnectionError,
                )
                return@execute
            }
            newBackoffTime = 0
            val channel: ByteReadChannel = httpResponse.bodyAsChannel()
            var pendingData = ""
            while (!channel.isClosedForRead) {
                val buffer = ByteBuffer.allocateDirect(bufferCapacity)
                val read = channel.readAvailable(buffer)
                if (read == -1) break
                buffer.flip()
                val input = Charsets.UTF_8.decode(buffer).toString()
                val parsedResult = __parseSseEvents("${pendingData}${input}")
                pendingData = parsedResult.leftover
                for (event in parsedResult.events) {
                    if (event.id != null) {
                        lastId = event.id
                    }
                    when (event.event) {
                        "message" -> {
                            try {
                                onData(event.data)
                            } catch (e: CancellationException) {
                                onClose()
                                return@execute
                            }
                        }

                        "done" -> {
                            onClose()
                            return@execute
                        }

                        "error" -> {
                            val error = ExampleClientError.fromJson(event.data)
                            try {
                                onError(error)
                            } catch (e: CancellationException) {
                                onClose()
                                return@execute
                            }
                        }

                        else -> {}
                    }
                }
            }
            __handleSseRequest(
                scope = scope,
                httpClient = httpClient,
                url = url,
                method = method,
                params = params,
                headers = headers,
                backoffTime = newBackoffTime,
                maxBackoffTime = maxBackoffTime,
                lastEventId = lastId,
                bufferCapacity = bufferCapacity,
                onOpen = onOpen,
                onClose = onClose,
                onError = onError,
                onData = onData,
                onConnectionError = onConnectionError,
            )
        }
    } catch (e: java.net.ConnectException) {
        onConnectionError(
            ExampleClientError(
                code = 503,
                errorMessage = if (e.message != null) e.message!! else "Error connecting to $url",
                data = JsonPrimitive(e.toString()),
                stack = e.stackTraceToString().split("\n"),
            )
        )
        __handleSseRequest(
            scope = scope,
            httpClient = httpClient,
            url = url,
            method = method,
            params = params,
            headers = headers,
            backoffTime = newBackoffTime,
            maxBackoffTime = maxBackoffTime,
            lastEventId = lastId,
            bufferCapacity = bufferCapacity,
            onOpen = onOpen,
            onClose = onClose,
            onError = onError,
            onData = onData,
            onConnectionError = onConnectionError,
        )
        return
    } catch (e: Exception) {
        __handleSseRequest(
            scope = scope,
            httpClient = httpClient,
            url = url,
            method = method,
            params = params,
            headers = headers,
            backoffTime = newBackoffTime,
            maxBackoffTime = maxBackoffTime,
            lastEventId = lastId,
            bufferCapacity = bufferCapacity,
            onOpen = onOpen,
            onClose = onClose,
            onError = onError,
            onData = onData,
            onConnectionError = onConnectionError,
        )
    }
}