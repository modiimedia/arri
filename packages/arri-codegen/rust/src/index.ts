import {
    type AppDefinition,
    type Schema,
    type SchemaFormProperties,
    type SchemaFormType,
    camelCase,
    defineClientGeneratorPlugin,
    isSchemaFormProperties,
    isSchemaFormType,
    pascalCase,
    snakeCase,
    unflattenProcedures,
} from "arri-codegen-utils";

interface RustClientGeneratorOptions {
    clientName: string;
    outputFile: string;
}

export const rustClientGenerator = defineClientGeneratorPlugin(
    (options: RustClientGeneratorOptions) => {
        return {
            generator(def) {},
            options,
        };
    },
);

interface ClientGeneratorContext {
    schemaPath: string;
    instancePath: string;
    generatedTypes: string[];
    clientName: string;
}

export function createRustClient(
    def: AppDefinition,
    context: ClientGeneratorContext,
) {
    const services = unflattenProcedures(def.procedures);
}

export function rustTypeFromSchema(
    schema: Schema,
    context: ClientGeneratorContext,
): RustProperty {
    if (isSchemaFormType(schema)) {
        switch (schema.type) {
            case "boolean":
                return rustBoolFromSchema(schema);
            case "string":
                return rustStringFromSchema(schema);
            case "timestamp":
                return rustDateTimeFromSchema(schema);
            case "float32":
            case "float64":
            case "int8":
            case "uint8":
            case "int16":
            case "uint16":
            case "int32":
            case "uint32":
            case "int64":
            case "uint64":
                break;
        }
    }
    if (isSchemaFormProperties(schema)) {
        return rustStructFromSchema(schema, context);
    }
    return rustAnyFromSchema(schema);
}

export interface RustProperty {
    fieldTemplate: string;
    fromJsonTemplate: (val: string, key: string) => string;
    toJsonTemplate: (val: string, key: string) => string;
    defaultTemplate: string;
    content: string;
}

export function rustAnyFromSchema(schema: Schema): RustProperty {
    return {
        fieldTemplate: schema.nullable ? "Option<Value>" : "Value",
        defaultTemplate: schema.nullable ? "None()" : "Value::Null",
        fromJsonTemplate(val, key) {
            const rustKey = snakeCase(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(Value(${rustKey}_val)) => Some(${rustKey}_val),
                    _ => None(),
                }`;
            }
            return `match ${val} {
                Some(Value(${rustKey}_val)) => ${rustKey}_val,
                _ => Value::Null,
            }`;
        },
        toJsonTemplate(val, key) {
            const rustKey = snakeCase(key);
            if (schema.nullable) {
                return `match ${val}.get("${key}") {
                    Some(${rustKey}_val) => match serde_json::to_string(${rustKey}_val) {
                        Ok(${rustKey}_val_result) => ${rustKey}_val_result,
                        _ => None,
                    },
                    _ => None,
                }`;
            }
            return `match ${val}.get("${key}") {
                Some(${rustKey}_val) => match serde_json::to_string(${rustKey}_val) {
                    Ok(${rustKey}_val_result) => ${rustKey}_val_result,
                    _ => "".to_string()
                },
                _ => "".to_string(),
            }`;
        },
        content: "",
    };
}

export function rustBoolFromSchema(schema: SchemaFormType): RustProperty {
    if (schema.nullable) {
        return {
            fieldTemplate: "Option<bool>",
            defaultTemplate: "None()",
            toJsonTemplate: (val, key) => {
                const rustKey = snakeCase(key);
                return `match ${val} {
    Some(${rustKey}_val) => ${rustKey}_val.to_string(),
    None => "null".to_string(),
}`;
            },
            fromJsonTemplate: (val, key) => {
                const rustKey = snakeCase(key);
                return `match ${val}.get("${key}") {
    Some(Value::Bool(${rustKey}_val)) => Some(${rustKey}_val.to_owned()),
    _ => None(),
}`;
            },
            content: "",
        };
    }
    return {
        fieldTemplate: "bool",
        defaultTemplate: "false",
        toJsonTemplate: (val, _) => {
            return `${val}.to_string()`;
        },
        fromJsonTemplate: (val, key) => {
            const rustKey = snakeCase(key);
            return `match ${val}.get("${key}") {
    Some(Value::Bool(${rustKey}_val)) => ${rustKey}_val,
    _ => false,
}`;
        },
        content: "",
    };
}

export function rustStringFromSchema(schema: SchemaFormType): RustProperty {
    if (schema.nullable) {
        return {
            fieldTemplate: "Option<String>",
            defaultTemplate: "None",
            toJsonTemplate: (val) => {
                return `match ${val} {
    Some(val) => val,
    None => null
}`;
            },
            fromJsonTemplate: (val, key) => {
                return `match ${val}.get("${key}") {
    Some(Value::String(${val}_val)) => ${val}_val,
    _ => "null".to_string(),
}`;
            },
            content: "",
        };
    }
    return {
        fieldTemplate: "String",
        defaultTemplate: '""',
        toJsonTemplate: (val) => {
            return val;
        },
        fromJsonTemplate: (val, key) => {
            return `match ${val}.get("${key}") {
    Some(Value::String(${val}_val)) => ${val}_val,
    _ => "".to_string(),
}`;
        },
        content: "",
    };
}

export function rustDateTimeFromSchema(schema: SchemaFormType): RustProperty {
    if (schema.nullable) {
        return {
            fieldTemplate: "Some<DateTime<FixedOffset>>",
            defaultTemplate: "None()",
            toJsonTemplate: (val, key) => {
                const rustKey = snakeCase(key);
                return `match ${val} {
                    Some(${rustKey}_val) => ${rustKey}_val.to_rfc3339()
                }`;
            },
            fromJsonTemplate: (val, key) => {
                const rustKey = snakeCase(key);
                return `match ${val}.get("${key}") {
                    Some(Value::String(${rustKey}_val)) => match DateTime::<FixedOffset>::parse_from_rfc3339(${rustKey}_val.as_str()) {
                        Ok(${rustKey}_val_result) => Some(${rustKey}_val_result),
                        Err(_) => None(),
                    },
                    _ => None(),
                }`;
            },
            content: "",
        };
    }
    return {
        fieldTemplate: "DateTime<FixedOffset>",
        defaultTemplate: "DateTime::default()",
        toJsonTemplate(val, key) {
            const rustKey = snakeCase(key);
            return `${rustKey}.to_rfc3339()`;
        },
        fromJsonTemplate(val, key) {
            const rustKey = snakeCase(key);
            return `match ${val}.get("${key}") {
                Some(Value::String(${rustKey}_val)) => match DateTime::<FixedOffset>::parse_from_rfc3339(${rustKey}_val.as_str()) {
                    Ok(${rustKey}_val_result) => ${rustKey}_val_result,
                    Err(_) => DateTime::default(),
                },
                _ => DateTime::default(),
            }`;
        },
        content: "",
    };
}

export function rustStructFromSchema(
    schema: SchemaFormProperties,
    context: ClientGeneratorContext,
): RustProperty {
    let structName = pascalCase(schema.metadata?.id ?? "");
    if (!structName) {
        structName = pascalCase(context.instancePath.split("/").join("_"), {
            normalize: true,
        });
    }

    const fieldParts: string[] = [];
    const defaultParts: string[] = [];
    const toJsonParts: string[] = [];
    const fromJsonParts: string[] = [];
    for (const key of Object.keys(schema.properties)) {
        const rustKey = snakeCase(key);
        const prop = rustTypeFromSchema(schema, {
            ...context,
            instancePath: `${context.instancePath}/${key}`,
            schemaPath: `${context.schemaPath}/properties/${key}`,
        });
        fieldParts.push(`    ${rustKey}: ${prop.fieldTemplate}`);
    }

    let content = `struct ${structName} {
${fieldParts.join(",\n")}
}`;
    if (context.generatedTypes.includes(structName)) {
        content = "";
    } else {
        context.generatedTypes.push(structName);
    }
    return {
        fieldTemplate: structName,
        defaultTemplate: `${structName}::new()`,
        toJsonTemplate: (val, key) => {
            const rustKey = camelCase(key);
            if (schema.nullable) {
                return `match ${val} {
                    Some(${rustKey}_val) => ${structName}.to_json_string(),
                    _ => "null".to_string(),
                }`;
            }
            return `${rustKey}.to_json_string()`;
        },
        fromJsonTemplate: (val, key) => {
            const rustKey = camelCase(key);
            if (schema.nullable) {
                return `match ${val} {
                Some(Value(${rustKey}_val)) => ${structName}.from_json(${rustKey}_val),
                _ => None(),
            }`;
            }
            return `match ${val} {
                Some(Value(${rustKey}_val)) => ${structName}.from_json(${rustKey}_val),
                _ => ${structName}::new(),
            }`;
        },
        content,
    };
}
