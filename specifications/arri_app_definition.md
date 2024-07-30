_This is a work in progress_

# Arri App Definition

This documents defines the app definition specification for Arri RPC. The current schema version is 0.0.6.

## Overview

Arri RPC is a simple RPC protocol based on HTTP and JSON. The Arri app definition is a JSON document that is used to automatically generate clients in various languages to communicate with an Arri RPC server.

## App Definition Object

This is the root object that makes up an Arri app definition document.

| Field Name    | Type               | Required | Description                                                        |
| ------------- | ------------------ | -------- | ------------------------------------------------------------------ |
| schemaVersion | string             | TRUE     | A string indicated the version of the app definition specification |
| info          | Info Object        | FALSE    | An object containing metadata about the API                        |
| procedures    | Procedures Object  | TRUE     |                                                                    |
| definitions   | Definitions Object | TRUE     |                                                                    |

## Example

```json
{
    "schemaVersion": "0.0.6",
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
            },
            "additionalProperties": true
        },
        "GetUserParams": {
            "properties": {
                "userId": {
                    "type": "string"
                }
            },
            "additionalProperties": true
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
            },
            "additionalProperties": true
        },
        "WatchUserParams": {
            "properties": {
                "userId": {
                    "type": "string"
                }
            },
            "additionalProperties": true
        }
    }
}
```
