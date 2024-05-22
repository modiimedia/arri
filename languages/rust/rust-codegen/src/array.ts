import { SchemaFormElements } from "@arrirpc/codegen-utils";

import {
    GeneratorContext,
    outputIsOptionType,
    RustProperty,
    validRustIdentifier,
} from "./_common";
import { rustTypeFromSchema } from "./_index";

export default function rustArrayFromSchema(
    schema: SchemaFormElements,
    context: GeneratorContext,
): RustProperty {
    const innerType = rustTypeFromSchema(schema.elements, {
        instancePath: `${context.instancePath}/element`,
        schemaPath: `${context.schemaPath}/elements`,
        clientName: context.clientName,
        typeNamePrefix: context.typeNamePrefix,
        generatedTypes: context.generatedTypes,
    });
    const isOptionType = outputIsOptionType(schema, context);
    const typeName = isOptionType
        ? `Option<Vec<${innerType.typeName}>>`
        : `Vec<${innerType.typeName}>`;
    const defaultValue = isOptionType ? `None` : `Vec::new()`;
    return {
        typeName,
        defaultValue,
        isNullable: schema.nullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (isOptionType) {
                return `match ${input} {
                    Some(serde_json::Value::Array(${innerKey})) => {
                        let mut ${innerKey}_result: Vec<${innerType.typeName}> = Vec::new();
                        for ${innerKey}_element in ${innerKey} {
                            ${innerKey}_result.push(${innerType.fromJsonTemplate(`Some(${innerKey}_element)`, `${innerKey}_element`)});
                        }
                        Some(${innerKey}_result)
                    }
                    _ => None,
                }`;
            }
            return `match ${input} {
                Some(serde_json::Value::Array(${innerKey})) => {
                    let mut ${innerKey}_result: Vec<${innerType.typeName}> = Vec::new();
                    for ${innerKey}_element in ${innerKey} {
                        ${innerKey}_result.push(${innerType.fromJsonTemplate(`Some(${innerKey}_element)`, `${innerKey}_element`)});
                    }
                    ${innerKey}_result
                }
                _ => Vec::new(),
            }`;
        },
        toJsonTemplate(input, target) {
            let innerTypeToJson = innerType.toJsonTemplate(`_element_`, target);
            if (innerType.isNullable) {
                innerTypeToJson = `match _element_ {
                    Some(_element_val_) => {
                        ${innerType.toJsonTemplate(`_element_val_`, target)};
                    },
                    _ => {
                        ${target}.push_str("null");
                    }
                }`;
            }
            return `${target}.push('[');
            for (_index_, _element_) in ${input}.iter().enumerate() {
                if _index_ != 0 {
                    ${target}.push(',');
                }
                ${innerTypeToJson};
            }
            ${target}.push(']')`;
        },
        toQueryStringTemplate() {
            return `println!("[WARNING] cannot serialize arrays to query params. Skipping field at ${context.instancePath}")`;
        },
        content: innerType.content,
    };
}
