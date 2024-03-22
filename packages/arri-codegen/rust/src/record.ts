import { type SchemaFormValues } from "arri-codegen-utils";
import {
    type RustProperty,
    type GeneratorContext,
    isOptionType,
    maybeOption,
    maybeNone,
    validRustKey,
    maybeSome,
} from "./common";
import { rustTypeFromSchema } from ".";

export function rustHashMapFromSchema(
    schema: SchemaFormValues,
    context: GeneratorContext,
): RustProperty {
    const isOption = isOptionType(schema, context);
    const subType = rustTypeFromSchema(schema.values, {
        parentIds: context.parentIds,
        clientName: context.clientName,
        generatedTypes: context.generatedTypes,
        instancePath: `${context.instancePath}/[k]`,
        schemaPath: `${context.schemaPath}/values`,
        parentId: context.parentId,
    });
    const typeName = `HashMap<String, ${subType.fieldTemplate}>`;
    const fieldTemplate = maybeOption(typeName, isOption);
    const defaultTemplate = maybeNone(`HashMap::new()`, isOption);

    return {
        fieldTemplate,
        defaultTemplate,
        fromJsonTemplate: (val, key, valIsOption) => {
            const rustKey = validRustKey(key);
            if (isOption) {
                return `match ${val} {
                    Some(serde_json::Value::Object(${rustKey}_val)) => {
                        let mut ${rustKey}_result: ${typeName} = HashMap::new();
                        for (${rustKey}_key, ${rustKey}_key_val) in ${rustKey}_val {
                            ${rustKey}_result.insert(
                                ${rustKey}_key.to_owned(),
                                ${subType.fromJsonTemplate(`${rustKey}_key_val`, `${rustKey}_key_val`, false)},
                            );
                        }
                        Some(${rustKey}_result)
                    },
                    _ => None,
                }`;
            }
            return `match ${val} {
                ${maybeSome(`serde_json::Value::Object(${rustKey}_val)`, valIsOption)} => {
                    let mut ${rustKey}_result: ${typeName} = HashMap::new();
                    for (${rustKey}_key, ${rustKey}_key_val) in ${rustKey}_val {
                        ${rustKey}_result.insert(
                            ${rustKey}_key.to_owned(),
                            ${subType.fromJsonTemplate(`${rustKey}_key_val`, `${rustKey}_key_val`, false)},
                        );
                    }
                    ${rustKey}_result
                },
                _ => HashMap::new(),
            }`;
        },
        toJsonTemplate: (target, val, key) => {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => {
                        ${target}.push('{');
                        let mut ${rustKey}_val_index = 0;
                        for (${rustKey}_val_key, ${rustKey}_val_val) in ${rustKey}_val {
                            if ${rustKey}_val_index != 0 {
                                ${target}.push(',');
                            }
                            ${target}.push_str(format!("\\"{}\\":", ${rustKey}_val_key).as_str());
                            ${subType.toJsonTemplate(target, `${rustKey}_val_val`, rustKey)};
                            ${rustKey}_val_index += 1;
                        }
                        ${target}.push('}');
                    },
                    _ => ${target}.push_str("null"),
                }`;
            }
            return `${target}.push('{');
                let mut ${rustKey}_index = 0;
                for (${rustKey}_key, ${rustKey}_val) in ${val} {
                    if ${rustKey}_index != 0 {
                        ${target}.push(',');
                    }
                    ${target}.push_str(format!("\\"{}\\":", ${rustKey}_key).as_str());
                    ${subType.toJsonTemplate(target, `${rustKey}_val`, rustKey)};
                    ${rustKey}_index += 1;
                }
                ${target}.push('}')`;
        },
        toQueryTemplate: (target, val, key) => {
            return `println!("Error at ${context.instancePath}. Nested objects cannot be serialized to query params.")`;
        },
        content: subType.content,
    };
}
