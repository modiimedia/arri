import { SchemaFormValues } from '@arrirpc/codegen-utils';

import {
    GeneratorContext,
    outputIsOptionType,
    RustProperty,
    validRustIdentifier,
} from './_common';
import { rustTypeFromSchema } from './_index';

export default function rustRecordFromSchema(
    schema: SchemaFormValues,
    context: GeneratorContext,
): RustProperty {
    const innerType = rustTypeFromSchema(schema.values, {
        clientVersion: context.clientVersion,
        clientName: context.clientName,
        typeNamePrefix: context.typeNamePrefix,
        instancePath: `${context.instancePath}/value`,
        schemaPath: `${context.schemaPath}/values`,
        generatedTypes: context.generatedTypes,
        rootService: context.rootService,
    });
    const isOptionType = outputIsOptionType(schema, context);
    const typeName = isOptionType
        ? `Option<BTreeMap<String, ${innerType.finalTypeName}>>`
        : `BTreeMap<String, ${innerType.finalTypeName}>`;
    const defaultValue = isOptionType ? `None` : `BTreeMap::new()`;
    return {
        typeId: typeName,
        finalTypeName: typeName,
        defaultValue,
        isNullable: schema.nullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (isOptionType) {
                return `match ${input} {
                    Some(serde_json::Value::Object(${innerKey})) => {
                        let mut ${innerKey}_result: BTreeMap<String, ${innerType.finalTypeName}> = BTreeMap::new();
                        for (_key_, _value_) in ${innerKey}.into_iter() {
                            ${innerKey}_result.insert(
                                _key_.to_owned(),
                                ${innerType.fromJsonTemplate(`Some(_value_.to_owned())`, `value`)},
                            );
                        }
                        Some(${innerKey}_result)
                    }
                    _ => None,
                }`;
            }
            return `match ${input} {
                Some(serde_json::Value::Object(${innerKey})) => {
                    let mut ${innerKey}_result: BTreeMap<String, ${innerType.finalTypeName}> = BTreeMap::new();
                    for (_key_, _value_) in ${innerKey}.into_iter() {
                        ${innerKey}_result.insert(
                            _key_.to_owned(),
                            ${innerType.fromJsonTemplate(`Some(_value_.to_owned())`, `value`)},
                        );
                    }
                    ${innerKey}_result
                }
                _ => BTreeMap::new(),
            }`;
        },
        toJsonTemplate(input, target) {
            if (innerType.isNullable) {
                return `${target}.push('{');
            for (_index_, (_key_, _value_)) in ${input}.iter().enumerate() {
                if _index_ != 0 {
                    ${target}.push(',');
                }
                ${target}.push_str(format!("{}:", serialize_string(_key_)).as_str());
                match _value_ {
                    Some(value_val) => {
                        ${innerType.toJsonTemplate('value_val', target)};
                    },
                    _ => {
                        ${target}.push_str("null");
                    }
                }
            }
            ${target}.push('}')`;
            }
            return `${target}.push('{');
            for (_index_, (_key_, _value_)) in ${input}.iter().enumerate() {
                if _index_ != 0 {
                    ${target}.push(',');
                }
                ${target}.push_str(format!("{}:", serialize_string(_key_)).as_str());
                ${innerType.toJsonTemplate(`_value_`, target)};
            }
            ${target}.push('}')`;
        },
        toQueryStringTemplate() {
            return `println!("[WARNING] cannot serialize nested objects to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: innerType.content,
    };
}
