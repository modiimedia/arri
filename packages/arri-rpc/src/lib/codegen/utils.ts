import { type TObject } from "@sinclair/typebox";
import { type RpcMethod, isRpcMethod } from "../arri-rpc";

export function normalizeWhitespace(input: string) {
    if (input.includes("\n\n")) {
        return normalizeWhitespace(input.split("\n\n").join("\n"));
    }
    const lines: string[] = [];
    for (const line of input.split("\n")) {
        lines.push(line.trim());
    }
    return lines.join("").trim();
}

export interface ProcedureDefinition {
    path: string;
    method: RpcMethod;
    params: string;
    response: string;
}

export function isProcedureDefinition(
    input: any
): input is ProcedureDefinition {
    if (typeof input !== "object") {
        return false;
    }
    const expectedKeys = ["path", "method", "params", "response"];
    const existingKeys = Object.keys(input);
    for (const key of expectedKeys) {
        if (!existingKeys.includes(key)) {
            return false;
        }
    }
    return (
        isRpcMethod(input.method) &&
        typeof input.path === "string" &&
        typeof input.params === "string" &&
        typeof input.response === "string"
    );
}

export interface ServiceDefinition {
    [key: string]: ProcedureDefinition | ServiceDefinition;
}

export interface ApplicationDefinition {
    services: Record<string, ServiceDefinition>;
    models: Record<string, TObject>;
}
