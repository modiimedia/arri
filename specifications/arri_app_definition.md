_This is a work in progress_

# Arri App Definition

This documents defines the app definition specification for Arri RPC. The current schema version is 0.0.7.

## Table of Contents

-   [Overview](#overview)
-   [Fields](#fields)
-   [Complete Example](#complete-example)

## Overview

Arri RPC is a simple RPC protocol based on HTTP and JSON. The Arri app definition is a JSON document that is used to automatically generate clients in various languages to communicate with an Arri RPC server.

## Fields

The app definition document contains the following fields.

| Field Name    | Type                                      | Required | Description                                                        |
| ------------- | ----------------------------------------- | -------- | ------------------------------------------------------------------ |
| schemaVersion | string                                    | TRUE     | A string indicated the version of the app definition specification |
| info          | [Info Object](#info-object)               | FALSE    | An object containing metadata about the API                        |
| procedures    | [Procedures Object](#procedures-object)   | TRUE     | An object containing all of the procedures available in the API    |
| definitions   | [Definitions Object](#definitions-object) | TRUE     | An object containing all of the types returned by the API          |

### Info Object

Info is used to communicate some metadata about the API

| Field Name  | Type   | Required | Description                                                                                                                                                           |
| ----------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name        | string | false    | A string indicating the name of the server application                                                                                                                |
| description | string | false    | A string containing a description of the server application                                                                                                           |
| version     | string | false    | A string indicating the current client version. Arri clients will send a header `client-version` with every request they make. This field is the source of that value |

### Procedures Object

The procedures object contains all of the procedures available in the application. Keys in the object indicate the name of the procedure while the value provides information about the procedure. For example,

```json
{
    "getUser": {
        "transport": "http",
        "path": "/get-user",
        "method": "get",
        "params": "UserParams",
        "response": "User"
    }
}
```

Tells client generators that the procedure `getUser()` can be invoked at `/get-user` using the `GET` HTTP method. It also tells us that the procedures takes `UserParams` as an input and returns `User` as an output.

Additionally keys can make use of `.` to nest procedures into services. For example,

```json
{
    "users.getUser": {
        "transport": "http",
        "path": "/users/get-user",
        "method": "get",
        "params": "UserParams",
        "response": "User"
    },
    "users.createUser": {
        "transport": "http",
        "path": "/users/create-user",
        "method": "post",
        "params": "User",
        "response": "User"
    }
}
```

Tells client generators that `getUser()` and `createUser()` are functions that should be accessible under the `users` key. (Ex: `client.users.getUser()`)

These two examples show HTTP procedure schemas. However there are multiple procedure schema forms. They are:

-   HTTP Procedure
-   WS Procedure (Very Experimental)
-   Custom

The `transport` field is used to determine what schema form is being used.

#### HTTP Procedure

Http procedures are procedures that are called over HTTP. They have the following fields:

| Field Name    | Type    | Required | Description                                                                                                                                                                                                  |
| ------------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| transport     | string  | true     | Must be "http"                                                                                                                                                                                               |
| path          | string  | true     | A string indicated the url path that this procedure has been mapped to. (Must begin with "/")                                                                                                                |
| method        | string  | true     | A string indicating the HTTP method needed to call this procedure. The only accepted values are "get", "post", "put", "patch", or "delete"                                                                   |
| params        | string  | false    | A string indicating which type from the [Definitions Object](#definitions-object) this procedure receives as an input. If not defined then the procedure will be treated as having no inputs.                |
| response      | string  | false    | A string indicating which type from the [Definitions Object](#definitions-object) this procedure returns. If not defined then the procedure will be treated as having no response.                           |
| isEventStream | boolean | false    | Setting to `true` indicates that this procedure makes use of Server Sent Events to send a stream of messages that the client can subscribe to (rather than returning a single response). Default is `false`. |

#### Websocket Procedure

!todo!

#### Custom Procedure

Procedures that have some arbitrary set of keys that will be used by a custom generator plugin.

| Field Name | Type   | Required | Description                                                                                                                                                                                                                   |
| ---------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| transport  | string | true     | A string prefixed with `"custom:"` indicating which transport mechanism is being used to send and receive messages. Example `"custom:tcp"` indicates the procedure uses a custom TCP implementation to send/receive messages. |

No other fields are required. Any additional fields will depend on the needs of the custom implementation.

##### Example Custom Procedure Schema

```json
{
    "books.getBook": {
        "transport": "custom:udp",
        // include whatever additional information
        // you need for your custom generator
        "foo": "foo",
        "bar": "bar"
    }
}
```

### Definitions Object

The definitions object contains all of the types send and receive by the application as well as any other types that the generators should create. Values are [Arri Type Definitions](/specifications/arri_type_definition.md), while keys are the type id. If a value has an id set in `metadata.id` then the key and `metadata.id` should be the same.

#### Example

```json
{
    "UserParams": {
        "properties": {
            "userId": {
                "type": "string"
            }
        }
    },
    "User": {
        "properties": {
            "id": {
                "type": "string"
            },
            "name": {
                "type": "string"
            },
            "isAdmin": {
                "type": "boolean"
            }
        },
        "metadata": {
            // if this is present then it should match the key above
            "id": "User"
        }
    }
}
```

## Complete Example

```json
{
    "schemaVersion": "0.0.7",
    "info": {
        "name": "My Arri Server",
        "description": "This is a server I made using Arri RPC",
        "version": "12"
    },
    "procedures": {
        "users.getUser": {
            "transport": "http",
            "method": "get",
            "path": "/users/get-user",
            "params": "GetUserParams",
            "response": "User"
        },
        "users.createUser": {
            "transport": "http",
            "method": "post",
            "path": "/users/create-user",
            "params": "CreateUserParams",
            "response": "User"
        },
        "users.watchUser": {
            "transport": "http",
            "method": "post",
            "path": "/users/watch-user",
            "params": "WatchUserParams",
            "response": "User",
            "isEventStream": true
        }
    },
    "definitions": {
        "User": {
            "properties": {
                "id": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "createdAt": {
                    "type": "timestamp"
                },
                "role": {
                    "enum": ["STANDARD", "ADMIN", "MODERATOR"],
                    "metadata": {
                        "id": "UserRole"
                    }
                }
            }
        },
        "GetUserParams": {
            "properties": {
                "userId": {
                    "type": "string"
                }
            }
        },
        "CreateUserParams": {
            "properties": {
                "name": {
                    "type": "string"
                }
            },
            "optionalProperties": {
                "role": {
                    "enum": ["STANDARD", "ADMIN", "MODERATOR"],
                    "metadata": {
                        "id": "UserRole"
                    }
                }
            }
        },
        "WatchUserParams": {
            "properties": {
                "userId": {
                    "type": "string"
                }
            }
        }
    }
}
```
