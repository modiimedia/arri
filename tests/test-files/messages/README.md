# Arri RPC Message Fixtures

Test fixtures for the [Arri RPC message format](/specifications/arri_rpc.md). Every implementation should be tested against these files.

`Messages.json` (in the parent directory) lists every fixture:

- `valid`: messages that must parse successfully into `message`.
  - When `canonical` is `true`, encoding `message` must produce the fixture file byte-for-byte.
  - Headers are `[key, value]` pairs since header order is significant when encoding. Canonical order is `req-id` followed by the remaining reserved headers in the order they are listed in the spec, followed by custom headers in insertion order.
  - UTF-8 bodies are stored in `body`. Other bodies are base64 encoded in `bodyBase64`.
- `invalid`: messages that must fail to parse. When `reqId` is present, the parser must still recover that `req-id` so the receiver can respond with an `ERROR` for that call.

The `.arrimsg` files are raw bytes. Do not let editors or git change their line endings.

Below is a readable version of each file. Line feeds are shown as `\n` followed by a line break, tabs as `\t`, and other non-printable bytes as `\xNN`.

## Invocation.arrimsg

INVOCATION with every reserved header, custom headers, and a body

```txt
ARRIRPC/0 INVOCATION users.getUser\n
req-id: 1\n
content-type: application/json\n
accept: application/json\n
client-version: 1.2.0\n
authorization: Bearer abc123\n
x-tenant-id: tenant_1\n
\n
{"id":"12345"}
```

## Invocation_Minimal.arrimsg

INVOCATION with only an rpc name

```txt
ARRIRPC/0 INVOCATION users.getUser\n
\n

```

## Invocation_NoBody.arrimsg

INVOCATION for a procedure with a streamed input (the body is omitted)

```txt
ARRIRPC/0 INVOCATION chat.sendMessages\n
req-id: f81d4fae-7dec-11d0-a765-00a0c91e6bf6\n
\n

```

## Invocation_LastMsgId.arrimsg

INVOCATION resuming an output stream

```txt
ARRIRPC/0 INVOCATION users.watchUser\n
req-id: 2\n
accept: application/json\n
last-msg-id: 42\n
\n
{"id":"12345"}
```

## Invocation_SpecialHeaderValues.arrimsg

header values containing tabs, colons, and other printable ASCII

```txt
ARRIRPC/0 INVOCATION sendObject\n
req-id: 3\n
x-url: https://example.com:8080/a?b=c\n
x-tabbed: a\tb\n
x-symbols: ~!@#$%^&*()_+-={}[]|\\:";'<>?,./\n
\n
{"id":"1","content":"hello world"}
```

## Ok.arrimsg

OK with custom headers and a body

```txt
ARRIRPC/0 OK\n
req-id: 1\n
content-type: application/json\n
x-cache: HIT\n
\n
{"id":"12345","name":"John Doe"}
```

## Ok_NoBody.arrimsg

OK for a procedure without a response

```txt
ARRIRPC/0 OK\n
req-id: 1\n
\n

```

## Error.arrimsg

ERROR with a typed error body

```txt
ARRIRPC/0 ERROR\n
req-id: 1\n
content-type: application/json\n
\n
{"code":"NOT_FOUND","message":"User not found","type":"USER_NOT_FOUND","data":{"userId":"12345"}}
```

## Error_ConnectionLevel.arrimsg

ERROR without a req-id (connection-level error)

```txt
ARRIRPC/0 ERROR\n
\n
{"code":"PROTOCOL_ERROR","message":"Invalid message. Missing empty line after headers."}
```

## StreamStart.arrimsg

STREAM_START with a content type and custom headers

```txt
ARRIRPC/0 STREAM_START\n
req-id: 1\n
content-type: application/json\n
x-stream-name: users\n
\n

```

## StreamData.arrimsg

STREAM_DATA with a msg-id

```txt
ARRIRPC/0 STREAM_DATA\n
req-id: 1\n
msg-id: 1\n
\n
{"id":"12345","name":"John Doe"}
```

## StreamData_BodyWithEmptyLines.arrimsg

STREAM_DATA whose body contains "\n\n" (only the first "\n\n" ends the head)

```txt
ARRIRPC/0 STREAM_DATA\n
req-id: 1\n
\n
line one\n
\n
line two\n
\n

```

## StreamData_BinaryBody.arrimsg

STREAM_DATA whose body is arbitrary bytes (null bytes, invalid UTF-8, "\n\n", "\r\n")

```txt
ARRIRPC/0 STREAM_DATA\n
req-id: 1\n
\n
\x00\xff\xfe\n
\n
\x0d\n
\x80\x7f\x00
```

## StreamEnd.arrimsg

STREAM_END with a reason

```txt
ARRIRPC/0 STREAM_END\n
req-id: 1\n
reason: no more events\n
\n

```

## StreamEnd_NoReason.arrimsg

STREAM_END with only a req-id

```txt
ARRIRPC/0 STREAM_END\n
req-id: 1\n
\n

```

## Cancel.arrimsg

CANCEL with a reason

```txt
ARRIRPC/0 CANCEL\n
req-id: 1\n
reason: user navigated away\n
\n

```

## ConnectionStart.arrimsg

CONNECTION_START with a heartbeat interval

```txt
ARRIRPC/0 CONNECTION_START\n
heartbeat-interval: 20000\n
\n

```

## Heartbeat.arrimsg

HEARTBEAT with a heartbeat interval

```txt
ARRIRPC/0 HEARTBEAT\n
heartbeat-interval: 20000\n
\n

```

## Heartbeat_NoInterval.arrimsg

HEARTBEAT without any headers

```txt
ARRIRPC/0 HEARTBEAT\n
\n

```

## GoAway.arrimsg

GOAWAY with a reason

```txt
ARRIRPC/0 GOAWAY\n
reason: server restarting\n
\n

```

## Invocation_MixedCaseHeaders.arrimsg

header keys are case-insensitive and normalized to lowercase

```txt
ARRIRPC/0 INVOCATION users.getUser\n
Req-Id: 1\n
Content-Type: application/json\n
X-Tenant-ID: tenant_1\n
\n
{"id":"12345"}
```

## Invocation_UntrimmedHeaderValues.arrimsg

leading/trailing spaces and tabs are trimmed from header values, and the space after ":" is optional

```txt
ARRIRPC/0 INVOCATION users.getUser\n
req-id:1\n
accept: \t application/json\t \n
x-foo:\tbar baz  \n
\n

```

## Invocation_HeaderOrder.arrimsg

reserved and custom headers may appear in any order

```txt
ARRIRPC/0 INVOCATION users.getUser\n
x-foo: 1\n
content-type: application/json\n
x-bar: 2\n
req-id: 1\n
\n
{"id":"12345"}
```

## Invocation_BindingHeaders.arrimsg

headers starting with "arri-" are ignored

```txt
ARRIRPC/0 INVOCATION users.getUser\n
req-id: 1\n
arri-connection-id: abc123\n
Arri-Foo: bar\n
\n

```

## StreamEnd_IgnoredHeaders.arrimsg

reserved headers that do not apply to the message type, and custom headers on message types without custom headers, are ignored

```txt
ARRIRPC/0 STREAM_END\n
req-id: 1\n
content-type: application/json\n
msg-id: 5\n
x-foo: bar\n
\n

```

## Invalid_Empty.arrimsg

empty input

```txt

```

## Invalid_MissingHeadEnd.arrimsg

no empty line after the headers

```txt
ARRIRPC/0 OK\n
req-id: 1\n

```

## Invalid_CrlfLineEndings.arrimsg

"\r\n" line endings are not supported

```txt
ARRIRPC/0 OK\x0d\n
req-id: 1\x0d\n
\n

```

## Invalid_NonAsciiHeaderValue.arrimsg

header values must be ASCII

```txt
ARRIRPC/0 INVOCATION users.getUser\n
req-id: 1\n
x-name: caf\xc3\xa9\n
\n

```

## Invalid_ControlCharacterInHead.arrimsg

the head may not contain control characters other than tab and line feed

```txt
ARRIRPC/0 INVOCATION users.getUser\n
req-id: 1\n
x-foo: a\x00b\n
\n

```

## Invalid_WrongPrefix.arrimsg

first line does not start with "ARRIRPC/"

```txt
HTTP/1.1 OK\n
req-id: 1\n
\n

```

## Invalid_UnsupportedVersion.arrimsg

unsupported protocol version

```txt
ARRIRPC/1 OK\n
req-id: 1\n
\n

```

## Invalid_LowercaseMessageType.arrimsg

message types are case-sensitive

```txt
ARRIRPC/0 ok\n
req-id: 1\n
\n

```

## Invalid_UnknownMessageType.arrimsg

unknown message type

```txt
ARRIRPC/0 FOO\n
req-id: 1\n
\n

```

## Invalid_MissingMessageType.arrimsg

first line has no message type

```txt
ARRIRPC/0\n
req-id: 1\n
\n

```

## Invalid_EmptyFirstLine.arrimsg

message starts with an empty line

```txt
\n
ARRIRPC/0 OK\n
\n

```

## Invalid_Invocation_MissingRpcName.arrimsg

INVOCATION without an rpc name

```txt
ARRIRPC/0 INVOCATION\n
req-id: 1\n
\n

```

## Invalid_Invocation_ExtraTokens.arrimsg

INVOCATION with more than one rpc name

```txt
ARRIRPC/0 INVOCATION users.getUser extra\n
req-id: 1\n
\n

```

## Invalid_Ok_ExtraTokens.arrimsg

only INVOCATION may have content after the message type

```txt
ARRIRPC/0 OK users.getUser\n
req-id: 1\n
\n

```

## Invalid_DuplicateHeader.arrimsg

header keys may only appear once (case-insensitive)

```txt
ARRIRPC/0 INVOCATION users.getUser\n
req-id: 1\n
X-Foo: 1\n
x-foo: 2\n
\n

```

## Invalid_HeaderMissingColon.arrimsg

header line without a ":"

```txt
ARRIRPC/0 INVOCATION users.getUser\n
req-id: 1\n
x-foo\n
\n

```

## Invalid_HeaderEmptyKey.arrimsg

header line with an empty key

```txt
ARRIRPC/0 INVOCATION users.getUser\n
req-id: 1\n
: foo\n
\n

```

## Invalid_HeaderInvalidKey.arrimsg

header keys must be HTTP token characters

```txt
ARRIRPC/0 INVOCATION users.getUser\n
req-id: 1\n
x foo: bar\n
\n

```

## Invalid_ReqIdWithSpace.arrimsg

req-id must be visible ASCII (no spaces)

```txt
ARRIRPC/0 OK\n
req-id: a b\n
\n

```

## Invalid_ReqIdEmpty.arrimsg

req-id must not be empty

```txt
ARRIRPC/0 OK\n
req-id: \n
\n

```

## Invalid_ReqIdTooLong.arrimsg

req-id must be at most 128 characters

```txt
ARRIRPC/0 OK\n
req-id: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n
\n

```

## Invalid_HeartbeatIntervalNotANumber.arrimsg

heartbeat-interval must be a non-negative integer

```txt
ARRIRPC/0 HEARTBEAT\n
heartbeat-interval: abc\n
\n

```

## Invalid_HeartbeatIntervalNegative.arrimsg

heartbeat-interval must be a non-negative integer

```txt
ARRIRPC/0 HEARTBEAT\n
heartbeat-interval: -1\n
\n

```

## Invalid_HeartbeatIntervalDecimal.arrimsg

heartbeat-interval must be a non-negative integer

```txt
ARRIRPC/0 HEARTBEAT\n
heartbeat-interval: 1.5\n
\n

```
