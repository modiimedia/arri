import {
    isRpcDefinition,
    isServiceDefinition,
    pascalCase,
    RpcDefinition,
    ServiceDefinition,
} from '@arrirpc/codegen-utils';
import assert from 'assert';

import {
    formatDescriptionComment,
    GeneratorContext,
    validRustIdentifier,
    validRustName,
} from './_common';

export function rustRpcFromSchema(
    schema: RpcDefinition,
    context: GeneratorContext,
): string {
    const functionName = getFunctionName(context.instancePath);
    let leading = '';
    if (schema.description) {
        leading += formatDescriptionComment(schema.description);
        leading += '\n';
    }
    if (schema.isDeprecated) {
        leading += '#[deprecated]\n';
    }
    const input = schema.input
        ? context.typeNamePrefix + validRustName(schema.input)
        : undefined;
    const output = schema.output
        ? context.typeNamePrefix + validRustName(schema.output)
        : undefined;

    if (schema.outputIsStream) {
        return `${leading}pub async fn ${functionName}(
            &self,
            ${input ? `input: ${input},` : ''}
            on_event: &mut OnEventClosure<'_, ${output ?? 'arri_client::model::EmptyArriClientModel'}>,
            controller: Option<&mut arri_client::dispatcher::EventStreamController>,
            max_retry_count: Option<u64>,
            max_retry_interval: Option<u64>,
        ) -> Result<(), arri_core::errors::ArriError> {
            let available_transports = vec![${schema.transports.map((val) => `"${val}"`).join(', ')}];
            let transport_id = self._dispatcher.transport_id();
            if !available_transports.contains(&transport_id.clone().as_str()) {
                return Err(arri_core::errors::ArriError::new(
                    0,
                    format!("${context.instancePath} doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                    None,
                    None,
                ));
            }
            let call = arri_client::rpc_call::RpcCall::new(
                "${context.instancePath}".to_string(),
                "${schema.path}".to_string(),
                ${schema.method ? `Some(arri_core::message::HttpMethod::${pascalCase(schema.method)})` : 'None'},
                ${context.clientVersion ? `Some("${context.clientVersion}".to_string())` : 'None'},
                Some(self._content_type.clone()),
                &self._headers,
                ${input ? `Some(input)` : 'None::<arri_client::model::EmptyArriClientModel>'},
            );
            self._dispatcher
                .dispatch_output_stream_rpc::<${input ?? 'arri_client::model::EmptyArriClientModel'}, ${output ?? 'arri_client::model::EmptyArriClientModel'}>(call, on_event, controller, None, None)
                .await;
            Ok(())
        }`;
    }
    return `${leading}pub async fn ${functionName}(
        &self,
        ${input ? `input: ${input},` : ''}
    ) -> Result<${output ?? '()'}, arri_core::errors::ArriError> {
        let available_transports = vec![${schema.transports.map((val) => `"${val}"`).join(', ')}];
        let transport_id = self._dispatcher.transport_id();
        if !available_transports.contains(&transport_id.clone().as_str()) {
            return Err(arri_core::errors::ArriError::new(
                0,
                format!("${context.instancePath} doesn't support {}. You must call this procedure using a client initialized with a dispatcher for one of the following transports {:?}.", transport_id, available_transports),
                None,
                None,
            ));
        }
        let call = arri_client::rpc_call::RpcCall::new(
            "${context.instancePath}".to_string(),
            "${schema.path}".to_string(),
            ${schema.method ? `Some(arri_core::message::HttpMethod::${pascalCase(schema.method)})` : 'None'},
            ${context.clientVersion ? `Some("${context.clientVersion}".to_string())` : 'None'},
            Some(self._content_type.clone()),
            &self._headers,
            ${input ? `Some(input)` : `None::<arri_client::model::EmptyArriClientModel>`},
        );
        ${!output ? `let result = ` : ''}self._dispatcher
            .dispatch_rpc::<${input ?? 'arri_client::model::EmptyArriClientModel'}, ${output ?? 'arri_client::model::EmptyArriClientModel'}>(call)
            .await${!output ? ';\nmatch result {\nOk(_) => Ok(()),\nErr(err) => Err(err),\n}' : ''}
    }`;
}

export function getFunctionName(instancePath: string): string {
    assert(instancePath.length > 0);
    const name = instancePath.split('.').pop() ?? '';
    return validRustIdentifier(name);
}

export function getServiceName(
    instancePath: string,
    context: GeneratorContext,
): string {
    assert(instancePath.length > 0);
    const name = instancePath.split('.').join('_');
    return validRustName(`${context.clientName}_${name}_Service`);
}

export function rustServiceFromSchema(
    schema: ServiceDefinition,
    context: GeneratorContext,
): { name: string; content: string } {
    const serviceName = getServiceName(context.instancePath, context);
    const subServices: { key: string; name: string }[] = [];
    const subServiceContent: string[] = [];
    const rpcParts: string[] = [];
    for (const key of Object.keys(schema)) {
        const subSchema = schema[key]!;
        if (isServiceDefinition(subSchema)) {
            const subService = rustServiceFromSchema(subSchema, {
                clientVersion: context.clientVersion,
                clientName: context.clientName,
                typeNamePrefix: context.typeNamePrefix,
                instancePath: `${context.instancePath}.${key}`,
                schemaPath: `${context.schemaPath}.${key}`,
                generatedTypes: context.generatedTypes,
                rootService: context.rootService,
            });
            if (subService.content) {
                subServices.push({
                    key: validRustIdentifier(key),
                    name: subService.name,
                });
            }
            continue;
        }
        if (isRpcDefinition(subSchema)) {
            const rpc = rustRpcFromSchema(subSchema, {
                clientVersion: context.clientVersion,
                clientName: context.clientName,
                typeNamePrefix: context.typeNamePrefix,
                instancePath: `${context.instancePath}.${key}`,
                schemaPath: `${context.schemaPath}.${key}`,
                generatedTypes: context.generatedTypes,
                rootService: context.rootService,
            });
            if (rpc) {
                rpcParts.push(rpc);
            }
            continue;
        }
        throw new Error(
            `[rust-codegen] Invalid schema at /procedures/${context.instancePath}.`,
        );
    }
    const paramSuffix = subServices.length > 0 ? '.clone()' : '';
    return {
        name: serviceName,
        content: `#[derive(Clone)]
pub struct ${serviceName}<TDispatcher: arri_client::dispatcher::TransportDispatcher> {
    _headers: std::sync::Arc<std::sync::RwLock<arri_core::headers::SharableHeaderMap>>,
    _dispatcher: TDispatcher,
    _content_type: arri_core::message::ContentType,

    ${subServices.map((service) => `    pub ${service.key}: ${service.name}<TDispatcher>,`).join('\n')}
}

impl<TDispatcher: arri_client::dispatcher::TransportDispatcher>
    arri_client::ArriClientService<TDispatcher> for ${serviceName}<TDispatcher>
{
    fn create(config: arri_client::ArriClientConfig<TDispatcher>) -> Self {
        Self {
            _headers: std::sync::Arc::new(std::sync::RwLock::new(config.headers.clone())),
            _dispatcher: config.dispatcher.clone(),
            _content_type: config.content_type.clone(),
${subServices.map((service, index) => `            ${service.key}: ${service.name}::create(config${index === subServices.length - 1 ? '' : '.clone()'}),`).join('\n')}
        }
    }
    fn update_headers(&self, headers: arri_core::headers::SharableHeaderMap) {
        let mut unwrapped_headers = self._headers.write().unwrap();
        *unwrapped_headers = headers.clone();
${subServices.map((service, index) => `        self.${service.key}.update_headers(headers${index === subServices.length - 1 ? '' : '.clone()'});`).join('\n')}
    }
}

impl<TDispatcher: arri_client::dispatcher::TransportDispatcher> ${serviceName}<TDispatcher> {
${rpcParts.join('\n')}
}

${subServiceContent.join('\n\n')}
`,
    };
}
