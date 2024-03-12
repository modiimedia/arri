import { type SchemaFormElements } from "arri-codegen-utils";
import {
    maybeOption,
    type GeneratorContext,
    isOptionType,
    maybeNone,
    type RustProperty,
    validRustKey,
} from "./common";
import { rustTypeFromSchema } from ".";

export function rustVecFromSchema(
    schema: SchemaFormElements,
    context: GeneratorContext,
): RustProperty {
    const innerProp = rustTypeFromSchema(schema.elements, {
        clientName: context.clientName,
        generatedTypes: context.generatedTypes,
        instancePath: `${context.instancePath}/[i]`,
        schemaPath: `${context.schemaPath}/elements`,
        parentId: context.parentId,
    });
    const isOption = isOptionType(schema, context);
    const fieldTemplate = maybeOption(
        `Vec<${innerProp.fieldTemplate}>`,
        isOption,
    );
    const defaultTemplate = maybeNone(`Vec::new()`, isOption);
    return {
        fieldTemplate,
        defaultTemplate,
        fromJsonTemplate: (val, key) => {
            const rustKey = validRustKey(key);
            if (isOption) {
                return `match ${val} {
                    Some(serde_json::Value::Array(${rustKey}_val)) => {
                        let mut ${rustKey}_val_result: Vec<${innerProp.fieldTemplate}> = Vec::new();
                        for ${rustKey}_val_item in ${rustKey}_val {
                            ${rustKey}_val_result.push(${innerProp.fromJsonTemplate(`Some(${rustKey}_val_item)`, `${rustKey}_val_item`)});
                        }
                        Some(${rustKey}_val_result)
                    },
                    _ => None,
                }`;
            }
            return `match ${val} {
                Some(serde_json::Value::Array(${rustKey}_val)) => {
                    let mut ${rustKey}_val_result: Vec<${innerProp.fieldTemplate}> = Vec::new();
                    for ${rustKey}_val_item in ${rustKey}_val {
                        ${rustKey}_val_result.push(${innerProp.fromJsonTemplate(`Some(${rustKey}_val_item)`, `${rustKey}_val_item`)})
                    }
                    ${rustKey}_val_result
                },
                _ => Vec::new(),
            }`;
        },
        toJsonTemplate: (target, val, key) => {
            const rustKey = validRustKey(key);
            const baseKey = isOption ? `${rustKey}_val` : rustKey;
            if (schema.nullable) {
                return `match ${val} {
                    Some(${baseKey}) => {
                        ${target}.push('[');
                        let mut ${baseKey}_index = 0;
                        for ${baseKey}_item in ${baseKey} {
                            if ${baseKey}_index != 0 {
                                ${target}.push(',');
                            }
                            ${innerProp.toJsonTemplate(target, `${baseKey}_item`, `${baseKey}_item`)};
                            ${baseKey}_index += 1;
                        }
                        ${target}.push(']');
                    },
                    _ => ${target}.push_str("null"),
                }`;
            }
            return `${target}.push('[');
            let mut ${baseKey}_index = 0;
            for ${baseKey}_item in ${val} {
                if ${baseKey}_index != 0 {
                    ${target}.push(',');
                }
                ${innerProp.toJsonTemplate(target, `${baseKey}_item`, `${baseKey}_item`)};
                ${baseKey}_index += 1;
            }
            ${target}.push(']')`;
        },
        toQueryTemplate: (target, val, key) => {
            const rustKey = validRustKey(key);
            const baseKey = isOption ? `${rustKey}_val` : rustKey;
            if (schema.nullable) {
                return `match ${val} {
                    Some(${baseKey}) => {
                        let mut ${baseKey}_output = "${key}=[".to_string();
                        let mut ${baseKey}_index = 0;
                        for ${baseKey}_item in ${baseKey} {
                            if ${baseKey}_index != 0 {
                                ${baseKey}_output.push(',');
                            }
                            ${innerProp.toJsonTemplate(`${baseKey}_output`, `${baseKey}_item`, `${baseKey}_item`)};
                            ${baseKey}_index += 1;
                        }
                        ${target}.push(format!("${key}={}", ${baseKey}_output));
                    },
                    _ => ${target}.push("${key}=null".to_string())
                }`;
            }
            return `let mut ${baseKey}_output = "${key}=[".to_string();
            let mut ${baseKey}_index = 0;
            for ${baseKey}_item in ${val} {
                if ${baseKey}_index != 0 {
                    ${baseKey}_output.push(',');
                }
                ${innerProp.toJsonTemplate(`${baseKey}_output`, `${baseKey}_item`, `${baseKey}_item`)};
                ${baseKey}_index += 1;
            }
            ${target}.push(format!("${key}={}", ${baseKey}_output));`;
        },
        content: innerProp.content,
    };
}
