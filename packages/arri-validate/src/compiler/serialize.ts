import { type Type } from "@modii/jtd";
import { camelCase, snakeCase } from "scule";
import {
    type AScalarSchema,
    type ASchema,
    isAScalarSchema,
    isAObjectSchema,
    type AObjectSchema,
    isAStringEnumSchema,
    type AStringEnumSchema,
    isAAraySchema,
    type AArraySchema,
    isADiscriminatorSchema,
    type ADiscriminatorSchema,
    isARecordSchema,
    type ARecordSchema,
} from "../schemas";
import { type TemplateInput } from "./common";

export function createSerializationTemplate(
    inputName: string,
    schema: ASchema<any>,
) {
    const subFunctionNames: string[] = [];
    const subFunctionBodies: string[] = [];
    const mainTemplate = schemaTemplate({
        val: inputName,
        schema,
        instancePath: "",
        schemaPath: "",
        subFunctionNames,
        subFunctionBodies,
    });
    const template = `${subFunctionBodies.join("\n")}
return \`${mainTemplate}\``;
    return template;
}

function schemaTemplate(input: TemplateInput): string {
    if (isAScalarSchema(input.schema)) {
        switch (input.schema.type as Type) {
            case "boolean":
                return booleanTemplate(input);
            case "string": {
                return stringTemplate(input);
            }
            case "timestamp": {
                return timestampTemplate(input);
            }
            case "float32":
            case "float64":
            case "int16":
            case "int32":
            case "int8":
            case "uint16":
            case "uint32":
            case "uint8":
                return numberTemplate(input);
        }
    }
    if (isAObjectSchema(input.schema)) {
        return objectTemplate(input);
    }
    if (isAStringEnumSchema(input.schema)) {
        return stringEnumTemplate(input);
    }
    if (isAAraySchema(input.schema)) {
        return arrayTemplate(input);
    }
    if (isADiscriminatorSchema(input.schema)) {
        return discriminatorTemplate(input);
    }
    if (isARecordSchema(input.schema)) {
        return recordTemplate(input);
    }
    return `\${JSON.stringify(${input.val})}`;
}

function stringTemplate(input: TemplateInput<AScalarSchema<"string">>) {
    const mainTemplate = input.instancePath.length
        ? `"\${${input.val}}"`
        : `\${${input.val}}`;
    if (input.schema.nullable) {
        return `\${typeof ${input.val} === 'string' ? \`${mainTemplate}\` : null}`;
    }
    return mainTemplate;
}

function booleanTemplate(input: TemplateInput<AScalarSchema<"boolean">>) {
    if (input.schema.nullable) {
        return `\${typeof ${input.val} === 'boolean' ? ${input.val} : null}`;
    }
    return `\${${input.val}}`;
}

function timestampTemplate(input: TemplateInput<AScalarSchema<"timestamp">>) {
    const mainTemplate = input.instancePath.length
        ? `"\${${input.val}.toISOString()}"`
        : `\${${input.val}.toISOString()}`;
    if (input.schema.nullable) {
        return `\${typeof ${input.val} === 'object' && ${input.val} !== null && ${input.val} instanceof Date ? \`${mainTemplate}\` : null}`;
    }
    return mainTemplate;
}

function numberTemplate(input: TemplateInput<AScalarSchema>) {
    if (input.schema.nullable) {
        return `\${typeof ${input.val} === 'number' && !Number.isNaN(${input.val}) ? ${input.val} : null}`;
    }
    return `\${${input.val}}`;
}

function objectTemplate(input: TemplateInput<AObjectSchema>) {
    const fieldParts: string[] = [];
    if (input.schema.optionalProperties) {
        for (const key of Object.keys(input.schema.optionalProperties)) {
            const propSchema = input.schema.optionalProperties[key];
            const val = `${input.val}.${key}`;
            const template = schemaTemplate({
                val,
                schema: propSchema,
                schemaPath: `${input.schemaPath}/optionalProperties/${key}`,
                instancePath: `${input.instancePath}/${key}`,
                subFunctionBodies: input.subFunctionBodies,
                subFunctionNames: input.subFunctionNames,
            });
            fieldParts.push(
                `\${${val} !== undefined ? \`"${key}":${template},\` : ''}`,
            );
        }
    }
    for (const key of Object.keys(input.schema.properties)) {
        const propSchema = input.schema.properties[key];
        const template = schemaTemplate({
            val: `${input.val}.${key}`,
            schema: propSchema,
            schemaPath: `${input.schemaPath}/properties/${key}`,
            instancePath: `${input.instancePath}/${key}`,
            subFunctionBodies: input.subFunctionBodies,
            subFunctionNames: input.subFunctionNames,
        });
        fieldParts.push(`"${key}":${template},`);
    }
    const allFieldsAreOptional =
        Object.keys(input.schema.properties).length === 0;
    let result = `{${fieldParts.join("")}}`;
    const position = result.lastIndexOf(",");
    if (allFieldsAreOptional) {
        result = `\${\`{${fieldParts.join("")}}\`.split(",}").join("}")}`;
    } else {
        result = result.substring(0, position) + result.substring(position + 1);
    }

    if (input.schema.nullable) {
        const fallback = input.instancePath.length ? "null" : '"null"';
        const actualResult =
            input.instancePath.length === 0 || allFieldsAreOptional
                ? `\`${result}\``
                : result;
        return `\${typeof ${input.val} === 'object' && ${input.val} !== null ? ${actualResult} : ${fallback}}`;
    }
    return result;
}

function stringEnumTemplate(input: TemplateInput<AStringEnumSchema<any>>) {
    const mainTemplate = input.instancePath.length
        ? `"\${${input.val}}"`
        : `\${${input.val}}`;
    if (input.schema.nullable) {
        return `\${typeof ${input.val} === 'string' ? \`${mainTemplate}\` : null}`;
    }
    return mainTemplate;
}

function arrayTemplate(input: TemplateInput<AArraySchema<any>>) {
    const subTemplate = schemaTemplate({
        val: "item",
        schema: input.schema.elements,
        schemaPath: `${input.schemaPath}/elements`,
        instancePath: `${input.instancePath}`,
        subFunctionBodies: input.subFunctionBodies,
        subFunctionNames: input.subFunctionNames,
    });
    if (input.schema.nullable) {
        return `\${Array.isArray(${input.val}) ? \`\${${input.val}.map((item) => \`${subTemplate}\`).join(",")}\` : null}`;
    }
    return `[\${${input.val}.map((item) => \`${subTemplate}\`).join(",")}]`;
}

function discriminatorTemplate(
    input: TemplateInput<ADiscriminatorSchema<any>>,
) {
    const subFunctionName = `${snakeCase(
        input.schema.metadata.id ?? input.val,
    )}_from_json`;
    const subFunctionParts: string[] = [];
    const types = Object.keys(input.schema.mapping);
    for (const type of types) {
        const prop = input.schema.mapping[type];
        const template = schemaTemplate({
            val: "val",
            schema: prop,
            schemaPath: `${input.schemaPath}/mapping`,
            instancePath: `${input.instancePath}`,
            discriminatorKey: input.schema.discriminator,
            subFunctionBodies: input.subFunctionBodies,
            subFunctionNames: input.subFunctionNames,
        });
        subFunctionParts.push(`case "${type}": 
  return \`${template}\`;
`);
    }
    const subFunction = `function ${subFunctionName}(val) {
            switch(val.${input.schema.discriminator}) {
                ${subFunctionParts.join("\n")}
                default:
                    return null;
            }
        }`;
    if (!input.subFunctionNames.includes(subFunctionName)) {
        input.subFunctionNames.push(subFunctionName);
        input.subFunctionBodies.push(subFunction);
    }
    if (input.schema.nullable) {
        return `\${${input.val} !== null ? ${subFunctionName}(${input.val}) : null}`;
    }
    return `\${${subFunctionName}(${input.val})}`;
}

function recordTemplate(input: TemplateInput<ARecordSchema<any>>) {
    let subFunctionName = `${camelCase(
        input.schema.metadata.id ?? input.instancePath.split("/").join("_"),
    )}`;
    if (!subFunctionName.length) {
        subFunctionName = "serializeVal";
    }

    const subTemplate = schemaTemplate({
        val: "v",
        schema: input.schema.values,
        schemaPath: `${input.schemaPath}/values`,
        instancePath: `${input.instancePath}`,
        subFunctionNames: [],
        subFunctionBodies: [],
    });

    const subFunction = `function ${subFunctionName}(val) {
        const keyParts = []
        const keys = Object.keys(val);
        for(let i = 0; i < Object.keys(val).length; i++) {
            const key = keys[i]
            const v = val[key]
            keyParts.push(\`"\${key}":${subTemplate}\`)
        }
        return \`{\${keyParts.join(',')}}\`
    }`;
    if (!input.subFunctionNames.includes(subFunctionName)) {
        input.subFunctionNames.push(subFunctionName);
        input.subFunctionBodies.push(subFunction);
    }
    if (input.schema.nullable) {
        return `\${${input.val} !== null ? ${subFunctionName}(${input.val}) : null}`;
    }
    return `\${${subFunctionName}(${input.val})}`;
}
