_This is a work in progress_

# Arri RPC HTTP Binding

This document defines how [Arri RPC](/specifications/arri_rpc.md) messages are carried over HTTP.

## Table of Contents

- [Overview](#overview)
- [Connections](#connections)
- [Routing](#routing)
- [Header Mapping](#header-mapping)
- [Unary Calls](#unary-calls)
- [Output Streams](#output-streams)
- [Input and Bidirectional Streams](#input-and-bidirectional-streams)
- [Cancellation](#cancellation)
- [Errors](#errors)
    - [Error Codes to HTTP Status Codes](#error-codes-to-http-status-codes)
    - [HTTP Status Codes to Error Codes](#http-status-codes-to-error-codes)
- [Protected Headers](#protected-headers)
- [Binding Headers](#binding-headers)
- [Open Questions](#open-questions)

## Overview

The HTTP binding does not send Arri messages over the wire as-is. Instead it translates them into native HTTP constructs (methods, status codes, headers, and bodies).

Design goal: **every kind of call that HTTP can naturally express uses plain HTTP.** Unary calls and output streams can be made with any HTTP client (including `curl`) without knowledge of Arri. Only input and bidirectional streams, which HTTP/1.1 cannot express natively, use Arri-specific conventions.

## Connections

- Each HTTP request is its own connection, unless it is part of a [split call](#split-calls).
- Split calls take place on a logical connection identified by an [`arri-connection-id`](#binding-headers) issued by the server.

## Routing

Each procedure is invoked at an HTTP path and method described by the [app definition](/specifications/arri_app_definition.md). The server determines the rpc name of an `INVOCATION` from the path and method of the request. If not otherwise specified the method is `POST`.

## Header Mapping

| Arri                                | HTTP                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| `content-type`                      | `Content-Type`                                                                   |
| `accept`                            | `Accept`                                                                         |
| `msg-id`                            | the SSE `id` field (see [Output Streams](#output-streams))                       |
| `last-msg-id`                       | `Last-Event-ID` request header                                                   |
| `req-id`                            | `req-id`. Optional, except for [split calls](#split-calls) where it is required. |
| `client-version`                    | `client-version`                                                                 |
| Custom headers                      | passed through unchanged                                                         |
| [Binding headers](#binding-headers) | `arri-*`                                                                         |

Reserved Arri headers with a native HTTP equivalent use that equivalent. Reserved headers without an HTTP equivalent keep their Arri names, which cannot collide with custom headers because they are reserved.

HTTP header names are case-insensitive. HTTP headers that appear more than once are joined with `", "` when converted to Arri headers.

## Unary Calls

```http
POST /users/get-user HTTP/1.1
Content-Type: application/json
Authorization: Bearer abc123

{"id":"12345"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id":"12345","name":"John Doe"}
```

- The request body is the `INVOCATION` body.
- An `OK` message becomes a `200` response. Its body becomes the response body and its custom headers become response headers.
- An `ERROR` message becomes an [error response](#errors).

## Output Streams

Output streams are sent as [Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html) (SSE) when the request includes `Accept: text/event-stream`.

```http
POST /users/watch-user HTTP/1.1
Content-Type: application/json
Accept: text/event-stream

{"id":"12345"}
```

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream

id: 1
data: {"id":"12345","name":"John Doe"}

id: 2
data: {"id":"12345","name":"Jane Doe"}

event: STREAM_END
data: no more events

```

| Arri           | SSE                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `STREAM_START` | the `200` response status and headers. Custom headers on `STREAM_START` become response headers.       |
| `STREAM_DATA`  | an event with no `event` field, the `msg-id` as its `id` field, and the body as its `data` field       |
| `STREAM_END`   | an event with `event: STREAM_END` and the reason (if any) as its `data` field. The response then ends. |
| `ERROR`        | an event with `event: ERROR` and the error body as its `data` field. The response then ends.           |
| `HEARTBEAT`    | an event with `event: HEARTBEAT`                                                                       |

- `STREAM_DATA` events have no `event` field so that they are dispatched as standard `message` events. This allows third parties to consume Arri streams with any SSE client, including the browser `EventSource` API.
- An `ERROR` that occurs before `STREAM_START` becomes a regular [error response](#errors) instead of an SSE event.
- Clients resume a stream by sending the `Last-Event-ID` header with the `id` of the last event they received.
- SSE is a line based text format, so stream items sent over SSE must not contain `\r` or `\n` bytes. In practice this means SSE streams use `application/json`, since compact JSON never contains raw newlines. Servers write the SSE framing and the body bytes directly without converting the body to a string.

## Input and Bidirectional Streams

HTTP/1.1 (and all browsers) cannot send a request body while simultaneously receiving a response body, so input and bidirectional streams require Arri-specific conventions.

### Split Calls

A split call spreads a single call across multiple HTTP requests: one request receives the server's output, and one or more additional requests carry the client's input.

```txt
1. C → S   POST /chat                    (opens the call and receives the output)
           req-id: 1
           Accept: text/event-stream

   S → C   200 OK
           Content-Type: text/event-stream
           arri-connection-id: <issued by the server>

2. C → S   POST /chat                    (carries input, repeated as needed)
           req-id: 1
           arri-connection-id: <id>
           body: one or more input stream messages

3. C → S   POST /chat                    (ends the client's input)
           req-id: 1
           arri-connection-id: <id>
           body: STREAM_END

4. S → C   OK or STREAM_END on the output request
```

- `req-id` is required for every request of a split call. The server identifies the call by the combination of `arri-connection-id` and `req-id`.
- The server issues the connection id. Connection ids must be unguessable (at least 128 bits of randomness), since anyone who knows one can send input to its calls.
- A client that already has a connection id sends it on the first request of new split calls to reuse the logical connection.
- Every request of a split call must reach the same server instance. Deployments behind a load balancer need sticky sessions or a shared broker.

The exact shape of input requests is not yet decided (see [Open Questions](#open-questions)).

### Streaming Request Bodies

Clients that can stream a request body while receiving the response (e.g. over HTTP/2, or native clients using chunked transfer encoding) may instead carry the entire call in a single request, with the input stream sent as the request body. This requires the standard [framing](/specifications/arri_rpc.md#open-questions), which is not yet defined.

## Cancellation

A client cancels a call (`CANCEL`) by aborting the HTTP request that receives the call's output. When that request is closed the server terminates the call.

## Errors

An `ERROR` message is sent as an HTTP response whose status code is determined by the error's [code](/specifications/arri_rpc.md#error-codes) and whose body is the [error body](/specifications/arri_rpc.md#errors).

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"code":"NOT_FOUND","message":"User not found","type":"USER_NOT_FOUND","data":{"userId":"12345"}}
```

- Custom headers on the `ERROR` message become response headers.
- Errors that occur after an output stream has started are sent as SSE events (see [Output Streams](#output-streams)).

### Error Codes to HTTP Status Codes

| Error Code                 | HTTP Status |
| -------------------------- | ----------- |
| `PROTOCOL_ERROR`           | 400         |
| `PROCEDURE_NOT_FOUND`      | 404         |
| `INVALID_INPUT`            | 400         |
| `UNSUPPORTED_CONTENT_TYPE` | 415         |
| `NOT_ACCEPTABLE`           | 406         |
| `MESSAGE_TOO_LARGE`        | 413         |
| `OUTPUT_ENCODING_ERROR`    | 500         |
| `BAD_REQUEST`              | 400         |
| `UNAUTHENTICATED`          | 401         |
| `PERMISSION_DENIED`        | 403         |
| `NOT_FOUND`                | 404         |
| `CONFLICT`                 | 409         |
| `FAILED_PRECONDITION`      | 412         |
| `RATE_LIMITED`             | 429         |
| `INTERNAL`                 | 500         |
| `UNIMPLEMENTED`            | 501         |
| `UNAVAILABLE`              | 503         |
| `TIMEOUT`                  | 504         |
| `UNKNOWN`                  | 500         |

- Any other error code is sent as `500`.
- [Client error codes](/specifications/arri_rpc.md#client-errors) are never sent by servers and have no mapping.
- Several codes share a status code. The error body's `code` is always authoritative.

### HTTP Status Codes to Error Codes

Clients may receive error responses that did not come from an Arri server (for example a `502` page from a proxy, or a `429` from a CDN). When an error response's body is not a valid error body, clients determine the error code from the HTTP status code:

| HTTP Status | Error Code                 |
| ----------- | -------------------------- |
| 400         | `BAD_REQUEST`              |
| 401         | `UNAUTHENTICATED`          |
| 403         | `PERMISSION_DENIED`        |
| 404         | `NOT_FOUND`                |
| 406         | `NOT_ACCEPTABLE`           |
| 408         | `TIMEOUT`                  |
| 409         | `CONFLICT`                 |
| 412         | `FAILED_PRECONDITION`      |
| 413         | `MESSAGE_TOO_LARGE`        |
| 415         | `UNSUPPORTED_CONTENT_TYPE` |
| 429         | `RATE_LIMITED`             |
| 501         | `UNIMPLEMENTED`            |
| 502         | `UNAVAILABLE`              |
| 503         | `UNAVAILABLE`              |
| 504         | `TIMEOUT`                  |
| other       | `UNKNOWN`                  |

The original status code and response body should be made available to application code for debugging.

## Protected Headers

The following header names have special meaning in HTTP or in this binding. Clients and servers using the HTTP binding must reject custom headers with these names:

- `connection`
- `content-encoding`
- `content-length`
- `expect`
- `host`
- `keep-alive`
- `last-event-id` (used for `last-msg-id`)
- `proxy-authenticate`
- `proxy-authorization`
- `proxy-connection`
- `te`
- `trailer`
- `transfer-encoding`
- `upgrade`

## Binding Headers

| Header               | Description                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `arri-connection-id` | Identifies a logical connection for [split calls](#split-calls). |

## Open Questions

- **Input request shape**: How input requests of a split call are addressed (same path as the procedure, a shared endpoint, or a path suffix) and how multiple input messages are batched into a single request body (likely using the standard framing).
- **Input ordering**: Whether clients must wait for each input request to complete before sending the next, or whether input requests can be sent concurrently with sequence numbers.
- **Logical connection lifetime**: When logical connections expire, and whether they are bound to the identity (e.g. auth headers) of the request that created them.
- **Arri framing over HTTP**: Whether output streams can also be sent using the standard Arri framing (e.g. via a dedicated `Accept` value) to support binary content types.
- **GET requests**: How procedures invoked with `GET` receive their input (e.g. as URL query parameters) and how that is represented in an `INVOCATION`.
- **Heartbeats**: Whether SSE comment lines should be used for heartbeats instead of `HEARTBEAT` events.
- **Split call cancellation**: Whether aborting the output request is sufficient to cancel a split call, or whether a dedicated cancel request is also needed.
