import { type Type } from "@modii/jtd";
import { snakeCase } from "scule";
import {
    int16Max,
    int16Min,
    int32Max,
    int32Min,
    int8Max,
    int8Min,
    uint16Max,
    uint16Min,
    uint32Max,
    uint32Min,
    uint8Max,
    uint8Min,
} from "../lib/numberConstants";
import {
    type AScalarSchema,
    isAScalarSchema,
    type ASchema,
    isAObjectSchema,
    isAStringEnumSchema,
    type AStringEnumSchema,
    type AObjectSchema,
    isAAraySchema,
    type AArraySchema,
    type ARecordSchema,
    type ADiscriminatorSchema,
    isADiscriminatorSchema,
    isARecordSchema,
} from "../schemas";
import { type TemplateInput } from "./common";

export function createParsingTemplate(input: string, schema: ASchema): string {
    const fallbackTemplate = `  class $ValidationError extends Error {
        /**
         * @type {string}
         */
        instancePath;
        /**
         * @type {string}
         */
        schemaPath;
        /**
         *
         * @param instancePath {string}
         * @param schemaPath {string}
         * @param message {string}
         */
        constructor(instancePath, schemaPath, message) {
            super(message);
            this.instancePath = instancePath;
            this.schemaPath = schemaPath;
        }
    }

    /**
     * @param instancePath {string}
     * @param schemaPath {string}
     * @param message {string}
     */
    function $fallback(instancePath, schemaPath, message) {
        throw new $ValidationError(instancePath, schemaPath, message);
    }`;
    let jsonParseCheck = "";

    const functionBodyParts: string[] = [];
    const functionNameParts: string[] = [];
    const template = schemaTemplate({
        val: input,
        schema,
        instancePath: "",
        schemaPath: "",
        subFunctionBodies: functionBodyParts,
        subFunctionNames: functionNameParts,
    });
    const jsonTemplate = schemaTemplate({
        val: "json",
        schema,
        instancePath: "",
        schemaPath: "",
        subFunctionBodies: functionBodyParts,
        subFunctionNames: functionNameParts,
    });

    if (
        isAObjectSchema(schema) ||
        isARecordSchema(schema) ||
        isADiscriminatorSchema(schema) ||
        isAAraySchema(schema)
    ) {
        jsonParseCheck = `if(typeof ${input} === 'string') {
            const json = JSON.parse(${input});
            return ${jsonTemplate}
        }`;
    }
    if (template.includes("// @final-template")) {
        return template;
    }
    return `${fallbackTemplate}
    ${functionBodyParts.join("\n")}
    ${jsonParseCheck}
    return ${template}`;
}

export function schemaTemplate(input: TemplateInput): string {
    if (isAScalarSchema(input.schema)) {
        switch (input.schema.type as Type) {
            case "boolean":
                return booleanTemplate(input);
            case "string":
                return stringTemplate(input);
            case "timestamp":
                return timestampTemplate(input);
            case "float64":
            case "float32":
                return floatTemplate(input);
            case "int32":
                return intTemplate(input, int32Min, int32Max);
            case "int16":
                return intTemplate(input, int16Min, int16Max);
            case "int8":
                return intTemplate(input, int8Min, int8Max);
            case "uint32":
                return intTemplate(input, uint32Min, uint32Max);
            case "uint16":
                return intTemplate(input, uint16Min, uint16Max);
            case "uint8":
                return intTemplate(input, uint8Min, uint8Max);
        }
    }
    if (isAStringEnumSchema(input.schema)) {
        return enumTemplate(input);
    }
    if (isAObjectSchema(input.schema)) {
        return objectTemplate(input);
    }
    if (isAAraySchema(input.schema)) {
        return arraySchema(input);
    }
    if (isADiscriminatorSchema(input.schema)) {
        return discriminatorSchema(input);
    }
    return `${input.val}`;
}

function booleanTemplate(
    input: TemplateInput<AScalarSchema<"boolean">>,
): string {
    const errorMessage = input.instancePath.length
        ? `Expected boolean for ${input.instancePath}`
        : `Expected boolean`;
    if (input.instancePath.length === 0) {
        input.subFunctionBodies
            .push(`function boolFromString(val, instancePath, schemaPath) {
            if(typeof val === 'string') {
                if(val === 'true') {
                    return true;
                }
                if(val === 'false') {
                    return false;
                }
                throw $ValidationError(instancePath, schemaPath, \`Unable to parse boolean from \${val}\`)
            }
            
        }`);

        const mainTemplate = `typeof ${input.val} === 'string' && (${input.val} === 'true' || ${input.val} === 'false') ? ${input.val} === 'true' : typeof ${input.val} === 'boolean' ? ${input.val} : $fallback("${input.instancePath}", "${input.schemaPath}", "${errorMessage}")`;
        if (input.schema.nullable) {
            return `${input.val} === null ? null : ${mainTemplate}`;
        }
        return mainTemplate;
    }
    const mainTemplate = `typeof ${input.val} === 'boolean' ? ${input.val} : $fallback("${input.instancePath}", "${input.schemaPath}/type", "${errorMessage}")`;
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate}`;
    }
    return mainTemplate;
}

export function stringTemplate(
    input: TemplateInput<AScalarSchema<"string">>,
): string {
    const mainTemplate = `typeof ${input.val} === 'string' ? ${input.val} : $fallback("${input.instancePath}", "${input.schemaPath}", "Expected string at ${input.val}.")`;
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate}`;
    }
    return mainTemplate;
}

export function floatTemplate(
    input: TemplateInput<AScalarSchema<"float32" | "float64">>,
): string {
    if (input.instancePath.length === 0) {
        const nullPart = `if(${input.val} === 'null') {
                    return null;
                }`;
        return `// @final-template
            if(typeof ${input.val} === 'string') {
                ${input.schema.nullable ? nullPart : ""}
                const parsedVal = Number(${input.val});
                if(!Number.isNaN(parsedVal)) {
                    return parsedVal;
                }
                throw new Error(\`Unable to parse float from \${${
                    input.val
                }}.\`)
            }
            if(typeof ${input.val} === 'number') {
                return ${input.val};
            }
            throw new Error(\`Expected number. Got \${${input.val}}.\`)`;
    }
    const mainTemplate = `typeof ${input.val} === 'number' ? ${input.val} : $fallback("${input.instancePath}", "${input.schemaPath}", "Expected float at ${input.val}")`;
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate}`;
    }
    return mainTemplate;
}

export function intTemplate(
    input: TemplateInput<
        AScalarSchema<
            "int16" | "int32" | "int8" | "uint16" | "uint32" | "uint8"
        >
    >,
    min: number,
    max: number,
) {
    function mainTemplate(inputName: string) {
        return `typeof ${inputName} === 'number' && Number.isInteger(${inputName}) && ${inputName} >= ${min} && ${inputName} <= ${max} ? ${inputName} : $fallback("${input.instancePath}", "${input.schemaPath}", \`Expected integer between ${min} and ${max} at ${input.instancePath}. Got \${${inputName}}\`)`;
    }
    if (input.instancePath.length === 0) {
        if (input.schema.nullable) {
            const functionBody = `
// @final-template
if(typeof ${input.val} === 'string') {
    if(${input.val} === 'null') {
        return null;
    }
    const parsedVal = Number(${input.val});
    if(Number.isInteger(parsedVal) && parsedVal >= ${min} && parsedVal <= ${max}) {
        return parsedVal;
    }
    throw new Error(\`Expected integer between ${min} and ${max}. Got \${${input.val}}.\`);
}
if(typeof ${input.val} === 'number' && Number.isInteger(${input.val}) && ${input.val} >= ${min} && val <= ${max}) {
    return ${input.val}
}
throw new Error(\`Expected integer between ${min} and ${max}. Got \${${input.val}}.\`);
`;
            return functionBody;
        }
        const functionBody = `
// @final-template
if(typeof ${input.val} === 'string') {
    const parsedVal = Number(${input.val});
    if(Number.isInteger(parsedVal) && parsedVal >= ${min} && parsedVal <= ${max}) {
        return parsedVal;
    }
    throw new Error(\`Expected integer between ${min} and ${max}. Got \${parsedVal}.\`);
}
if(typeof ${input.val} === 'number' && Number.isInteger(${input.val}) && ${input.val} >= ${min} && ${input.val} <= ${max}) {
    return ${input.val};
}
throw new Error(\`Expected integer between ${min} and ${max}. Got \${${input.val}}.\`);`;
        input.finalFunctionBody = functionBody;
        return functionBody;
    }

    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate(input.val)}`;
    }
    return mainTemplate(input.val);
}

export function timestampTemplate(
    input: TemplateInput<AScalarSchema<"timestamp">>,
) {
    if (input.instancePath.length === 0) {
        const nullPart = `if (${input.val} === null) {
            return null;
        }`;
        const nullStringPart = `if (${input.val} === 'null') {
            return null;
        }`;
        return `// @final-template
if(typeof ${input.val} === 'string') {
    ${input.schema.nullable ? nullStringPart : ""}
    return new Date(${input.val});
}
if(typeof ${input.val} === 'object' && ${input.val} instanceof Date) {
    return ${input.val};
}
${input.schema.nullable ? nullPart : ""}
throw new Error(\`Expected instance of Date or ISO date string. Got \${${
            input.val
        }}\`);
            `;
    }
    const mainTemplate = `typeof ${input.val} === 'object' && ${input.val} instanceof Date ? ${input.val} : typeof ${input.val} === 'string' ? new Date(${input.val}) : $fallback("${input.instancePath}", "${input.schemaPath}", "Expected instance of Date or ISO Date string at ${input.instancePath}")`;
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate}`;
    }
    return mainTemplate;
}

function enumTemplate(
    input: TemplateInput<AStringEnumSchema<string[]>>,
): string {
    const enumTemplate = input.schema.enum
        .map((val) => `${input.val} === "${val}"`)
        .join(" || ");
    const errorMessage = `Expected one of the following values: [${input.schema.enum.join(
        ", ",
    )}]${input.instancePath.length ? ` at ${input.instancePath}` : ""}.`;
    const mainTemplate = `typeof ${input.val} === 'string' && (${enumTemplate}) ? ${input.val} : $fallback("${input.instancePath}", "${input.schemaPath}", "${errorMessage}")`;
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate}`;
    }
    return mainTemplate;
}

function objectTemplate(input: TemplateInput<AObjectSchema>): string {
    const parsingParts: string[] = [];
    if (input.discriminatorKey && input.discriminatorValue) {
        parsingParts.push(
            `"${input.discriminatorKey}": "${input.discriminatorValue}"`,
        );
    }
    for (const key of Object.keys(input.schema.properties)) {
        const subSchema = input.schema.properties[key];
        const innerTemplate = schemaTemplate({
            val: `${input.val}.${key}`,
            schema: subSchema,
            instancePath: `${input.instancePath}/${key}`,
            schemaPath: `${input.schemaPath}/properties/${key}`,
            subFunctionBodies: input.subFunctionBodies,
            subFunctionNames: input.subFunctionNames,
        });
        parsingParts.push(`"${key}": ${innerTemplate}`);
    }
    if (input.schema.optionalProperties) {
        for (const key of Object.keys(input.schema.optionalProperties)) {
            const subSchema = input.schema.optionalProperties[key];
            const innerTemplate = schemaTemplate({
                val: `${input.val}.${key}`,
                schema: subSchema,
                instancePath: `${input.instancePath}/${key}`,
                schemaPath: `${input.schemaPath}/optionalProperties/${key}`,
                subFunctionBodies: input.subFunctionBodies,
                subFunctionNames: input.subFunctionNames,
            });
            parsingParts.push(
                `"${key}": typeof ${input.val} !== 'undefined' ? ${innerTemplate} : undefined`,
            );
        }
    }
    const mainTemplate = `typeof ${input.val} === 'object' && ${
        input.val
    } !== null ? {
        ${parsingParts.join(",\n    ")}
    } : $fallback("${input.instancePath}", "${
        input.schemaPath
    }", "Expected object.")`;
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate}`;
    }
    return mainTemplate;
}

export function arraySchema(input: TemplateInput<AArraySchema<any>>): string {
    const innerTemplate = schemaTemplate({
        val: `item`,
        instancePath: `${input.instancePath}/item`,
        schemaPath: `${input.schemaPath}/elements`,
        schema: input.schema.elements,
        subFunctionBodies: input.subFunctionBodies,
        subFunctionNames: input.subFunctionNames,
    });

    const mainTemplate = `Array.isArray(${input.val}) ? ${input.val}.map((item) => ${innerTemplate}) : $fallback("${input.instancePath}", "${input.schemaPath}/elements", "Expected Array")`;
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate}`;
    }
    return mainTemplate;
}

export function recordSchema(input: TemplateInput<ARecordSchema<any>>): string {
    const innerTemplate = schemaTemplate({
        schema: input.schema.values,
        instancePath: `${input.instancePath}`,
        schemaPath: `${input.schemaPath}/values`,
        val: `${input.val}[key]`,
        subFunctionBodies: input.subFunctionBodies,
        subFunctionNames: input.subFunctionNames,
    });
    const mainTemplate = `typeof ${input.val} === 'object' && ${input.val} !== null ? Object.keys(${input.val}).forEach((key) => ${innerTemplate}) : $fallback("${input.instancePath}", "${input.schemaPath}/values", "Expected object")`;
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate}`;
    }
    return mainTemplate;
}

export function discriminatorSchema(
    input: TemplateInput<ADiscriminatorSchema<any>>,
): string {
    const subFunctionName = `${snakeCase(
        (input.schema.metadata.id ?? input.val) || input.schemaPath,
    )}_from_json`;
    const switchParts: string[] = [];
    const types = Object.keys(input.schema.mapping);
    for (const type of types) {
        const innerSchema = input.schema.mapping[type];
        const template = objectTemplate({
            val: "val",
            schema: innerSchema,
            schemaPath: `${input.schemaPath}/mapping`,
            instancePath: `${input.instancePath}`,
            subFunctionBodies: input.subFunctionBodies,
            subFunctionNames: input.subFunctionNames,
            discriminatorKey: input.schema.discriminator,
            discriminatorValue: type,
        });
        switchParts.push(`case "${type}":
        return ${template}`);
    }
    const subFunction = `function ${subFunctionName}(val) {
        switch(val.${input.schema.discriminator}) {
            ${switchParts.join("\n")}
            default:
                return $fallback("${input.instancePath}", "${
                    input.schemaPath
                }/mapping", "${input.val}.${
                    input.schema.discriminator
                } did not match one of the specified values")
        }
    }`;
    if (!input.subFunctionNames.includes(subFunctionName)) {
        input.subFunctionBodies.push(subFunction);
        input.subFunctionNames.push(subFunctionName);
    }
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${subFunctionName}(${input.val})`;
    }
    return `${subFunctionName}(${input.val})`;
}
