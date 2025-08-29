import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';

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
} from '@arrirpc/codegen-utils';
import path from 'pathe';

import {
    CodegenContext,
    DartProperty,
    validDartClassName,
    validDartIdentifier,
} from './_common';
import { dartAnyFromSchema } from './any';
import { dartListFromSchema } from './array';
import { dartSealedClassFromSchema } from './discriminator';
import { dartEnumFromSchema } from './enum';
import { dartClassFromSchema } from './object';
import {
    dartBigIntFromSchema,
    dartBoolFromSchema,
    dartDateTimeFromSchema,
    dartDoubleFromSchema,
    dartIntFromSchema,
    dartStringFromSchema,
} from './primitives';
import {
    dartRpcFromSchema,
    dartServiceFromSchema,
    getServiceName,
} from './procedures';
import { dartMapFromSchema } from './record';
import { dartRefFromSchema } from './ref';

export interface DartClientGeneratorOptions {
    outputFile: string;
    clientName?: string;
    /**
     * Add a prefix to the generated class names
     */
    typePrefix?: string;
    format?: boolean;
    rootService?: string;
}

export const dartClientGenerator = defineGeneratorPlugin(
    (options: DartClientGeneratorOptions) => {
        return {
            options,
            async run(def) {
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
                        execSync(`dart format ${destination}`);
                    }
                } catch (err) {
                    console.error(err);
                }
            },
        };
    },
);

export function createDartClient(
    def: AppDefinition,
    options: DartClientGeneratorOptions,
) {
    const typeParts: string[] = [];
    const context: CodegenContext = {
        clientName: options.clientName ?? 'Client',
        modelPrefix: options.typePrefix ?? '',
        transports: def.transports,
        generatedTypes: [],
        instancePath: '',
        schemaPath: '',
        clientVersion: def.info?.version ?? '',
    };
    const services = unflattenProcedures(def.procedures, options.rootService);
    const subServices: { key: string; name: string }[] = [];
    const subServiceParts: string[] = [];
    const rpcParts: string[] = [];
    for (const key of Object.keys(services)) {
        const subSchema = services[key]!;
        if (isServiceDefinition(subSchema)) {
            const service = dartServiceFromSchema(subSchema, {
                transports: def.transports,
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
                transports: def.transports,
                clientName: context.clientName,
                modelPrefix: context.modelPrefix,
                generatedTypes: context.generatedTypes,
                instancePath: key,
                schemaPath: `procedures.${key}`,
                clientVersion: context.clientVersion,
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
            transports: def.transports,
            clientName: context.clientName,
            modelPrefix: context.modelPrefix,
            generatedTypes: context.generatedTypes,
            clientVersion: context.clientVersion,
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

${typeParts.join('\n\n')}`;
    }
    const clientName = validDartClassName(context.clientName, '');
    return `// this file was autogenerated by arri
// ignore_for_file: type=lint, unused_field, unnecessary_cast
import 'dart:async';
import 'dart:convert';
import 'package:arri_client/arri_client.dart';
import 'package:http/http.dart' as http;
    
class ${clientName} {
  final String _baseUrl;
  final String _wsConnectionUrl;

  final http.Client Function()? _createHttpClient;
  final String? _clientVersion = ${context.clientVersion ? `"${context.clientVersion}"` : 'null'};
  final FutureOr<Map<String, String>> Function()? _headers;
  final OnErrorHook? _onError;
  final int? _retry;
  final Duration? _retryDelay;
  final double? _heartbeatTimeoutMultiplier;
  final Duration? _timeout;
  final String _defaultTransport;
  late final Map<String, Dispatcher> _dispatchers;

  ${clientName}({
    required String baseUrl,
    required String wsConnectionUrl,
    http.Client Function()? createHttpClient,
    FutureOr<Map<String, String>> Function()? headers,
    OnErrorHook? onError,
    int? retry,
    Duration? retryDelay,
    double? heartbeatTimeoutMultiplier,
    Duration? timeout,
    String? defaultTransport,
    Map<String, Dispatcher>? dispatchers,
  }) : 
       _baseUrl = baseUrl,
       _wsConnectionUrl = wsConnectionUrl,
       _createHttpClient = createHttpClient,
       _headers = headers,
       _onError = onError,
       _retry = retry,
       _retryDelay = retryDelay,
       _heartbeatTimeoutMultiplier = heartbeatTimeoutMultiplier,
       _timeout = timeout,
       _defaultTransport = defaultTransport ?? "${context.transports[0]}" {
        _dispatchers = dispatchers ?? {};
        if (_dispatchers["http"] == null) {
            _dispatchers["http"] = HttpDispatcher(
                baseUrl: baseUrl,
                createHttpClient: _createHttpClient,
            );
        }
        if (_dispatchers["ws"] == null) {
            _dispatchers["ws"] = WsDispatcher(
                connectionUrl: _wsConnectionUrl,
                heartbeatTimeoutMultiplier: _heartbeatTimeoutMultiplier,
            );
        }
       
    }
  
  ${rpcParts.join('\n\n')}

${subServices
    .map(
        (service) => `  ${service.name} get ${service.key} => ${service.name}(
          baseUrl: _baseUrl,
          wsConnectionUrl: _wsConnectionUrl,
          headers: _headers,
          createHttpClient: _createHttpClient,
          onError: _onError,
          heartbeatTimeoutMultiplier: _heartbeatTimeoutMultiplier,
          timeout: _timeout,
          dispatchers: _dispatchers,
          defaultTransport: _defaultTransport,
        );`,
    )
    .join('\n\n')}
}

${subServiceParts.join('\n\n')}

${typeParts.join('\n\n')}`;
}

export function dartTypeFromSchema(
    schema: Schema,
    context: CodegenContext,
): DartProperty {
    if (isSchemaFormType(schema)) {
        switch (schema.type) {
            case 'string':
                return dartStringFromSchema(schema, context);
            case 'boolean':
                return dartBoolFromSchema(schema, context);
            case 'timestamp':
                return dartDateTimeFromSchema(schema, context);
            case 'float32':
            case 'float64':
                return dartDoubleFromSchema(schema, context);
            case 'int8':
            case 'uint8':
            case 'int16':
            case 'uint16':
            case 'int32':
            case 'uint32':
                return dartIntFromSchema(schema, context);
            case 'int64':
            case 'uint64':
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
