package com.example.referenceclient

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.head
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.http.headers
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.jsonObject;

private suspend fun handleRequest(
    client: HttpClient,
    url: String,
    method: HttpMethod,
    params: JsonElement?,
    headers: Map<String, String>?,
): HttpResponse {
    var finalUrl = url;
    var finalBody = ""
    when (method) {
        HttpMethod.GET, HttpMethod.HEAD -> {
            var queryParts = mutableListOf<String>()
            params?.jsonObject?.entries?.forEach {
                queryParts.add("\${it.key}=\${it.value.toString()}")
            }
            finalUrl = "$finalUrl?\${queryParts.joinToString("&")}"
        }

        HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH, HttpMethod.DELETE -> {
            finalBody = params?.toString() ?: ""
        }
    }
    return when (method) {
        HttpMethod.GET -> client.get(finalUrl) {
            headers {
                headers?.entries?.forEach {
                    append(it.key, it.value)
                }
            }
        }

        HttpMethod.HEAD -> client.head(finalUrl) {
            headers {
                headers?.entries?.forEach {
                    append(it.key, it.value)
                }
            }
        }

        HttpMethod.POST -> client.post(finalUrl) {
            headers {
                headers?.entries?.forEach {
                    append(it.key, it.value)
                }
            }
            setBody(finalBody)
        }

        HttpMethod.PUT -> client.put(finalUrl) {
            headers {
                headers?.entries?.forEach {
                    append(it.key, it.value)
                }
            }
            setBody(finalBody)
        }

        HttpMethod.PATCH -> client.patch(finalUrl) {
            headers {
                headers?.entries?.forEach {
                    append(it.key, it.value)
                }
            }
            setBody(finalBody)
        }

        HttpMethod.DELETE -> client.delete(finalUrl) {
            headers {
                headers?.entries?.forEach {
                    append(it.key, it.value)
                }
            }
            setBody(finalBody)
        }
    }
}