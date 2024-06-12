import { execSync } from "node:child_process";
import fs from "node:fs/promises";

import {
    AppDefinition,
    defineGeneratorPlugin,
    isRpcDefinition,
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormType,
    isSchemaFormValues,
    isServiceDefinition,
    Schema,
    unflattenProcedures,
} from "@arrirpc/codegen-utils";
import path from "pathe";

import {
    CodegenContext,
    DartProperty,
    validDartClassName,
    validDartIdentifier,
} from "./_common";
import { dartAnyFromSchema } from "./any";
import { dartListFromSchema } from "./array";
import { dartSealedClassFromSchema } from "./discriminator";
import { dartEnumFromSchema } from "./enum";
import { dartClassFromSchema } from "./object";
import {
    dartBigIntFromSchema,
    dartBoolFromSchema,
    dartDateTimeFromSchema,
    dartDoubleFromSchema,
    dartIntFromSchema,
    dartStringFromSchema,
} from "./primitives";
import {
    dartRpcFromSchema,
    dartServiceFromSchema,
    getServiceName,
} from "./procedures";
import { dartMapFromSchema } from "./record";
import { dartRefFromSchema } from "./ref";

export interface DartClientGeneratorOptions {
    outputFile: string;
    clientName?: string;
    modelPrefix?: string;
    format?: boolean;
}

export const dartClientGenerator = defineGeneratorPlugin(
    (options: DartClientGeneratorOptions) => {
        return {
            async generator(def) {
                if (!options.outputFile) {
                    throw new Error(
                        'Missing "outputFile" cannot generate dart code',
                    );
                }
                try {
                    const result = createDartClient(def, options);
                    const destination = path.resolve(options.outputFile);
                    await fs.writeFile(destination, result);
                    if (options.format !== false) {
                        execSync(`dart format ${destination}`, {
                            stdio: "inherit",
                        });
                    }
                } catch (err) {
                    console.error(err);
                }
            },
            options,
        };
    },
);

export function createDartClient(
    def: AppDefinition,
    options: DartClientGeneratorOptions,
) {
    const typeParts: string[] = [];
    const context: CodegenContext = {
        clientName: options.clientName ?? "Client",
        modelPrefix: options.modelPrefix ?? "",
        generatedTypes: [],
        instancePath: "",
        schemaPath: "",
        clientVersion: def.info?.version,
    };
    const services = unflattenProcedures(def.procedures);
    const subServices: { key: string; name: string }[] = [];
    const subServiceParts: string[] = [];
    const rpcParts: string[] = [];
    for (const key of Object.keys(services)) {
        const subSchema = services[key]!;
        if (isServiceDefinition(subSchema)) {
            const service = dartServiceFromSchema(subSchema, {
                clientName: context.clientName,
                modelPrefix: context.modelPrefix,
                generatedTypes: context.generatedTypes,
                instancePath: key,
                schemaPath: `procedures.${key}`,
                clientVersion: context.clientVersion,
            });
            if (service) {
                subServiceParts.push(service);
                subServices.push({
                    key: validDartIdentifier(key),
                    name: getServiceName(key, context.clientName),
                });
            }
            continue;
        }
        if (isRpcDefinition(subSchema)) {
            const rpc = dartRpcFromSchema(subSchema, {
                clientName: context.clientName,
                modelPrefix: context.modelPrefix,
                generatedTypes: context.generatedTypes,
                instancePath: key,
                schemaPath: `procedures.${key}`,
            });
            if (rpc) {
                rpcParts.push(rpc);
            }
            continue;
        }
        console.warn(`Unknown schema in procedures at "${key}"`);
    }

    for (const key of Object.keys(def.definitions)) {
        const subDef = def.definitions[key]!;
        const result = dartTypeFromSchema(subDef, {
            clientName: context.clientName,
            modelPrefix: context.modelPrefix,
            generatedTypes: context.generatedTypes,
            instancePath: `/${key}`,
            schemaPath: `/${key}`,
        });
        if (result.content) {
            typeParts.push(result.content);
        }
    }
    if (rpcParts.length === 0 && subServiceParts.length === 0) {
        const heading = `// this file was autogenerated by arri
// ignore_for_file: type=lint, unused_field, unnecessary_cast
import 'dart:convert';
import 'package:arri_client/arri_client.dart';`;

        return `${heading}

${typeParts.join("\n\n")}`;
    }
    const clientName = validDartClassName(context.clientName, "");
    return `// this file was autogenerated by arri
// ignore_for_file: type=lint, unused_field, unnecessary_cast
import 'dart:async';
import 'dart:convert';
import 'package:arri_client/arri_client.dart';
import 'package:http/http.dart' as http;
    
class ${clientName} {
  final http.Client? _httpClient;
  final String _baseUrl;
  final String _clientVersion = "${context.clientVersion ?? ""}";
  late final FutureOr<Map<String, String>> Function()? _headers;
  ${clientName}({
    http.Client? httpClient,
    required String baseUrl,
    FutureOr<Map<String, String>> Function()? headers,
  }) : _httpClient = httpClient,
       _baseUrl = baseUrl,
       _headers = headers;
  
  ${rpcParts.join("\n\n")}

${subServices
    .map(
        (service) => `  ${service.name} get ${service.key} => ${service.name}(
          baseUrl: _baseUrl,
          headers: _headers,
          httpClient: _httpClient,
        );`,
    )
    .join("\n\n")}
}

${subServiceParts.join("\n\n")}

${typeParts.join("\n\n")}`;
}

export function dartTypeFromSchema(
    schema: Schema,
    context: CodegenContext,
): DartProperty {
    if (isSchemaFormType(schema)) {
        switch (schema.type) {
            case "string":
                return dartStringFromSchema(schema, context);
            case "boolean":
                return dartBoolFromSchema(schema, context);
            case "timestamp":
                return dartDateTimeFromSchema(schema, context);
            case "float32":
            case "float64":
                return dartDoubleFromSchema(schema, context);
            case "int8":
            case "uint8":
            case "int16":
            case "uint16":
            case "int32":
            case "uint32":
                return dartIntFromSchema(schema, context);
            case "int64":
            case "uint64":
                return dartBigIntFromSchema(schema, context);
            default:
                schema.type satisfies never;
                throw new Error(`Unhandled schema.type ${schema.type}`);
        }
    }
    if (isSchemaFormEnum(schema)) {
        return dartEnumFromSchema(schema, context);
    }

    if (isSchemaFormProperties(schema)) {
        return dartClassFromSchema(schema, context);
    }

    if (isSchemaFormElements(schema)) {
        return dartListFromSchema(schema, context);
    }

    if (isSchemaFormValues(schema)) {
        return dartMapFromSchema(schema, context);
    }

    if (isSchemaFormDiscriminator(schema)) {
        return dartSealedClassFromSchema(schema, context);
    }

    if (isSchemaFormRef(schema)) {
        return dartRefFromSchema(schema, context);
    }

    return dartAnyFromSchema(schema, context);
}