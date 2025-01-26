import { SchemaFormEnum } from '@arrirpc/codegen-utils';

import {
    formatDescriptionComment,
    GeneratorContext,
    getTypeName,
    outputIsOptionType,
    RustProperty,
    validRustIdentifier,
    validRustName,
} from './_common';

export default function rustEnumFromSchema(
    schema: SchemaFormEnum,
    context: GeneratorContext,
): RustProperty {
    const enumName = getTypeName(schema, context);
    const prefixedEnumName = `${context.typeNamePrefix}${enumName}`;
    const isOptionType = outputIsOptionType(schema, context);
    const typeName = isOptionType
        ? `Option<${prefixedEnumName}>`
        : prefixedEnumName;
    const defaultValue = isOptionType
        ? 'None'
        : `${prefixedEnumName}::default()`;
    const result: RustProperty = {
        typeId: enumName,
        finalTypeName: typeName,
        defaultValue,
        isNullable: schema.nullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (isOptionType) {
                return `match ${input} {
                    Some(serde_json::Value::String(${innerKey})) => {
                        Some(${prefixedEnumName}::from_string(${innerKey}.to_owned()))
                    }
                    _ => None, 
                }`;
            }
            return `match ${input} {
                Some(serde_json::Value::String(${innerKey})) => {
                    ${prefixedEnumName}::from_string(${innerKey}.to_owned())
                }
                _ => ${prefixedEnumName}::default(),
            }`;
        },
        toJsonTemplate(input, target) {
            return `${target}.push_str(format!("\\"{}\\"", ${input}.serial_value()).as_str())`;
        },
        toQueryStringTemplate(input, key, target) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (context.isOptional) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(format!("${key}={}", ${innerKey}.serial_value()));
                    }
                    _ => {}
                }`;
            }
            if (schema.nullable) {
                return `match ${input} {
                    Some(${innerKey}) => {
                        ${target}.push(format!("${key}={}", ${innerKey}.serial_value()));
                    }
                    _ => {
                        ${target}.push("${key}=null".to_string());
                    }
                }`;
            }
            return `${target}.push(format!("${key}={}", ${input}.serial_value()))`;
        },
        content: '',
    };
    if (context.generatedTypes.includes(enumName)) {
        return result;
    }
    let defaultEnumValue: string = '';
    const initializationParts: string[] = [];
    const fromStringParts: string[] = [];
    const serialValueParts: string[] = [];
    for (let i = 0; i < schema.enum.length; i++) {
        const val = schema.enum[i]!;
        const valName = validRustName(val);
        if (i === 0) {
            defaultEnumValue = valName;
        }
        initializationParts.push(`\t${valName},`);
        fromStringParts.push(`\t\t\t"${val}" => Self::${valName},`);
        serialValueParts.push(
            `\t\t\t${prefixedEnumName}::${valName} => "${val}".to_string(),`,
        );
    }
    let leading = '';
    if (schema.metadata?.description) {
        leading += `${formatDescriptionComment(schema.metadata.description)}\n`;
    }
    if (schema.metadata?.isDeprecated) {
        leading += `#[deprecated]\n`;
    }
    result.content = `${leading}#[derive(Clone, Debug, PartialEq)]
pub enum ${prefixedEnumName} {
${initializationParts.join('\n')}
}

impl ArriEnum for ${prefixedEnumName} {
    fn default() -> Self {
        ${prefixedEnumName}::${defaultEnumValue}
    }
    fn from_string(input: String) -> Self {
        match input.as_str() {
${fromStringParts.join('\n')}
            _ => Self::default(),
        }
    }
    fn serial_value(&self) -> String {
        match &self {
${serialValueParts.join('\n')}
        }
    }
}`;
    context.generatedTypes.push(enumName);
    return result;
}
