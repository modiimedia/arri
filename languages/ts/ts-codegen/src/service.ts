import {
    isRpcDefinition,
    isServiceDefinition,
    pascalCase,
    ServiceDefinition,
} from '@arrirpc/codegen-utils';

import { CodegenContext, validVarName } from './common';
import { tsRpcFromDefinition } from './rpc';

export function tsServiceFromDefinition(
    def: ServiceDefinition,
    context: CodegenContext,
): { key: string; name: string; content: string } {
    const key = getServiceKey(context);
    const serviceName = getServiceName(context);
    const rpcParts: string[] = [];
    const subServices: { key: string; name: string; content: string }[] = [];
    for (const key of Object.keys(def)) {
        const subDef = def[key];
        if (isServiceDefinition(subDef)) {
            const subService = tsServiceFromDefinition(subDef, {
                clientName: context.clientName,
                typePrefix: context.typePrefix,
                generatedTypes: context.generatedTypes,
                instancePath: context.instancePath.length
                    ? `${context.instancePath}.${key}`
                    : key,
                schemaPath: context.schemaPath
                    ? `${context.schemaPath}.${key}`
                    : key,
                discriminatorParent: '',
                discriminatorKey: '',
                discriminatorValue: '',
                versionNumber: context.versionNumber,
                usedFeatures: context.usedFeatures,
                rpcGenerators: context.rpcGenerators,
            });
            if (subService.content) {
                subServices.push(subService);
            }
            continue;
        }
        if (isRpcDefinition(subDef)) {
            const rpc = tsRpcFromDefinition(subDef, {
                clientName: context.clientName,
                typePrefix: context.typePrefix,
                generatedTypes: context.generatedTypes,
                instancePath: context.instancePath.length
                    ? `${context.instancePath}.${key}`
                    : key,
                schemaPath: context.schemaPath
                    ? `${context.schemaPath}.${key}`
                    : key,
                discriminatorParent: '',
                discriminatorKey: '',
                discriminatorValue: '',
                versionNumber: context.versionNumber,
                usedFeatures: context.usedFeatures,
                rpcGenerators: context.rpcGenerators,
            });
            if (rpc) {
                rpcParts.push(rpc);
            }
            continue;
        }
        console.warn(
            `Invalid definition found at procedures.${context.schemaPath}.${key}`,
        );
    }
    if (subServices.length === 0 && rpcParts.length === 0) {
        return {
            key,
            name: serviceName,
            content: '',
        };
    }
    return {
        key,
        name: serviceName,
        content: `export class ${serviceName} {
    private readonly __dispatchers__: Record<string, RpcDispatcher<__TransportOption__>>;
    private readonly __options__: RpcDispatcherOptions;
    private readonly __defaultTransport__: __TransportOption__;
    private readonly __genReqId__: () => string;
${subServices.map((service) => `    ${service.key}: ${service.name};`).join('\n')}
    constructor(config: ${context.clientName}Options) {
        this.__options__ = {
            headers: config.headers,
            onError: config.onError,
            retry: config.retry,
            retryDelay: config.retryDelay,
            retryErrorCodes: config.retryErrorCodes,
            timeout: config.timeout,
        };
        this.__genReqId__ = config.genReqId ?? (() => generateRequestId());
        this.__defaultTransport__ = config.transport ?? 'http';
        if (!config.dispatchers) config.dispatchers = {};
        if (!config.dispatchers['http']) {
            config.dispatchers['http'] = new HttpDispatcher(config);
        }
        if (!config.dispatchers['ws']) {
            config.dispatchers['ws'] = new WsDispatcher(config);
        }
        this.__dispatchers__ = config.dispatchers!
${subServices.map((service) => `        this.${service.key} = new ${service.name}(config);`).join('\n')}
    }

    /**
     * Close all active connections for a specific transport or for all transports.
     */
    terminateConnections(transport?: __TransportOption__) {
        for (const [key, dispatcher] of Object.entries(this.__dispatchers__)) {
            if (transport && transport !== key) continue;
            dispatcher.terminateConnections();
        }
    }

${rpcParts.map((rpc) => `    ${rpc}`).join('\n')}
}

${subServices.map((service) => service.content).join('\n')}`,
    };
}

export function getServiceKey(context: CodegenContext): string {
    const name = context.instancePath.split('.').pop() ?? '';
    return validVarName(name);
}

export function getServiceName(context: CodegenContext): string {
    if (context.instancePath.length === 0) {
        return context.clientName;
    }
    const serviceName = pascalCase(context.instancePath.split('.').join('_'), {
        normalize: true,
    });
    return `${context.clientName}${serviceName}Service`;
}
