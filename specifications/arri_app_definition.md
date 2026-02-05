_This is a work in progress_

# Arri App Definition

This documents defines the app definition specification for Arri RPC. The current schema version is 0.0.8.

## Table of Contents

- [Overview](#overview)
- [Fields](#fields)
- [Complete Example](#complete-example)

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
        "transports": ["http"],
        "path": "/get-user",
        "method": "get",
        "input": "GetUserInput",
        "output": "User"
    }
}
```

Tells client generators that the procedure `getUser()` can be invoked at `/get-user` using the `GET` HTTP method. It also tells us that the procedures takes `GetUserInput` as an input and returns `User` as an output.

Additionally keys can make use of `.` to nest procedures into services. For example,

```json
{
    "users.getUser": {
        "transports": ["http"],
        "path": "/users/get-user",
        "method": "get",
        "input": "GetUserInput",
        "output": "User"
    },
    "users.createUser": {
        "transports": ["http"],
        "path": "/users/create-user",
        "method": "post",
        "input": "User",
        "output": "User"
    }
}
```

Tells client generators that `getUser()` and `createUser()` are functions that should be accessible under the `users` key. (Ex: `client.users.getUser()`)

#### Procedure Object Properties

| Property       | Type                                       | Required | Description                                                                                                                                                                                                   |
| -------------- | ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| transports     | string[]                                   | yes      | The support transport(s) that the procedure can be called over. (Arri has 1st party support for HTTP and Websockets)                                                                                          |
| path           | string                                     | yes      | URL path used to invoke the procedure (HTTP only)                                                                                                                                                             |
| method         | "get", "post", "patch", "put", or "delete" | no       | HTTP method. If not present Arri will use `post` by default. (HTTP only)                                                                                                                                      |
| params         | string                                     | no       | A string indicating which type from the [Definitions Object](#definitions-object) this procedure receives as an input. If not defined then the procedure will be treated as having no inputs.                 |
| response       | string                                     | no       | A string indicating which type from the [Definitions Object](#definitions-object) this procedure returns. If not defined then the procedure will be treated as having no response.                            |
| description    | string                                     | no       | A string that will become doc comments for this procedure when passed to the arri code generators                                                                                                             |
| isEventStream  | boolean                                    | no       | Setting this to `true` makes this an "event stream" procedure. Meaning that the server will stream realtime events back to the client. Over HTTP Arri will make use of server sent events to accomplish this. |
| isDeprecated   | boolean                                    | no       | Mark a procedure as deprecated                                                                                                                                                                                |
| deprecatedNote | string                                     | no       | Add a deprecation message to the procedure (use alongside `isDeprecated`)                                                                                                                                     |

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
    "schemaVersion": "0.0.8",
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
