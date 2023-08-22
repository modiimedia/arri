import type { TObject, TSchema } from "@sinclair/typebox";
import type { RpcMethod } from "./arri-rpc";
import { pascalCase } from "scule";

export interface ProcedureDefinition {
    path: string;
    method: RpcMethod;
    params: string;
    response: string;
}

export type ServiceDefinition = Record<string, ProcedureDefinition>;

export interface ApplicationDefinition {
    services: Record<string, ServiceDefinition>;
    models: Record<string, TSchema>;
}

export function createTypescriptClient(appDef: ApplicationDefinition) {}

const dartTypeMap = {
    integer: "int",
    number: "double",
    string: "String",
    boolean: "bool",
    null: "null",
} as const;

type DartType = (typeof dartTypeMap)[keyof typeof dartTypeMap];

export function createDartClient(appDef: ApplicationDefinition) {
    const { models, services } = appDef;
    const serviceParts: string[] = [];
    Object.keys(services).forEach((k) => {
        const service = services[k];
        const rpcParts: string[] = [];
        Object.keys(service).forEach((key) => {
            const rpc = service[key];
            rpcParts.push(`  ${rpc.response} ${key}() {
    await http.get(Uri.parse("$baseUrl${rpc.path.toString()}"));
  }`);
        });
        serviceParts.push(`class ${pascalCase(k)} {
  final String baseUrl;
  final Map<String, String> headers;
  const ${pascalCase(k)}({
    this.baseUrl = "",
    this.headers = {},
  });
}`);
    });

    const modelParts: string[] = [];
    Object.keys(models).forEach((key) => {
        const model = models[key];
        if (model.type === "object") {
            const objModel = model as TObject;
        }
    });
}
