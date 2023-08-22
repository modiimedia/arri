import { Kind } from "@sinclair/typebox";
import { test } from "vitest";
import type { ApplicationDefinition } from "./codegen";

const applicationDefinition: ApplicationDefinition = {
    services: {
        v1: {
            users: {
                getUser: {
                    path: "/v1/users/get-user",
                    method: "get",
                    params: "UsersGetUserParams",
                    response: "User",
                },
            },
        },
        users: {
            getUser: {
                path: "/users/get-user",
                method: "get",
                params: "UsersGetUserParams",
                response: "User",
            },
        },
    },
    models: {
        User: {
            $id: "User",
            title: "User",
            type: "object",
            params: [],
            properties: {
                id: {
                    type: "string",
                },
                firstName: {
                    type: "string",
                },
                lastName: {
                    type: "string",
                },
                email: {
                    type: "string",
                },
            },
            required: ["id", "firstName", "lastName", "email"],
            static: undefined,
            [Kind]: "",
        },
        UsersGetUserParams: {
            $id: "UsersGetUserParams",
            title: "UserGetUserParams",
            type: "object",
            properties: {
                userId: {
                    type: "string",
                },
            },
            params: ["userId"],
            required: ["userId"],
            static: undefined,
            [Kind]: "",
        },
    },
};

test("Codegen example", () => {
    console.log(applicationDefinition);
});
