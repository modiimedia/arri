import {
    isSchemaFormElements,
    isSchemaFormValues,
    SchemaFormProperties,
} from '@arrirpc/codegen-utils';

import {
    formatDescriptionComment,
    GeneratorContext,
    getTypeName,
    maybeStr,
    outputIsOptionType,
    RustProperty,
    validRustIdentifier,
} from './_common';
import { rustTypeFromSchema } from './_index';

export default function rustObjectFromSchema(
    schema: SchemaFormProperties,
    context: GeneratorContext,
): RustProperty {
    const isOptionType = outputIsOptionType(schema, context);
    const structName = getTypeName(schema, context);
    const prefixedStructName = `${context.typeNamePrefix}${structName}`;
    const typeName: string = isOptionType
        ? `Option<${prefixedStructName}>`
        : prefixedStructName;
    const defaultValue = isOptionType ? `None` : `${prefixedStructName}::new()`;
    const result: RustProperty = {
        typeId: structName,
        finalTypeName: typeName,
        defaultValue,
        isNullable: schema.isNullable ?? false,
        fromJsonTemplate(input, key) {
            const innerKey = validRustIdentifier(`${key}_val`);
            if (isOptionType) {
                return `match ${input} {
                    Some(${innerKey}) => match ${innerKey} {
                        serde_json::Value::Object(_) => {
                            Some(${prefixedStructName}::from_json(${innerKey}.to_owned()))
                        }
                        _ => None,
                    },
                    _ => None,
                }`;
            }
            return `match ${input} {
                Some(${innerKey}) => ${prefixedStructName}::from_json(${innerKey}.to_owned()),
                _ => ${prefixedStructName}::new(),
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
    if (context.generatedTypes.includes(structName)) {
        return result;
    }
    const fieldNames: string[] = [];
    const fieldDeclarationParts: string[] = [];
    const defaultParts: string[] = [];
    const fromJsonParts: string[] = [];
    const toJsonParts: string[] = [];
    const toQueryParamParams: string[] = [];
    const subContent: string[] = [];
    const requiredKeys = Object.keys(schema.properties);
    const optionalKeys = Object.keys(schema.optionalProperties ?? {});

    const hasKeys = requiredKeys.length > 0;
    for (let i = 0; i < requiredKeys.length; i++) {
        const key = requiredKeys[i]!;
        const prop = schema.properties[key]!;
        const innerType = rustTypeFromSchema(prop, {
            clientVersion: context.clientVersion,
            clientName: context.clientName,
            typeNamePrefix: context.typeNamePrefix,
            instancePath: `/${structName}/${key}`,
            schemaPath: `${context.schemaPath}/properties/${key}`,
            generatedTypes: context.generatedTypes,
            rootService: context.rootService,
        });
        if (innerType.content) {
            subContent.push(innerType.content);
        }
        const fieldName = validRustIdentifier(key);
        fieldNames.push(fieldName);
        let leading = '';
        if (prop.metadata?.description) {
            leading += formatDescriptionComment(prop.metadata.description);
            leading += '\n';
        }
        if (prop.metadata?.isDeprecated) {
            leading += `\t#[deprecated]\n`;
        }
        fieldDeclarationParts.push(
            `${leading}\tpub ${fieldName}: ${innerType.finalTypeName}`,
        );
        defaultParts.push(`\t\t\t${fieldName}: ${innerType.defaultValue}`);
        fromJsonParts.push(
            `\t\t\t\tlet ${fieldName} = ${innerType.fromJsonTemplate(`_val_.get("${key}")`, key)};`,
        );
        if (i === 0) {
            toJsonParts.push(`\t\t_json_output_.push_str("\\"${key}\\":");`);
        } else {
            toJsonParts.push(`\t\t_json_output_.push_str(",\\"${key}\\":");`);
        }
        if (innerType.isNullable) {
            const innerKey = validRustIdentifier(`${key}_val`);
            toJsonParts.push(`\t\tmatch &self.${fieldName} {
                Some(${innerKey}) => {
                    ${innerType.toJsonTemplate(innerKey, '_json_output_')};
                }
                _ => {
                    _json_output_.push_str("null");
                }
            };`);
        } else {
            const leading =
                isSchemaFormElements(prop) || isSchemaFormValues(prop)
                    ? ''
                    : '&';
            toJsonParts.push(
                `\t\t${innerType.toJsonTemplate(`${leading}self.${fieldName}`, '_json_output_')};`,
            );
        }

        toQueryParamParams.push(
            `\t\t${innerType.toQueryStringTemplate(`&self.${fieldName}`, key, '_query_parts_')};`,
        );
    }
    for (let i = 0; i < optionalKeys.length; i++) {
        const key = optionalKeys[i]!;
        const prop = schema.optionalProperties![key]!;
        const innerType = rustTypeFromSchema(prop, {
            clientVersion: context.clientVersion,
            clientName: context.clientName,
            typeNamePrefix: context.typeNamePrefix,
            instancePath: `/${structName}/${key}`,
            schemaPath: `${context.schemaPath}/optionalProperties/${key}`,
            generatedTypes: context.generatedTypes,
            isOptional: true,
            rootService: context.rootService,
        });
        if (innerType.content) {
            subContent.push(innerType.content);
        }
        const fieldName = validRustIdentifier(key);
        fieldNames.push(fieldName);
        let leading = prop.metadata?.description
            ? `${prop.metadata.description
                  .split('\n')
                  .map((line) => `\t/// ${line}`)
                  .join('\n')}\n`
            : '';
        if (prop.metadata?.isDeprecated) {
            leading += `\t#[deprecated]\n`;
        }
        fieldDeclarationParts.push(
            `${leading}\tpub ${fieldName}: ${innerType.finalTypeName}`,
        );
        defaultParts.push(`\t\t\t${fieldName}: ${innerType.defaultValue}`);
        fromJsonParts.push(
            `\t\t\t\tlet ${fieldName} = ${innerType.fromJsonTemplate(`_val_.get("${key}")`, key)};`,
        );

        // NOT CORRECT YET
        if (hasKeys) {
            const innerKey = validRustIdentifier(`${key}_val`);
            toJsonParts.push(`match &self.${fieldName} {
                Some(${innerKey}) => {
                    _json_output_.push_str(",\\"${key}\\":");
                    ${innerType.toJsonTemplate(innerKey, '_json_output_')}
                },
                _ => {}
            };`);
        } else {
            const innerKey = validRustIdentifier(`${key}_val`);
            toJsonParts.push(`\t\tmatch &self.${fieldName} {
                Some(${innerKey}) => {
                    ${
                        i !== 0
                            ? `if _has_keys_ {
                        _json_output_.push(',');
                    }`
                            : ''
                    }
                    _json_output_.push_str("\\"${key}\\":");
                    ${innerType.toJsonTemplate(innerKey, '_json_output_')};
                    ${i !== optionalKeys.length - 1 ? '_has_keys_ = true;' : ''}
                }
                _ => {}
            };`);
        }
        toQueryParamParams.push(
            `\t\t\t\t${innerType.toQueryStringTemplate(`&self.${fieldName}`, key, '_query_parts_')};`,
        );
    }
    context.generatedTypes.push(structName);
    let selfDeclaration = `Self {
        ${fieldNames.join(',\n\t\t\t\t')},
    }`;
    if (fieldNames.length < 4) {
        selfDeclaration = `Self { ${fieldNames.join(', ')} }`;
    }
    let leading = '';
    if (schema.metadata?.description) {
        leading += `${schema.metadata.description
            .split('\n')
            .map((line) => `/// ${line}`)
            .join('\n')}\n`;
    }
    if (schema.metadata?.isDeprecated) {
        leading += `#[deprecated]\n`;
    }
    const hasProperties = fieldDeclarationParts.length > 0;
    result.content = `${leading}#[derive(Clone, Debug, PartialEq)]
pub struct ${prefixedStructName} {
${fieldDeclarationParts.join(',\n')}${maybeStr(hasProperties, ',')}
}

impl arri_client::model::ArriClientModel for ${prefixedStructName} {
    fn new() -> Self {
        Self {
${defaultParts.join(',\n')}${maybeStr(hasProperties, ',')}
        }
    }
    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(_val_) => {
${fromJsonParts.join('\n')}
                ${selfDeclaration}
            }
            _ => Self::new(),
        }
    }
    fn from_json_string(input: String) -> Self {
        match serde_json::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }   
    }
    fn to_json_string(&self) -> String {
        let mut _json_output_ = "{".to_string();
        ${!hasKeys ? `let mut _has_keys_ = false;` : ''}
${toJsonParts.join('\n')}
        _json_output_.push('}');
        _json_output_
    }
    fn to_query_params_string(&self) -> String {
        let mut _query_parts_: Vec<String> = Vec::new();
${toQueryParamParams.join('\n')}
        _query_parts_.join("&")
    }
}

${subContent.join('\n\n')}`;
    return result;
}
