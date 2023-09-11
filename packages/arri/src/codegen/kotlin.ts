import {
    type JsonSchemaObject,
    isJsonSchemaArray,
    isJsonSchemaEnum,
    isJsonSchemaNullType,
    isJsonSchemaObject,
    isJsonSchemaScalarType,
} from "json-schema-to-jtd";
import { camelCase, pascalCase } from "scule";
import { defineClientGeneratorPlugin } from "./plugin";
import {
    unflattenProcedures,
    type ApplicationDef,
    isServiceDef,
    type ServiceDef,
    type ProcedureDef,
} from "./utils";

interface KotlinClientGeneratorOptions {
    clientName: string;
    outFile: string;
    /**
     * @example com.example.myapplication
     */
    packageName: string;
}

export const kotlinClientGenerator = defineClientGeneratorPlugin(function (
    options: KotlinClientGeneratorOptions,
) {
    return {
        generator(def) {},
        options,
    };
});

export function createKotlinClient(
    def: ApplicationDef,
    clientName: string,
    packageName: string,
) {
    const procedures = unflattenProcedures(def.procedures);
    const modelParts: string[] = [];
    Object.keys(def.models).forEach((key) => {
        const node = def.models[key];
        if (isJsonSchemaObject(node)) {
            modelParts.push(
                createKotlinModelFromDefinition(
                    pascalCase(`${clientName}_${key}`),
                    node,
                ),
            );
        }
    });
    return `${importStr(packageName)}

    ${createKotlinServiceFromDefinition(clientName, clientName, procedures)}

    ${handleRequestFnString}
    `;
}

export function createKotlinServiceFromDefinition(
    clientName: string,
    serviceName: string,
    def: ServiceDef,
) {
    const rpcParts: string[] = [];
    const subServiceParts: { name: string; key: string; content: string }[] =
        [];
    Object.keys(def).forEach((key) => {
        const node = def[key];
        if (isServiceDef(node)) {
            const nameParts = serviceName.split("Service");
            nameParts.pop();
            const subServiceName = pascalCase(
                `${nameParts.join("")}_${key}_service`,
            );
            subServiceParts.push({
                name: subServiceName,
                key,
                content: createKotlinServiceFromDefinition(
                    clientName,
                    subServiceName,
                    node,
                ),
            });
            return;
        }
        rpcParts.push(createKotlinRpcFromDefinition(clientName, key, node));
    });
    return `class ${serviceName}(
        private val httpClient: HttpClient,
        private val baseUrl: string = "",
        private val headers: Map<String, String> = mutableMapOf()
    ) {
        ${subServiceParts
            .map(
                (service) =>
                    `val ${service.key} = ${service.name}(httpClient, baseUrl, headers)`,
            )
            .join("\n")}
        ${rpcParts.join("\n")}
    }
    ${subServiceParts.map((service) => service.content).join("\n")}`;
}

export function createKotlinRpcFromDefinition(
    clientName: string,
    name: string,
    def: ProcedureDef,
) {
    const paramStr = def.params ? `params: ${pascalCase(def.params)}` : "";
    const responseStr = def.response
        ? (pascalCase(`${clientName}_${def.response}`) as string)
        : "";
    return `suspend fun ${camelCase(name)}(${paramStr}): ${responseStr} {
        ${responseStr ? "val response = " : ""}handleRequest(
            httpClient,
            "\${baseUrl}${def.path}",
            HttpMethod.${def.method.toUpperCase()},
            ${
                paramStr.length ? `Json.encodeToJsonElement(params),\n` : ""
            }headers
        )
        ${
            responseStr
                ? `return Json.decodeFromString(${responseStr}.serializer(), response.body())`
                : ""
        }
    }`;
}

export function createKotlinModelFromDefinition(
    name: string,
    def: JsonSchemaObject,
) {
    const finalName = pascalCase(name);
    const requiredProps = def.required ?? [];
    const fieldParts: string[] = [];
    const subModelParts: string[] = [];
    Object.keys(def.properties).forEach((key) => {
        const isRequired = requiredProps.includes(key);
        const prop = def.properties[key];
        if (isJsonSchemaObject(prop)) {
            const subModelName = pascalCase(`${name}_${key}`) as string;
            const subModelContent = createKotlinModelFromDefinition(
                subModelName,
                prop,
            );
            fieldParts.push(
                isRequired
                    ? `val ${key}: ${subModelName}`
                    : `val ${key} ${subModelName}?`,
            );
            subModelParts.push(subModelContent);
            return;
        }
        if (isJsonSchemaScalarType(prop)) {
            switch (prop.type) {
                case "string":
                case "Date":
                    fieldParts.push(
                        isRequired
                            ? `val ${key}: String`
                            : `val ${key}: String?`,
                    );
                    break;
                case "bigint":
                case "integer":
                    fieldParts.push(
                        isRequired ? `val ${key}: Int` : `val ${key}: Int?`,
                    );
                    break;
                case "number":
                    fieldParts.push(
                        isRequired
                            ? `val ${key}: Double`
                            : `val ${key}: Double?`,
                    );
                    break;
                case "boolean":
                    fieldParts.push(
                        isRequired
                            ? `val ${key}: Boolean`
                            : `val ${key}: Boolean?`,
                    );
                    break;
            }
            return;
        }
        if (isJsonSchemaEnum(prop)) {
            return;
        }
        if (isJsonSchemaNullType(prop)) {
            return;
        }
        if (isJsonSchemaArray(prop)) {
            if (isJsonSchemaScalarType(prop.items)) {
                switch (prop.items.type) {
                    case "string":
                    case "Date":
                        fieldParts.push(
                            isRequired
                                ? `val ${key}: List<String>`
                                : `val ${key}: List<String>?`,
                        );
                        break;
                    case "bigint":
                    case "integer":
                        fieldParts.push(
                            isRequired ? `val ${key}: Int` : `val ${key}: Int?`,
                        );
                        break;
                    case "boolean":
                        fieldParts.push(
                            isRequired
                                ? `val ${key}: Boolean`
                                : `val ${key}: Boolean?`,
                        );
                        break;
                    case "number":
                        fieldParts.push(
                            isRequired
                                ? `val ${key}: Double`
                                : `val ${key}: Double`,
                        );
                        break;
                }
            }
        }
    });
    return `@Serializable
data class ${finalName}(
    ${fieldParts.join("\n")}
)`;
}

function importStr(packageName: string) {
    return `package ${packageName}

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
import kotlinx.serialization.json.jsonObject`;
}

const handleRequestFnString = `private suspend fun handleRequest(
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
}`;
