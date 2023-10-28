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
import { type TemplateInput } from "./common";

interface SerializeTemplateInput<TSchema extends Schema = any>
    extends TemplateInput<TSchema> {
    outputPrefix: string;
}

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
        outputPrefix: "",
    });
    if (isSchemaFormType(schema) || isSchemaFormEnum(schema)) {
        return result;
    }
    return `let json = '';
    ${result}
    return json;`;
}

export function template(input: SerializeTemplateInput): string {
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

export function scalarTemplate(
    input: SerializeTemplateInput<SchemaFormType>,
): string {
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

export function stringTemplate(
    input: SerializeTemplateInput<SchemaFormType>,
): string {
    if (input.instancePath.length === 0) {
        if (input.schema.nullable) {
            return `if (typeof ${input.val} === 'string') {
                return ${input.val};
            }
            return 'null';`;
        }
        return `return ${input.val};`;
    }
    const mainTemplate = `${input.targetVal} += \`${
        input.outputPrefix ?? ""
    }"\${${input.val}.replace(/[\\n]/g, "\\\\n")}"\`;`;
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'string') {
            ${mainTemplate}
        } else {
            ${input.targetVal} += '${input.outputPrefix ?? ""}null';
        }`;
    }
    return mainTemplate;
}

export function booleanTemplate(
    input: SerializeTemplateInput<SchemaFormType>,
): string {
    if (input.instancePath.length === 0) {
        return `return \`\${${input.val}}\`;`;
    }
    const mainTemplate = `${input.targetVal} += \`${input.outputPrefix}\${${input.val}}\`;`;
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'boolean') {
            ${mainTemplate}
        } else {
            ${input.targetVal} += '${input.outputPrefix}null';
        }`;
    }
    return mainTemplate;
}

export function timestampTemplate(
    input: SerializeTemplateInput<SchemaFormType>,
): string {
    if (input.instancePath.length === 0) {
        if (input.schema.nullable) {
            return `if (typeof ${input.val} === 'object' && ${input.val} instanceof Date) {
                return ${input.val}.toISOString();
            }
            return 'null';`;
        }
        return `return ${input.val}.toISOString();`;
    }
    const mainTemplate = `${input.targetVal} += \`${input.outputPrefix}"\${${input.val}.toISOString()}"\`;`;
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'object' && ${input.val} instanceof Date) {
            ${mainTemplate}
        } else {
            ${input.targetVal} += '${input.outputPrefix}null';
        }`;
    }
    return mainTemplate;
}

export function numberTemplate(
    input: SerializeTemplateInput<SchemaFormType>,
): string {
    if (input.instancePath.length === 0) {
        if (input.schema.nullable) {
            return `if (typeof ${input.val} === 'number' && !Number.isNaN(${input.val})) {
                return \`\${${input.val}}\`;
            }
            return 'null';`;
        }
        return `return \`\${${input.val}}\`;`;
    }
    const mainTemplate = `${input.targetVal} += \`${input.outputPrefix}\${${input.val}}\`;`;
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'number' && !Number.isNaN(${input.val})) {
            ${mainTemplate}
        } else {
            ${input.targetVal} += '${input.outputPrefix}null';
        }`;
    }
    return mainTemplate;
}

export function bigIntTemplate(
    input: SerializeTemplateInput<SchemaFormType>,
): string {
    if (input.instancePath.length === 0) {
        if (input.schema.nullable) {
            return `if (typeof ${input.val} === 'bigint') {
                return ${input.val}.toString();
            }
            return 'null';`;
        }
        return `return ${input.val}.toString();`;
    }
    const mainTemplate = `${input.targetVal} += \`${input.outputPrefix}"\${${input.val}.toString()}"\`;`;
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'bigint') {
            ${mainTemplate}
        } else {
            ${input.targetVal} += '${input.outputPrefix}null';
        }`;
    }
    return mainTemplate;
}

export function enumTemplate(
    input: SerializeTemplateInput<SchemaFormEnum>,
): string {
    if (input.instancePath.length === 0) {
        if (input.schema.nullable) {
            return `if (typeof ${input.val} === 'string') {
                return ${input.val};
            }
            return 'null';`;
        }
        return `return ${input.val};`;
    }
    const mainTemplate = `${input.targetVal} += \`${input.outputPrefix}"\${${input.val}}"\``;
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'string') {
            ${mainTemplate}
        } else {
            ${input.targetVal} += '${input.outputPrefix}null';
        }`;
    }
    return mainTemplate;
}

export function objectTemplate(
    input: SerializeTemplateInput<SchemaFormProperties>,
): string {
    const templateParts: string[] = [
        `${input.targetVal} += '${input.outputPrefix}{';`,
    ];
    if (input.discriminatorKey && input.discriminatorValue) {
        templateParts.push(
            `${input.targetVal} += \`"${input.discriminatorKey}":"${input.discriminatorValue}"\`;`,
        );
    }
    const propKeys = Object.keys(input.schema.properties);
    const optionalPropKeys = Object.keys(input.schema.optionalProperties ?? {});
    const isAllOptionalKeys =
        propKeys.length === 0 &&
        !input.discriminatorKey?.length &&
        !input.discriminatorValue?.length;
    for (let i = 0; i < propKeys.length; i++) {
        const key = propKeys[i];
        const propSchema = input.schema.properties[key];
        const includeComma =
            i !== 0 || (input.discriminatorKey && input.discriminatorValue);
        // if (i !== 0 || (input.discriminatorKey && input.discriminatorValue)) {
        //     templateParts.push(`${input.targetVal} += \`,"${key}":\``);
        // } else {
        //     templateParts.push(`${input.targetVal} += \`"${key}":\``);
        // }
        const innerTemplate = template({
            schema: propSchema,
            val: `${input.val}.${key}`,
            targetVal: input.targetVal,
            instancePath: `${input.instancePath}/${key}`,
            schemaPath: `${input.schemaPath}/properties/${key}`,
            subFunctionBodies: input.subFunctionBodies,
            subFunctionNames: input.subFunctionNames,
            outputPrefix: includeComma ? `,"${key}":` : `"${key}":`,
        });
        templateParts.push(innerTemplate);
    }
    if (isAllOptionalKeys) {
        const hasFieldsVar = input.instancePath.length
            ? camelCase(`${input.instancePath}_HasFields`)
            : camelCase(
                  `${input.val}_HasFields`
                      .split("[")
                      .join("")
                      .split("]")
                      .join(""),
              );
        templateParts.push(`let ${hasFieldsVar} = false;`);
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
                targetVal: input.targetVal,
                subFunctionBodies: input.subFunctionBodies,
                subFunctionNames: input.subFunctionNames,
                outputPrefix: `"${key}":`,
            });
            const innerTemplateWithComma = template({
                schema: optionalPropSchema,
                schemaPath: `${input.schemaPath}/optionalProperties/${key}`,
                instancePath: `${input.instancePath}/${key}`,
                val: innerVal,
                targetVal: input.targetVal,
                subFunctionBodies: input.subFunctionBodies,
                subFunctionNames: input.subFunctionNames,
                outputPrefix: `,"${key}":`,
            });
            templateParts.push(`if (typeof ${innerVal} !== 'undefined') {
                if (${hasFieldsVar}) {
                    ${innerTemplateWithComma}
                } else {
                    ${innerTemplate}
                    ${hasFieldsVar} = true;
                }
            }`);
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
                outputPrefix: `,"${key}":`,
            });
            const completeInnerTemplate = `if (typeof ${innerVal} !== 'undefined') {
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
            ${input.targetVal} += '${input.outputPrefix}null';
        }`;
    }
    return mainTemplate;
}

export function arrayTemplate(
    input: SerializeTemplateInput<SchemaFormElements>,
): string {
    const templateParts: string[] = [
        `${input.targetVal} += '${input.outputPrefix}[';`,
    ];
    const innerTemplate = template({
        schema: input.schema.elements,
        schemaPath: `${input.schemaPath}/elements`,
        instancePath: `${input.instancePath}/i`,
        val: `arrayItem`,
        targetVal: input.targetVal,
        subFunctionBodies: input.subFunctionBodies,
        subFunctionNames: input.subFunctionNames,
        outputPrefix: "",
    });
    templateParts.push(`for (let i = 0; i < ${input.val}.length; i++) {
        const arrayItem = ${input.val}[i];
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
            ${input.targetVal} += '${input.outputPrefix}null';
        }`;
    }
    return mainTemplate;
}

export function recordTemplate(
    input: SerializeTemplateInput<SchemaFormValues>,
): string {
    const keysVarName = input.instancePath.length
        ? camelCase(input.instancePath.split("/").join("_")) + "Keys"
        : camelCase(`${input.val.split(".").join("_")}_Keys`);
    const templateParts: string[] = [
        `const ${keysVarName} = Object.keys(${input.val});`,
        `${input.targetVal} += '${input.outputPrefix}{';`,
    ];
    const innerTemplate = template({
        schema: input.schema.values,
        schemaPath: `${input.schemaPath}/values`,
        instancePath: `${input.instancePath}/key`,
        val: `innerVal`,
        targetVal: input.targetVal,
        subFunctionBodies: input.subFunctionBodies,
        subFunctionNames: input.subFunctionNames,
        outputPrefix: "",
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
            ${input.targetVal} += '${input.outputPrefix}null';
        }`;
    }
    return mainTemplate;
}

function discriminatorTemplate(
    input: SerializeTemplateInput<SchemaFormDiscriminator>,
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
            outputPrefix: input.outputPrefix,
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
            ${input.targetVal} += '${input.outputPrefix}null';
        }`;
    }
    return mainTemplate;
}

export function anyTemplate(
    input: SerializeTemplateInput<SchemaFormEmpty>,
): string {
    if (input.outputPrefix) {
        const mainTemplate = `${input.targetVal} += '${input.outputPrefix}' + JSON.stringify(${input.val});`;
        if (input.schema.nullable) {
            return `if (${input.val} === null) {
                ${input.targetVal} = '${input.outputPrefix}null';
            } else {
                ${mainTemplate}
            }`;
        }
        return mainTemplate;
    }
    return `${input.targetVal} += JSON.stringify(${input.val});`;
}
