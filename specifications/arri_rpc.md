_This is a work in progress_

# Arri RPC Protocol

This document defines the transport-agnostic core of the Arri RPC protocol: the messages exchanged between clients and servers and the rules that govern them. The current protocol version is `0`.

How these messages are carried over a specific transport is defined separately by each [transport binding](#transport-bindings).

## Table of Contents

- [Overview](#overview)
- [Terminology](#terminology)
- [Message Format](#message-format)
    - [Head](#head)
    - [Canonical Encoding](#canonical-encoding)
    - [Body](#body)
- [Headers](#headers)
    - [Reserved Headers](#reserved-headers)
    - [Binding Headers](#binding-headers)
    - [Custom Headers](#custom-headers)
- [Message Types](#message-types)
- [Request IDs](#request-ids)
- [Content Types](#content-types)
- [Call Flows](#call-flows)
- [Errors](#errors)
    - [Error Codes](#error-codes)
    - [Connection-Level Errors](#connection-level-errors)
- [Versioning](#versioning)
- [Transport Bindings](#transport-bindings)
- [Open Questions](#open-questions)

## Overview

Arri RPC is a request/response protocol that is independent of any particular transport. Every procedure call is modeled as a sequence of messages flowing between a client and a server. This allows every kind of procedure to be supported on every transport:

| Kind          | Client sends       | Server sends        |
| ------------- | ------------------ | ------------------- |
| Unary         | a single input     | a single output     |
| Output stream | a single input     | a stream of outputs |
| Input stream  | a stream of inputs | a single output     |
| Bidirectional | a stream of inputs | a stream of outputs |

The kind of each procedure is described by the [app definition](/specifications/arri_app_definition.md).

## Terminology

| Term       | Meaning                                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Message    | A single unit of communication, described in [Message Format](#message-format).                                                                                  |
| Call       | A single invocation of a procedure. A call begins with an `INVOCATION` message and ends with exactly one terminating message (see [Call Flows](#call-flows)).    |
| Connection | A context in which calls take place. Depending on the transport this may be a socket, a single HTTP request, or a logical connection spanning multiple requests. |
| Binding    | The rules for carrying Arri messages over a specific transport (e.g. HTTP, WebSockets, TCP).                                                                     |
| Client     | The party that sends `INVOCATION` messages.                                                                                                                      |
| Server     | The party that receives `INVOCATION` messages and executes procedures.                                                                                           |

## Message Format

Every message is a sequence of bytes with the following shape:

```txt
ARRIRPC/<protocol-version> <MESSAGE_TYPE>[ <rpc-name>]
<header-key>: <header-value>
<header-key>: <header-value>

<body>
```

For example:

```txt
ARRIRPC/0 INVOCATION users.getUser
req-id: 1
content-type: application/json
authorization: Bearer abc123

{"id":"12345"}
```

```txt
ARRIRPC/0 OK
req-id: 1
content-type: application/json

{"id":"12345","name":"John Doe"}
```

This encoding is used by bindings that carry Arri messages directly (e.g. WebSockets). Bindings such as HTTP instead translate messages into the transport's native constructs.

### Head

Everything before the first empty line is the "head".

- The head is ASCII. Only tab (`0x09`), line feed (`0x0A`), and printable characters (`0x20`-`0x7E`) are allowed.
- Lines are delimited by `\n`. `\r\n` is not supported.
- The first line is always present and contains the protocol prefix and the message type, separated by a single space. `INVOCATION` messages additionally include the name of the procedure being called. Procedure names are non-empty and contain only visible ASCII characters (`0x21`-`0x7E`).
- Each subsequent line is a header in the form `<key>:<value>`. See [Headers](#headers).
- The end of the head is marked by an empty line (`\n\n`). The empty line is required even when the message has no body.

Because the head can never contain `\n\n`, receivers can locate the body by scanning for the first `\n\n` byte sequence without decoding the message.

### Canonical Encoding

Receivers must accept headers in any order and with any casing or surrounding whitespace allowed above. Senders should produce the canonical encoding, so that every implementation encodes the same message to the same bytes:

- Header keys are lowercase, followed by `: ` (a colon and a single space) and the trimmed value.
- `req-id` comes first, followed by the other [reserved headers](#reserved-headers) in the order they are listed in that table, followed by custom headers in insertion order.
- Headers without a value on the message are omitted entirely.

Shared test fixtures for valid, non-canonical, and invalid messages live in [`/tests/test-files/messages`](/tests/test-files/messages/README.md).

### Body

Everything after the empty line is the body.

- The body is arbitrary bytes. Its format is determined by the message's [content type](#content-types).
- An empty body is equivalent to no body.
- Only `INVOCATION`, `OK`, `ERROR`, and `STREAM_DATA` messages have bodies. Bodies on other message types are ignored.

## Headers

- Header keys are case-insensitive and are always encoded in lowercase.
- Header keys may only contain HTTP token characters: `A-Z a-z 0-9 ! # $ % & ' * + . ^ _ ` | ~ -`.
- A header key may only appear once per message (compared case-insensitively). Messages with duplicate headers are invalid.
- Leading and trailing whitespace is removed from header values by both senders and receivers. Whitespace means space (`0x20`) and tab (`0x09`) only.
- Header values may only contain printable ASCII characters and tabs.

When an implementation needs to combine multiple values for the same key (for example when converting from another header format), the values are joined with `", "`.

### Reserved Headers

The following headers map to fields of specific message types. They cannot be used as custom headers.

| Key                  | Used By                                           | Description                                                                                     |
| -------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `req-id`             | `INVOCATION`, `OK`, `ERROR`, `STREAM_*`, `CANCEL` | Identifies which call a message belongs to. See [Request IDs](#request-ids).                    |
| `content-type`       | `INVOCATION`, `OK`, `ERROR`, `STREAM_START`       | See [Content Types](#content-types).                                                            |
| `accept`             | `INVOCATION`                                      | The content type the client wants to receive. Uses the same syntax as the HTTP `Accept` header. |
| `client-version`     | `INVOCATION`                                      | The version of the API the client was generated from (`info.version` in the app definition).    |
| `msg-id`             | `STREAM_DATA`                                     | An id for a stream item. Used for resuming streams.                                             |
| `last-msg-id`        | `INVOCATION`                                      | The id of the last stream item the client received. Used to resume an output stream.            |
| `heartbeat-interval` | `CONNECTION_START`, `HEARTBEAT`                   | How often (in milliseconds) the server will send `HEARTBEAT` messages.                          |
| `reason`             | `STREAM_END`, `CANCEL`, `GOAWAY`                  | A human readable explanation.                                                                   |

Receivers ignore reserved headers that don't apply to the message type. This allows new headers to be added without breaking older receivers.

### Binding Headers

Header keys beginning with `arri-` are reserved for [transport bindings](#transport-bindings). They are used for values that a binding needs in order to function but that are not part of any Arri message (for example the HTTP binding's `arri-connection-id`).

- Bindings must name any headers they define using the `arri-` prefix.
- Binding headers cannot be used as custom headers.
- Receivers ignore binding headers that appear inside a message.

### Custom Headers

Any other header is a custom header. Custom headers are passed through to application code, similar to HTTP headers. They are supported on `INVOCATION`, `OK`, `ERROR`, and `STREAM_START` messages and are ignored on all other message types.

Some transports give special meaning to certain header names (for example `host` or `content-length` in HTTP). Each binding must reject custom headers that would collide with such names rather than silently dropping or misinterpreting them, so that a header never behaves differently depending on the transport.

## Message Types

| Type               | Sent By | Has Body | Terminates Call | Description                                                                                                                       |
| ------------------ | ------- | -------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `INVOCATION`       | Client  | Yes      | No              | Starts a call.                                                                                                                    |
| `OK`               | Server  | Yes      | Yes             | The result of a call whose output is not a stream.                                                                                |
| `ERROR`            | Server  | Yes      | Yes             | The call failed. May be sent at any point during a call. See [Errors](#errors).                                                   |
| `STREAM_START`     | Both    | No       | No              | Starts a stream and declares the content type of its items.                                                                       |
| `STREAM_DATA`      | Both    | Yes      | No              | A single stream item.                                                                                                             |
| `STREAM_END`       | Both    | No       | Server only     | From the client: the client is done sending input. From the server: the call is complete.                                         |
| `CANCEL`           | Client  | No       | Yes             | The client is abandoning the call. Applies to any in-flight call, not only streams.                                               |
| `CONNECTION_START` | Server  | No       | -               | Sent once when a connection is established.                                                                                       |
| `HEARTBEAT`        | Server  | No       | -               | Keeps the connection alive.                                                                                                       |
| `GOAWAY`           | Server  | No       | -               | The server is going away. The client should stop starting new calls on this connection and reconnect once in-flight calls finish. |

`CONNECTION_START`, `HEARTBEAT`, and `GOAWAY` are connection-level messages. They don't belong to any call and never include a `req-id`.

A message received from the wrong party (e.g. a client receiving `INVOCATION`) is invalid.

## Request IDs

The `req-id` header identifies which call a message belongs to.

- Request IDs are chosen by the client and are opaque. Servers only compare them for equality and never interpret them.
- A request ID must be unique among the active calls of a single connection. Servers always scope request IDs by connection, so a request ID from one client can never refer to another client's call. A per-connection counter is sufficient, but clients may use any scheme (UUIDs, ULIDs, etc).
- Request IDs must be 1-128 visible ASCII characters (`0x21`-`0x7E`).
- Bindings where the transport already associates responses with requests (e.g. a single HTTP request) may omit request IDs. Bindings where multiple calls share a single channel, or where a single call spans multiple requests, require them.
- A server that receives an `INVOCATION` with a request ID that is already in use on that connection responds with an `ERROR`.

Request IDs are not intended for tracing. Use the standard W3C `traceparent` header as a custom header for that purpose.

## Content Types

- Whenever a content type is not explicitly provided it is `application/json`.
- `INVOCATION`: `content-type` is the content type of that message's body. `accept` is the content type the client wants to receive. If `accept` is omitted the server responds using the invocation's content type.
- `STREAM_START`: `content-type` is the content type of every subsequent `STREAM_DATA` message with the same `req-id` sent by the same party. `STREAM_DATA` messages do not repeat it.
- `OK` and `ERROR`: `content-type` is the content type of that message's body.
- If the server cannot produce the requested content type, or the requested content type is unknown, the server responds with an `ERROR` whose body is `application/json`.

`application/json` is the only content type that all implementations must support.

## Call Flows

Every call is terminated by exactly one of:

- an `OK` from the server
- an `ERROR` from the server
- a `STREAM_END` from the server
- a `CANCEL` from the client

After a call is terminated no further messages are sent for it. The request ID may then be reused.

### Unary

```txt
C → S   INVOCATION
S → C   OK
```

### Output Stream

```txt
C → S   INVOCATION
S → C   STREAM_START
S → C   STREAM_DATA      (zero or more)
S → C   STREAM_END
```

### Input Stream

```txt
C → S   INVOCATION       (no body)
C → S   STREAM_START
C → S   STREAM_DATA      (zero or more)
C → S   STREAM_END
S → C   OK
```

### Bidirectional

```txt
C → S   INVOCATION       (no body)
C → S   STREAM_START
S → C   STREAM_START
C → S   STREAM_DATA      (zero or more, interleaved with the server's)
S → C   STREAM_DATA      (zero or more, interleaved with the client's)
C → S   STREAM_END
S → C   STREAM_END
```

The client and server streams are independent. Either side's messages may be interleaved with the other's, and the server may end the call before the client has finished sending.

### Rules

- When a procedure's input is a stream, the `INVOCATION` has no body. The client does not wait for an acknowledgement from the server before sending its stream.
- The server may send `ERROR` at any point, which terminates the call. The client must then stop sending messages for that call, and the server discards any of the client's messages for that call that arrive afterwards.
- A `CANCEL` from the client terminates the call. The server should stop executing the procedure.
- If a connection is closed, every call on that connection is terminated.

## Errors

The body of an `ERROR` message contains the error details. When the content type is `application/json` it has the following shape:

```json
{
    "code": "NOT_FOUND",
    "message": "User not found",
    "type": "USER_NOT_FOUND",
    "data": { "userId": "12345" }
}
```

| Field     | Type     | Required | Description                                                                           |
| --------- | -------- | -------- | ------------------------------------------------------------------------------------- |
| `code`    | string   | yes      | The broad category of the error. One of the [error codes](#error-codes).              |
| `message` | string   | yes      | A human readable description of the error.                                            |
| `type`    | string   | no       | Identifies the specific error (e.g. `USER_NOT_FOUND`). Defined by the application.    |
| `data`    | any      | no       | Additional data. When `type` is present, the shape of `data` is determined by `type`. |
| `trace`   | string[] | no       | A stack trace. Should only be included in development environments.                   |

`code` and `type` work at different levels:

- `code` is a broad category from a fixed set defined by Arri. Generic code such as retry logic, middleware, and UI error handling can act on it without knowing anything about the procedure.
- `type` identifies exactly which error occurred. Applications define as many types as they need, each under an appropriate code (e.g. `{ "code": "NOT_FOUND", "type": "USER_NOT_FOUND" }`).

`type` and `data` follow the same shape as an adjacently tagged union (`tagKey: "type"`, `valueKey: "data"`), which allows procedures to declare typed errors. Clients that don't recognize `type` must fall back to a generic error and leave `data` undecoded. This allows servers to add new error types without breaking existing clients.

### Error Codes

Error codes are transport independent. Each [binding](#transport-bindings) defines how codes map to its transport's native error representation (e.g. HTTP status codes).

Receivers must treat error codes they don't recognize as `UNKNOWN`.

#### Arri Errors

Raised by Arri itself when a message or call cannot be processed.

| Code                       | Description                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `PROTOCOL_ERROR`           | A malformed message, broken framing, a message sent in the wrong direction, a duplicate `req-id`, or an unsupported protocol version. |
| `PROCEDURE_NOT_FOUND`      | No procedure exists with the requested rpc name.                                                                                      |
| `INVALID_INPUT`            | The input failed to decode or failed validation. `data` describes the failures.                                                       |
| `UNSUPPORTED_CONTENT_TYPE` | The input's content type is unknown or unsupported.                                                                                   |
| `NOT_ACCEPTABLE`           | The server cannot produce the content type the client accepts.                                                                        |
| `MESSAGE_TOO_LARGE`        | The message exceeds the maximum allowed size.                                                                                         |
| `OUTPUT_ENCODING_ERROR`    | The server's own output failed to encode or failed validation.                                                                        |

#### General Errors

Intended for use by applications. Arri may also raise them.

| Code                  | Description                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- |
| `BAD_REQUEST`         | The request is invalid for a reason other than failing input validation.           |
| `UNAUTHENTICATED`     | The caller is not authenticated.                                                   |
| `PERMISSION_DENIED`   | The caller is authenticated but not allowed to perform the operation.              |
| `NOT_FOUND`           | A requested resource does not exist.                                               |
| `CONFLICT`            | The operation conflicts with the current state (e.g. the resource already exists). |
| `FAILED_PRECONDITION` | The system is not in a state required for the operation.                           |
| `RATE_LIMITED`        | The caller has sent too many requests.                                             |
| `INTERNAL`            | An unexpected error occurred on the server.                                        |
| `UNIMPLEMENTED`       | The operation is not implemented.                                                  |
| `UNAVAILABLE`         | The server is temporarily unable to handle the call.                               |
| `TIMEOUT`             | The call did not complete in time.                                                 |
| `UNKNOWN`             | The cause of the error is unknown.                                                 |

#### Client Errors

Created by clients for failures that happen on the client side. They are never sent over the wire. Using the same set of codes allows applications to handle server errors and client side failures in the same way.

| Code               | Description                                 |
| ------------------ | ------------------------------------------- |
| `CANCELLED`        | The call was cancelled by the client.       |
| `CONNECTION_ERROR` | The connection failed or was lost.          |
| `INVALID_RESPONSE` | The server's response could not be decoded. |

#### Retries

The following codes indicate a transient failure, and by default clients may retry calls that fail with them:

- `UNAVAILABLE`
- `TIMEOUT`
- `RATE_LIMITED`
- `CONNECTION_ERROR`

A retryable code only means that the failure is transient. Whether it is safe to retry a call also depends on whether the procedure is idempotent.

### Connection-Level Errors

An `ERROR` without a `req-id` is a connection-level error. This is used when a server receives a message it cannot process and cannot determine which call it belongs to.

- When a message fails to parse, receivers should still try to recover its `req-id` so that the error can be reported for the correct call instead of leaving that call hanging.
- If the transport's framing is intact, a message that fails to parse is not fatal and the connection may continue.
- If the framing itself is broken (e.g. an invalid length prefix), the receiver can no longer locate message boundaries and should close the connection.

## Versioning

The protocol version is the major version only and is sent as part of the first line of every message (`ARRIRPC/0`). It is versioned independently from the [app definition](/specifications/arri_app_definition.md) schema version.

- A receiver that does not support the protocol version of a message rejects it.
- Optional features should be signaled through headers rather than by changing the protocol version.

## Transport Bindings

| Binding | Specification                                             |
| ------- | --------------------------------------------------------- |
| HTTP    | [Arri RPC HTTP Binding](/specifications/arri_rpc_http.md) |

Every binding must define:

- how connections are established and closed
- how messages are carried (either directly using the [message format](#message-format) or by translating them into native constructs)
- whether request IDs are required
- which custom header names collide with names the transport treats specially
- any [binding headers](#binding-headers) it uses

## Open Questions

The following have been discussed but not yet decided:

- **Framing**: Bindings that carry messages over a byte stream (e.g. TCP, HTTP request/response bodies) need a way to delimit messages. Arri plans to define a standard framing (likely a length prefix) with a maximum frame size.
- **Binary heads**: A compact binary head for high-volume message types (`STREAM_DATA`, `STREAM_END`, `CANCEL`, `HEARTBEAT`), negotiated per connection. Deferred until after v1.
- **Flow control**: Per-stream flow control for bindings where many streams share a single connection. Deferred until after v1.
- **Trailers**: Allowing custom headers on the server's final `STREAM_END`.
- **Typed error declarations**: Whether error types are declared per procedure, shared across an app, or both.
- **Heartbeats**: Whether heartbeats are sent by the server core for every connection or only for bindings without native liveness checks (e.g. WebSocket ping frames).
- **Version negotiation**: What a server sends when it receives a message with an unsupported protocol version.
