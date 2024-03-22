import {
    type SchemaFormProperties,
    type SchemaFormDiscriminator,
    pascalCase,
} from "arri-codegen-utils";
import {
    getTypeName,
    type GeneratorContext,
    type RustProperty,
    isOptionType,
    validRustKey,
    maybeOption,
    maybeNone,
} from "./common";
import { rustTypeFromSchema } from ".";

export function rustTaggedUnionFromSchema(
    schema: SchemaFormDiscriminator,
    context: GeneratorContext,
): RustProperty {
    const enumName = getTypeName(schema, context);
    if (context.instancePath === "") {
        context.rootTypeName = enumName;
    }
    const isOption = isOptionType(schema, context);
    const fieldParts: string[] = [];
    const fromJsonMatchArms: string[] = [];
    const toJsonMatchArms: string[] = [];
    const toQueryStringMatchArms: string[] = [];
    const defaultParts: string[] = [];
    const subContentParts: string[] = [];
    for (const key of Object.keys(schema.mapping)) {
        const subType = taggedUnionSubType(
            schema.discriminator,
            key,
            isOption,
            schema.nullable ?? false,
            schema.mapping[key],
            {
                ...context,
                rootTypeName: enumName,
                parentId: enumName,
                schemaPath: `${context.schemaPath}/mapping/${key}`,
            },
        );
        fieldParts.push(subType.fieldTemplate);
        fromJsonMatchArms.push(subType.fromJsonMatchArm);
        toJsonMatchArms.push(subType.toJsonMatchArm);
        toQueryStringMatchArms.push(subType.toQueryParamsMatchArm);
        defaultParts.push(subType.defaultTemplate);
        subContentParts.push(subType.content);
    }
    const discriminatorKey = validRustKey(schema.discriminator);
    const defaultVal = isOption ? `None` : `Self::new()`;
    let content = `#[derive(Debug, PartialEq, Clone)]
enum ${enumName} {
    ${fieldParts.join(",\n")},
}

impl ArriModel for ${enumName} {
    fn new() -> Self {
        ${defaultParts[0]}
    }

    fn from_json(input: serde_json::Value) -> Self {
        match input {
            serde_json::Value::Object(val) => match val.get("${schema.discriminator}") {
                Some(serde_json::Value::String(${discriminatorKey}_val)) => match ${discriminatorKey}_val.as_str() {
                    ${fromJsonMatchArms.join(",\n")},
                    _ => ${defaultVal},
                },
                _ => ${defaultVal},
            },
            _ => ${defaultVal},
        }
    }

    fn from_json_string(input: String) -> Self {
        match serde_json::from_str(input.as_str()) {
            Ok(val) => Self::from_json(val),
            _ => Self::new(),
        }
    }

    fn to_json_string(&self) -> String {
        match &self {
            ${toJsonMatchArms.join(",\n")},
        }
    }

    fn to_query_params_string(&self) -> String {
        match &self {
            ${toQueryStringMatchArms.join(",\n")}
        }
    }
}

${subContentParts.join("\n")}
`;

    if (context.generatedTypes.includes(enumName)) {
        content = "";
    } else {
        context.generatedTypes.push(enumName);
    }

    return {
        fieldTemplate: maybeOption(enumName, isOption),
        defaultTemplate: maybeNone(`${enumName}::new()`, isOption),
        toJsonTemplate(target, val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${target}.push_str(${rustKey}_val.to_json_string().as_str()),
                    _ => ${target}.push_str("null"),
                }`;
            }
            return `${target}.push_str(${val}.to_json_string().as_str())`;
        },
        fromJsonTemplate(val, key, valIsOption) {
            const rustKey = validRustKey(key);
            if (isOption) {
                return `match ${val} {
                    Some(${rustKey}_val) => match ${rustKey}_val {
                        serde_json::Value::Object(_) => Some(${enumName}::from_json(${rustKey}_val.to_owned())),
                        _ => None,
                    },
                    _ => None,
                }`;
            }
            if (valIsOption) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${enumName}::from_json(${rustKey}_val.to_owned()),
                    _ => ${enumName}::new(),
                }`;
            }
            return `${enumName}::from_json(${val}.to_owned())`;
        },
        toQueryTemplate(target, val, key) {
            const rustKey = validRustKey(key);
            if (schema.nullable) {
                return `${target}.push(format!("${key}={}", match ${val} {
                    Some(${rustKey}_val) => ${rustKey}_val.to_query_params_string(),
                    _ => "null".to_string(),
                }))`;
            }
            return `${target}.push(format!("${key}={}", ${val}.to_query_params_string()))`;
        },
        content,
    };
}

function taggedUnionSubType(
    discriminatorKey: string,
    discriminatorValue: string,
    isOption: boolean,
    isNullable: boolean,
    schema: SchemaFormProperties,
    context: GeneratorContext,
) {
    const enumName = pascalCase(discriminatorValue, { normalize: true });
    const subTypeName = `${context.parentId}${enumName}`;
    const keyParts: string[] = [];
    const subContentParts: string[] = [];
    const fieldParts: string[] = [];
    const defaultParts: string[] = [];
    const fromJsonParts: string[] = [];
    const toJsonParts: string[] = [];
    const toQueryParts: string[] = [];
    for (const key of Object.keys(schema.properties)) {
        const rustKey = validRustKey(key);
        keyParts.push(rustKey);
        const prop = rustTypeFromSchema(schema.properties[key], {
            ...context,
            parentId: subTypeName,
            instancePath: `${context.instancePath}/${key}`,
            schemaPath: `${context.schemaPath}/properties/${key}`,
            isOptional: false,
        });
        if (prop.content) {
            subContentParts.push(prop.content);
        }
        fieldParts.push(`    ${rustKey}: ${prop.fieldTemplate}`);
        defaultParts.push(`   ${rustKey}: ${prop.defaultTemplate}`);
        fromJsonParts.push(
            `let ${rustKey} = ${prop.fromJsonTemplate(`val.get("${key}")`, key, true)}`,
        );
        toJsonParts.push(`_json_output_.push_str(",\\"${key}\\":")`);
        toJsonParts.push(prop.toJsonTemplate(`_json_output_`, rustKey, key));
        toQueryParts.push(prop.toQueryTemplate(`_query_parts_`, rustKey, key));
    }
    if (schema.optionalProperties) {
        for (const key of Object.keys(schema.optionalProperties)) {
            const rustKey = validRustKey(key);
            keyParts.push(rustKey);
            const prop = rustTypeFromSchema(schema.optionalProperties[key], {
                ...context,
                parentId: subTypeName,
                instancePath: `${context.instancePath}/${key}`,
                schemaPath: `${context.schemaPath}/optionalProperties/${key}`,
                isOptional: true,
            });
            if (prop.content) {
                subContentParts.push(prop.content);
            }
            fieldParts.push(`    ${rustKey}: ${prop.fieldTemplate}`);
            defaultParts.push(`        ${rustKey}: None`);
            fromJsonParts.push(
                `let ${rustKey} = ${prop.fromJsonTemplate(`val.get("${key}")`, key, true)};`,
            );
            toJsonParts.push(`match ${rustKey} {
                    Some(${rustKey}_val) => {
                        _json_output_.push_str(",\\"${key}\\":");
                        ${prop.toJsonTemplate(`_json_output_`, `${rustKey}_val`, key)};
                    },
                    _ => {},
                }`);
            toQueryParts.push(`match ${rustKey} {
                Some(${rustKey}_val) => {
                    ${prop.toQueryTemplate("_query_parts_", `${rustKey}_val`, key)};
                },
                _ => {},
            };`);
        }
    }
    return {
        fieldTemplate: `${enumName} {
${fieldParts.join(",\n")},
}`,
        defaultTemplate: `Self::${enumName} {
${defaultParts.join("\n")},
        }`,
        fromJsonMatchArm: `"${discriminatorValue}" => {
            ${fromJsonParts.join(";\n")};
            Self::${enumName} {
                ${keyParts.join(",\n")},
            }
        }`,
        toJsonMatchArm: `Self::${enumName} { ${keyParts.join(",\n")}, } => {
            let mut _json_output_ = "{".to_string();
            _json_output_.push_str("\\"${discriminatorKey}\\":\\"${discriminatorValue}\\"");
            ${toJsonParts.join(";\n\t\t")};
            _json_output_.push('}');
            _json_output_
        }`,
        toQueryParamsMatchArm: `Self::${enumName} { ${keyParts.join(",\n")}, } => {
            let mut _query_parts_: Vec<String> = Vec::new();
            _query_parts_.push("${discriminatorKey}=${discriminatorValue}".to_string());
            ${toQueryParts.join(";\n\t\t")};
            _query_parts_.join("&")
        }`,
        content: subContentParts.join("\n"),
    };
}
