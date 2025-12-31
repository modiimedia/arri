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
            on_event: &mut dispatcher::OnEventClosure<'_, ${output ?? 'arri_client::model::EmptyArriClientModel'}>,
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
                ${
                    input && schema.method === 'get'
                        ? `match transport_id.as_str() {
                    "http" => Some(input.to_query_params_string()),
                    _ => None,
                },`
                        : 'None,'
                }
                ${schema.method ? `Some(arri_core::message::HttpMethod::${pascalCase(schema.method)})` : 'None'},
                ${context.clientVersion ? `Some("${context.clientVersion}".to_string())` : 'None'},
                Some(self._content_type.clone()),
                &self._headers,
                ${input && schema.method !== 'get' ? `Some(input.to_json_string().as_bytes().to_vec())` : 'None'},
            );
            self._dispatcher
                .dispatch_output_stream_rpc(
                    call,
                    &mut |evt, controller| match evt {
                        arri_core::stream_event::StreamEvent::Data((content_type, bytes)) => on_event(
                            arri_core::stream_event::StreamEvent::Data(${
                                output
                                    ? `match content_type {
                                arri_core::message::ContentType::Json => ${output}::from_json_string(
                                    String::from_utf8(bytes).unwrap_or("".to_string())
                                )
                            }`
                                    : '()'
                            }),
                            controller,
                        ),
                        arri_core::stream_event::StreamEvent::Error(arri_error) => on_event(
                            arri_core::stream_event::StreamEvent::Error(arri_error),
                            controller,
                        ),
                        arri_core::stream_event::StreamEvent::Start => {
                            on_event(arri_core::stream_event::StreamEvent::Start, controller)
                        }
                        arri_core::stream_event::StreamEvent::End => {
                            on_event(arri_core::stream_event::StreamEvent::End, controller)
                        }
                        arri_core::stream_event::StreamEvent::Cancel => {
                            on_event(arri_core::stream_event::StreamEvent::Cancel, controller)
                        }
                    },
                    controller,
                    None,
                    None,
                )
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
            ${
                input && schema.method === 'get'
                    ? `match transport_id.as_str() {
                    "http" => Some(input.to_query_params_string()),
                    _ => None,
                },`
                    : 'None,'
            }
            ${schema.method ? `Some(arri_core::message::HttpMethod::${pascalCase(schema.method)})` : 'None'},
            ${context.clientVersion ? `Some("${context.clientVersion}".to_string())` : 'None'},
            Some(self._content_type.clone()),
            &self._headers,
            ${input && schema.method !== 'get' ? `Some(input.to_json_string().as_bytes().to_vec())` : `None`},
        );
        let result = self._dispatcher
            .dispatch_rpc(call)
            .await;
        match result {
            Ok((content_type, body)) => match content_type {
                arri_core::message::ContentType::Json => ${
                    output
                        ? `Ok(${output}::from_json_string(
                    String::from_utf8(body).unwrap_or("".to_string()),
                )),`
                        : 'Ok(()),'
                }
            },
            Err(err) => Err(err),
        }
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
                subServiceContent.push(subService.content);
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
