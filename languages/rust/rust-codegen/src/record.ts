import { SchemaFormValues } from "@arrirpc/codegen-utils";

import {
    GeneratorContext,
    outputIsOptionType,
    RustProperty,
    validRustIdentifier,
} from "./_common";
import { rustTypeFromSchema } from "./_index";

export default function rustRecordFromSchema(
    schema: SchemaFormValues,
    context: GeneratorContext,
): RustProperty {
    const innerType = rustTypeFromSchema(schema.values, {
        clientName: context.clientName,
        typeNamePrefix: context.typeNamePrefix,
        instancePath: `${context.instancePath}/value`,
        schemaPath: `${context.schemaPath}/values`,
        generatedTypes: context.generatedTypes,
        parentTypeNames: context.parentTypeNames,
    });
    const isOptionType = outputIsOptionType(schema, context);
    const typeName = isOptionType
        ? `Option<BTreeMap<String, ${innerType.typeName}>>`
        : `BTreeMap<String, ${innerType.typeName}>`;
    const defaultValue = isOptionType ? `None` : `BTreeMap::new()`;
    return {
        typeName,
        defaultValue,
        isNullable: schema.nullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (isOptionType) {
                return `match ${input} {
                    Some(serde_json::Value::Object(${innerKey})) => {
                        let mut ${innerKey}_result: BTreeMap<String, ${innerType.typeName}> = BTreeMap::new();
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
                    let mut ${innerKey}_result: BTreeMap<String, ${innerType.typeName}> = BTreeMap::new();
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
            return `${target}.push('{');
            for (_index_, (_key_, _value_)) in ${input}.iter().enumerate() {
                if _index_ != 0 {
                    ${target}.push(',');
                }
                ${target}.push_str(format!("\\"{}\\":", _key_).as_str());
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
