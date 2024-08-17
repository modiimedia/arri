# Arri Swift Codegen

## Setup

### 1) Add the Swift client generator to your arri config

```ts
// arri.config.ts
import { defineConfig, generators } from "arri";

export default defineConfig({
    generators: [
        generators.swiftClient({
            clientName: "MyClient",
            outputFile: "./client/Sources/MyClient.g.swift",
        }),
    ],
});
```

**Options:**

| Name                  | Description                                            |
| --------------------- | ------------------------------------------------------ |
| clientName (required) | The name of the generated client                       |
| outputFile (required) | Path to the file that will be created by the generator |
| typePrefix            | Add a prefix to all of the generated types             |

### 2) Install the Swift client library

The generated code relies on the [Arri Swift Client](/languages/swift/swift-client) library, so be sure to add it to your swift project. The version number should match your Arri CLI version.

#### Swift Package Manager

```swift
.package(url: "https://github.com/modiimedia/arri-client-swift.git", from: "<your-arri-cli-version>")
```

## Using the Generated Code

### Initialize the client

```swift

let client = MyClient(
    baseURL: "https://example.com",
    delegate: DefaultRequestDelegate(),
    headers {
        var headers: Dictionary<String, String> = Dictionary()
        return headers
    }
)

await client.myProcedure()
```

The root client will be a struct containing all of the sub-services and procedures. If you only need a particular service you can initialize just that service.

For example if we have some procedures grouped under `"users"` we can initialize just the users service like so.

```swift
let usersService = MyClientUsersService(
    baseURL: "https://example.com",
    delegate: DefaultRequestDelegate(),
    headers: {
        var headers: Dictionary<String, String> = Dictionary()
        return headers
    }
)

usersService.someProcedure()
```

### Using the Generated Types

All the generated structs, classes, and tagged unions implement the `ArriClientModel` protocol, which looks like this:

```swift
public protocol ArriClientModel: Equatable {
    init()
    init(json: JSON)
    init(JSONString: String)
    func toJSONString() -> String
    func toURLQueryParts() -> [URLQueryItem]
    func clone() -> Self
}
```

All generated standard enums implement the `ArriClientEnum` protocol, which looks like this:

```swift
public protocol ArriClientEnum: Equatable {
    init()
    init(serialValue: String)
    func serialValue() -> String
}
```

### Calling Event Stream Procedures

Event Stream Procedures spawn a [Task](https://developer.apple.com/documentation/swift/task)

```swift
var msgCount = 0
var openCount = 0
let params = WatchUserParams()

// event stream procedures return a task that you can cancel whenever
let task: Task<(), Never> = client.users.watchUser(
    params,
    options: EventSourceOptions(
        onMessage: { msg, eventSource in
            msgCount += 1
            print("New message: \(msg)")
        },
        onRequest: nil,
        onRequestError: nil,
        onResponse: { _, eventSource in
            openCount += 1
            print("Established connection!")
        },
        onResponseError: { err, eventSource in
            print("The server returned an error: \(err)")
            // you can also cancel the task from inside one of these hooks
            // by calling `cancel()` on the EventSource.
            // this will cause the parent Task to be completed
            eventSource.cancel()
        },
        onClose: nil,
        maxRetryCount: nil,
        maxRetryInterval: nil,
    )
)

// if you want to wait for the task to finished
await task.result
// this will continue indefinitely unless the server sends a "done" event
// or you call `cancel()` on the EventSource
```

#### Available Event Source Options

-   `onMessage` - Closure that fires whenever a "message" event is received from the server. This is the only required option.
-   `onRequest` - Closure that fires when a request has been created but has not been executed yet.
-   `onRequestError` - Closure that fires when there was an error in creating the request (i.e. a malformed URL), or if we were unable to connect to the server. (i.e a `connectionRefused` error)
-   `onResponse` - Closure that fires when we receive a response from the server
-   `onResponseError` - Closure that fires when the server has not responded with status code from `200` - `299` or the `Content-Type` header does not contain `text/event-stream`
-   `onClose` - Closure that fires when the EventSource is closed. (This will only fire if the EventSource was already able successfully receive a response from the server.)
-   `maxRetryCount` - Limit the number of times that the EventSource tries to reconnect to the server. When set to `nil` it will retry indefinitely. (Default is `nil`)
-   `maxRetryInterval` - Set the max delay time between retries in milliseconds. Default is `30000`.

## Additional Notes

Currently the `DefaultRequestDelegate()` relies on [AsyncHTTPClient](https://github.com/swift-server/async-http-client). I would like to eventually remove this dependency, so if anyone knows how to get Server Sent Events working with Foundation Swift libraries please open an issue. Please note that these clients needs to run on Linux, so the proposed solution needs to work without making use of `URLSession.asyncBytes` or any of the other APIs that only work on Apple platforms.
