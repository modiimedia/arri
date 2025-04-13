import { SchemaFormRef } from '@arrirpc/codegen-utils';

import {
    GeneratorContext,
    outputIsOptionType,
    RustProperty,
    validRustIdentifier,
    validRustName,
} from './_common';

export default function rustRefFromSchema(
    schema: SchemaFormRef,
    context: GeneratorContext,
): RustProperty {
    const innerTypeName = validRustName(schema.ref);
    const prefixedInnerTypeName = `${context.typeNamePrefix}${innerTypeName}`;
    const isOptionType = outputIsOptionType(schema, context);
    const needsBoxing = true;
    let typeName = `Box<${prefixedInnerTypeName}>`;
    if (isOptionType) {
        typeName = `Option<${typeName}>`;
    }
    let defaultValue: string;
    if (isOptionType) {
        defaultValue = 'None';
    } else if (needsBoxing) {
        defaultValue = `Box::new(${prefixedInnerTypeName}::new())`;
    } else {
        defaultValue = `${prefixedInnerTypeName}::new()`;
    }
    return {
        typeId: typeName,
        finalTypeName: typeName,
        defaultValue,
        isNullable: schema.isNullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            const valFromJson = (input: string) => {
                if (needsBoxing) {
                    return `Box::new(${prefixedInnerTypeName}::from_json(${input}.to_owned()))`;
                }
                return `${prefixedInnerTypeName}::from_json(${input}.to_owned())`;
            };
            if (isOptionType) {
                return `match ${input} {
                    Some(${innerKey}) => match ${innerKey} {
                        serde_json::Value::Object(_) => {
                            Some(${valFromJson(innerKey)})
                        }
                        _ => None,
                    },
                    _ => None,
                }`;
            }
            return `match ${input} {
                Some(${innerKey}) => match ${innerKey} {
                    serde_json::Value::Object(_) => {
                        ${valFromJson(innerKey)}
                    }
                    _ => ${valFromJson(innerKey)},
                },
                _ => Box::new(${prefixedInnerTypeName}::new()),
            }`;
        },
        toJsonTemplate(input, target) {
            return `${target}.push_str(${input}.to_json_string().as_str())`;
        },
        toQueryStringTemplate() {
            return `println!("[WARNING] cannot serialize nested objects to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: '',
    };
}
