import {
    isSchemaFormType,
    type SchemaFormType,
    isSchemaFormProperties,
    type SchemaFormProperties,
    type Schema,
    isSchemaFormEnum,
    type SchemaFormEnum,
    isSchemaFormElements,
    type SchemaFormElements,
    isSchemaFormValues,
    type SchemaFormValues,
    isSchemaFormDiscriminator,
    type SchemaFormDiscriminator,
    type SchemaFormEmpty,
} from "jtd-utils";
import { camelCase } from "scule";
import { randomUUID } from "uncrypto";
import { type TemplateInput } from "./common";

export function createSerializationV2Template(
    inputName: string,
    schema: Schema,
) {
    const result = template({
        val: inputName,
        targetVal: "json",
        schema,
        schemaPath: "",
        instancePath: "",
        subFunctionBodies: [],
        subFunctionNames: [],
    });
    return `let json = '';
    ${result}
    return json;`;
}

export function template(input: TemplateInput): string {
    if (isSchemaFormType(input.schema)) {
        return scalarTemplate(input);
    }
    if (isSchemaFormEnum(input.schema)) {
        return enumTemplate(input);
    }
    if (isSchemaFormProperties(input.schema)) {
        return objectTemplate(input);
    }
    if (isSchemaFormElements(input.schema)) {
        return arrayTemplate(input);
    }
    if (isSchemaFormValues(input.schema)) {
        return recordTemplate(input);
    }
    if (isSchemaFormDiscriminator(input.schema)) {
        return discriminatorTemplate(input);
    }
    return anyTemplate(input);
}

export function scalarTemplate(input: TemplateInput<SchemaFormType>): string {
    switch (input.schema.type) {
        case "string":
            return stringTemplate(input);
        case "boolean":
            return booleanTemplate(input);
        case "timestamp":
            return timestampTemplate(input);
        case "float32":
        case "float64":
            return numberTemplate(input);
        case "int64":
            return bigIntTemplate(input);
        case "int32":
        case "int16":
        case "int8":
            return numberTemplate(input);
        case "uint64":
            return bigIntTemplate(input);
        case "uint32":
        case "uint16":
        case "uint8":
            return numberTemplate(input);
    }
}

export function stringTemplate(input: TemplateInput<SchemaFormType>): string {
    const mainTemplate =
        input.instancePath.length === 0
            ? `${input.targetVal} += \`\${${input.val}}\`;`
            : `${input.targetVal} += \`"\${${input.val}.replace(/[\\n]/g, "\\\\n")}"\`;`;
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'string') {
            ${mainTemplate}
        } else {
            ${input.targetVal} += 'null';
        }`;
    }
    return mainTemplate;
}

export function booleanTemplate(input: TemplateInput<SchemaFormType>): string {
    const mainTemplate = `${input.targetVal} += \`\${${input.val}}\`;`;
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'boolean') {
            ${mainTemplate}
        } else {
            ${input.targetVal} += 'null';
        }`;
    }
    return mainTemplate;
}

export function timestampTemplate(
    input: TemplateInput<SchemaFormType>,
): string {
    const mainTemplate =
        input.instancePath.length === 0
            ? `${input.targetVal} += \`\${${input.val}.toISOString()}\`;`
            : `${input.targetVal} += \`"\${${input.val}.toISOString()}"\`;`;
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'object' && ${input.val} instanceof Date) {
            ${mainTemplate}
        } else {
            ${input.targetVal} += 'null';
        }`;
    }
    return mainTemplate;
}

export function numberTemplate(input: TemplateInput<SchemaFormType>): string {
    const mainTemplate = `${input.targetVal} += \`\${${input.val}}\`;`;
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'number' && !Number.isNaN(${input.val})) {
            ${mainTemplate}
        } else {
            ${input.targetVal} += 'null';
        }`;
    }
    return mainTemplate;
}

export function bigIntTemplate(input: TemplateInput<SchemaFormType>): string {
    const mainTemplate =
        input.instancePath.length === 0
            ? `${input.targetVal} += \`\${${input.val}.toString()}\`;`
            : `${input.targetVal} += \`"\${${input.val}.toString()}"\`;`;
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'bigint') {
            ${mainTemplate}
        } else {
            ${input.targetVal} += 'null';
        }`;
    }
    return mainTemplate;
}

export function enumTemplate(input: TemplateInput<SchemaFormEnum>): string {
    const mainTemplate =
        input.instancePath.length === 0
            ? `${input.targetVal} += \`\${${input.val}}\`;`
            : `${input.targetVal} += \`"\${${input.val}}"\``;
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'string') {
            ${mainTemplate}
        } else {
            ${input.targetVal} += 'null';
        }`;
    }
    return mainTemplate;
}

export function objectTemplate(
    input: TemplateInput<SchemaFormProperties>,
): string {
    const templateParts: string[] = [`${input.targetVal} += "{";`];
    if (input.discriminatorKey && input.discriminatorValue) {
        templateParts.push(
            `${input.targetVal} += \`"${input.discriminatorKey}":"${input.discriminatorValue}"\`;`,
        );
    }
    const propKeys = Object.keys(input.schema.properties);
    const isAllOptionalKeys =
        propKeys.length === 0 &&
        !input.discriminatorKey &&
        !input.discriminatorValue;
    for (let i = 0; i < propKeys.length; i++) {
        const key = propKeys[i];
        const propSchema = input.schema.properties[key];
        if (i !== 0 || (input.discriminatorKey && input.discriminatorValue)) {
            templateParts.push(`${input.targetVal} += \`,"${key}":\`;`);
        } else {
            templateParts.push(`${input.targetVal} += \`"${key}":\`;`);
        }
        templateParts.push(
            template({
                schema: propSchema,
                val: `${input.val}.${key}`,
                targetVal: input.targetVal,
                instancePath: `${input.instancePath}/${key}`,
                schemaPath: `${input.schemaPath}/properties/${key}`,
                subFunctionBodies: input.subFunctionBodies,
                subFunctionNames: input.subFunctionNames,
            }),
        );
    }
    const optionalPropKeys = Object.keys(input.schema.optionalProperties ?? {});
    if (isAllOptionalKeys) {
        const innerVarName = input.instancePath
            ? camelCase(input.instancePath.split("/").join("_")) + "Json"
            : camelCase(`Json${randomUUID()}`);
        templateParts.push(`let ${innerVarName}HasFields = false;`);
        templateParts.push(`let ${innerVarName} = '';`);
        for (let i = 0; i < optionalPropKeys.length; i++) {
            const key = optionalPropKeys[i];
            const optionalPropSchema = input.schema.optionalProperties?.[
                key
            ] as Schema;
            if (!optionalPropSchema) {
                continue;
            }
            const innerVal = `${input.val}.${key}`;
            const innerTemplate = template({
                schema: optionalPropSchema,
                schemaPath: `${input.schemaPath}/optionalProperties/${key}`,
                instancePath: `${input.instancePath}/${key}`,
                val: innerVal,
                targetVal: innerVarName,
                subFunctionBodies: input.subFunctionBodies,
                subFunctionNames: input.subFunctionNames,
            });
            templateParts.push(`if (typeof ${innerVal} !== 'undefined') {
                if (${innerVarName}HasFields) {
                    ${innerVarName} += ',"${key}":';
                    ${innerTemplate}
                } else {
                    ${innerVarName} += '"${key}":';
                    ${innerTemplate}
                    ${innerVarName}HasFields = true;
                }
            }`);
            templateParts.push(`${input.targetVal} += ${innerVarName};`);
        }
    } else {
        for (let i = 0; i < optionalPropKeys.length; i++) {
            const key = optionalPropKeys[i];
            const optionalPropSchema = input.schema.optionalProperties?.[key];
            if (!optionalPropSchema) {
                continue;
            }
            const innerVal = `${input.val}.${key}`;
            const innerTemplate = template({
                schema: optionalPropSchema,
                schemaPath: `${input.schemaPath}/optionalProperties/${key}`,
                instancePath: `${input.instancePath}/${key}`,
                val: innerVal,
                targetVal: "json",
                subFunctionBodies: input.subFunctionBodies,
                subFunctionNames: input.subFunctionNames,
            });
            const completeInnerTemplate = `if (typeof ${innerVal} !== 'undefined') {
                ${input.targetVal} += ',"${key}":';
                ${innerTemplate}
            }`;
            templateParts.push(completeInnerTemplate);
        }
    }
    templateParts.push(`${input.targetVal} += '}';`);
    const mainTemplate = templateParts.join("\n");
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'object' && ${input.val} !== null) {
            ${mainTemplate}
        } else {
            ${input.targetVal} += 'null';
        }`;
    }
    return mainTemplate;
}

export function arrayTemplate(
    input: TemplateInput<SchemaFormElements>,
): string {
    const templateParts: string[] = [`${input.targetVal} += '[';`];
    const innerTemplate = template({
        schema: input.schema.elements,
        schemaPath: `${input.schemaPath}/elements`,
        instancePath: `${input.instancePath}/i`,
        val: `${input.val}[i]`,
        targetVal: input.targetVal,
        subFunctionBodies: input.subFunctionBodies,
        subFunctionNames: input.subFunctionNames,
    });
    templateParts.push(`for (let i = 0; i < ${input.val}.length; i++) {
        if (i !== 0) {
            ${input.targetVal} += ',';
        }
        ${innerTemplate}
    }`);
    templateParts.push(`${input.targetVal} += ']';`);
    const mainTemplate = templateParts.join("\n");
    if (input.schema.nullable) {
        return `if (Array.isArray(${input.val})) {
            ${mainTemplate}
        } else {
            ${input.targetVal} += 'null';
        }`;
    }
    return mainTemplate;
}

export function recordTemplate(input: TemplateInput<SchemaFormValues>): string {
    const keysVarName = input.instancePath.length
        ? camelCase(input.instancePath.split("/").join("_")) + "Keys"
        : camelCase(`Keys${randomUUID()}`);
    const templateParts: string[] = [
        `let ${keysVarName} = Object.keys(${input.val});`,
        `${input.targetVal} += '{';`,
    ];
    const innerTemplate = template({
        schema: input.schema.values,
        schemaPath: `${input.schemaPath}/values`,
        instancePath: `${input.instancePath}/key`,
        val: `innerVal`,
        targetVal: input.targetVal,
        subFunctionBodies: input.subFunctionBodies,
        subFunctionNames: input.subFunctionNames,
    });
    templateParts.push(`for (let i = 0; i < ${keysVarName}.length; i++) {
        const key = ${keysVarName}[i];
        const innerVal = ${input.val}[key];
        if(i !== 0) {
            ${input.targetVal} += \`,"\${key}":\`;
        } else {
            ${input.targetVal} += \`"\${key}":\`;
        }
        ${innerTemplate}
    }`);
    templateParts.push(`${input.targetVal} += '}';`);
    const mainTemplate = templateParts.join("\n");
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'object' && ${input.val} !== null) {
            ${mainTemplate}
        } else {
            ${input.targetVal} += 'null';
        }`;
    }
    return mainTemplate;
}

function discriminatorTemplate(
    input: TemplateInput<SchemaFormDiscriminator>,
): string {
    const discriminatorKey = input.schema.discriminator;
    const discriminatorVals = Object.keys(input.schema.mapping);
    const templateParts = [`switch(${input.val}.${discriminatorKey}) {`];
    for (const val of discriminatorVals) {
        const valSchema = input.schema.mapping[val];
        const innerTemplate = template({
            schema: valSchema,
            schemaPath: `${input.schemaPath}/mapping/${val}`,
            instancePath: `${input.instancePath}`,
            val: input.val,
            targetVal: input.targetVal,
            subFunctionBodies: input.subFunctionBodies,
            subFunctionNames: input.subFunctionNames,
            discriminatorKey,
            discriminatorValue: val,
        });
        templateParts.push(`case '${val}': {
            ${innerTemplate}
            break;
        }`);
    }
    templateParts.push("}");
    const mainTemplate = templateParts.join("\n");
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'object' && ${input.val} !== null) {
            ${mainTemplate}
        } else {
            ${input.targetVal} += 'null';
        }`;
    }
    return mainTemplate;
}

export function anyTemplate(input: TemplateInput<SchemaFormEmpty>): string {
    return `${input.targetVal} += JSON.stringify(${input.val});`;
}
