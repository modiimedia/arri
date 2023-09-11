import { pascalCase } from "scule";
import { defineClientGeneratorPlugin } from "./plugin";
import {
    type ServiceDefinition,
    isRpcDefinition,
    type RpcDefinition,
} from "arri-codegen-utils";

export interface DartClientGeneratorOptions {
    clientName: string;
    outputFile: string;
}

export const dartClientGenerator = defineClientGeneratorPlugin(
    (options: DartClientGeneratorOptions) => {
        return {
            generator: async (def) => {
                if (!options.clientName) {
                    throw new Error(
                        'Missing "clientName" cannot generate dart client',
                    );
                }
                if (!options.outputFile) {
                    throw new Error(
                        'Missing "outputFile" cannot generate dart client',
                    );
                }
                const numProcedures = Object.keys(def.procedures).length;
                if (numProcedures <= 0) {
                    console.warn(
                        "No procedures found in definition file. Dart client will not be generated",
                    );
                    return;
                }
                // const result = createDartClient(def, {
                //     clientName: options.clientName,
                // });
                // writeFileSync(options.outputFile, result);
                // try {
                //     execSync(`dart format ${options.outputFile}`);
                // } catch (err) {
                //     console.error("Error formatting dart client", err);
                // }
            },
            options,
        };
    },
);

export function dartServiceFromServiceDefinitioninition(
    name: string,
    def: ServiceDefinition,
    opts: DartClientGeneratorOptions,
) {
    const rpcParts: string[] = [];
    const subServiceParts: Array<{
        name: string;
        key: string;
        content: string;
    }> = [];
    const serviceName = `${name}`;
    Object.keys(def).forEach((key) => {
        const item = def[key];
        if (isRpcDefinition(item)) {
            rpcParts.push(
                dartProcedureFromServiceDefinitioninition(key, item, opts),
            );
            return;
        }
        const nameParts = name.split("Service");
        nameParts.pop();
        const subServiceName = pascalCase(
            `${nameParts.join("")}_${key}_Service`,
        );
        const subService = dartServiceFromServiceDefinitioninition(
            subServiceName,
            item,
            opts,
        );
        subServiceParts.push({
            name: subServiceName,
            key,
            content: subService,
        });
    });
    return `class ${serviceName} {
  final String _baseUrl;
  final Map<String, String> _headers;
  const ${serviceName}({
    String baseUrl = "",
    Map<String, String> headers = const {},
  }): _baseUrl = baseUrl,
  _headers = headers;
  ${subServiceParts
      .map(
          (sub) => `${sub.name} get ${sub.key} {
    return ${sub.name}(
        baseUrl: _baseUrl,
        headers: _headers,
    );
  }`,
      )
      .join("\n")}
  ${rpcParts.join("\n  ")}
}
${subServiceParts.map((sub) => sub.content).join("\n")}
`;
}

export function dartProcedureFromServiceDefinitioninition(
    key: string,
    def: RpcDefinition,
    opts: DartClientGeneratorOptions,
): string {
    let returnType:
        | `Future<String>`
        | "Future<int>"
        | "Future<number>"
        | "Future<void>"
        | `Future<${string}>` = `Future<String>`;
    let returnTypeName = "String";
    if (def.response) {
        returnType = `Future<${def.response}>`;
        returnTypeName = `${def.response}`;
    } else {
        returnType = "Future<void>";
    }
    let paramsInput = "";
    if (def.params) {
        paramsInput = `${def.params} params`;
    }
    let responseParser: string = "(body) => body;";
    switch (returnType) {
        case "Future<String>":
            break;
        case "Future<int>":
            responseParser = `(body) => Int.parse(body)`;
            break;
        case "Future<double>":
            responseParser = `(body) => Double.parse(body)`;
            break;
        case "Future<void>":
            responseParser = `(body) {}`;
            break;
        case "Future<bool>":
            responseParser = `(body) {
                        switch(body) {
                            case "true":
                            case "1":
                                return true;
                            case "false":
                            case "0":
                            default:
                                return false;
                        }
                    }`;
            break;
        default:
            responseParser = `(body) => ${returnTypeName}.fromJson(json.decode(body))`;
            break;
    }
    return `${returnType} ${key}(${paramsInput}) {
    return parsedArriRequest(
      "$_baseUrl${def.path}",
      method: HttpMethod.${def.method},
      headers: _headers,
      params: ${paramsInput.length ? `params.toJson()` : "null"},
      parser: ${responseParser},
    );
  }`;
}
