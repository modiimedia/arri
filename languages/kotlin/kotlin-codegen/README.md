# Arri Kotlin Codegen

## Setup

### 1) Add the generator to your arri config

```ts
// arri.config.ts
import { defineConfig, generators } from "arri";

export default defineConfig({
    generators: [
        generators.kotlinClient({
            clientName: "MyClient",
            outputFile: "./client/src/MyClient.g.kt",
        }),
    ],
});
```

**Options:**

| Name                  | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| clientName            | The name of the generated client class (Defaults to "Client") |
| outputFile (required) | Path to the file that will be created by the generator        |
| modelPrefix           | Add a prefix to the generated class names                     |

### 2) Install dependencies

The generated code relies on the following dependencies:

-   [kotlinx.serialization](https://github.com/Kotlin/kotlinx.serialization)
-   [ktor client](https://ktor.io/docs/client-dependencies.html)

## Using the Generated Code

### Initialize the client

```kotlin
fun main() {
    // create a Ktor HTTP client
    val httpClient = HttpClient() {
        install(HttpTimeout)
    }
    // initialize your generated client and pass it the httpClient
    // the client name will match whatever options you passed into your arri config
    val client = MyClient(
        httpClient = httpClient,
        baseUrl = "https://example.com",
        // a function that returns a mutable map of headers
        // this function will run before every request. Or before every reconnection in the case of SSE
        headers = {
            mutableMapOf(Pair("x-example-header", "<some-header-value>"))
        }
    )
    runBlocking {
        client.someProcedure()
    }
}
```

The root client will be a class containing all of the services and procedures in a single class. If you only need a particular service, you can initialize just that service.

```kotlin
val service = MyClientUsersService(
        httpClient = httpClient,
        baseUrl = "https://example.com",
        headers = {
            mutableMapOf(Pair("x-example-header", "<some-header-value>"))
        }
    )
```

### Using Arri Models

All generated models will be data classes. They will have access to the following features:

**Methods**:

-   `toJson(): String`
-   `toUrlQueryParams(): String`

**Factory Methods**:

-   `new()`
-   `fromJson(input: String)`
-   `fromJsonElement(input: JsonElement, instancePath: String)`

**Other Notes**

-   All Enums will have a `serialValue` property.
-   Discriminator schemas are converted to sealed classes

## Development

```bash
# build the library
pnpm nx build codegen-kotlin

# test
pnpm nx test codegen-kotlin

# lint
pnpm nx lint codegen-lint
```
