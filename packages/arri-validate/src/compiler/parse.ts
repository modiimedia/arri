import { randomUUID } from "crypto";
import { camelCase } from "scule";
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
import { type ScalarType, type TemplateInput } from "./common";

export function createParsingTemplate(input: string, schema: ASchema): string {
    const validationErrorName = `$ValidationError${camelCase(
        schema.metadata.id ?? randomUUID(),
    )}`;
    const fallbackTemplate = `    class ${validationErrorName} extends Error {
        errors;
        constructor(input) {
            super(input.message);
            this.errors = input.errors;
        }
    }

    function $fallback(instancePath, schemaPath, message) {
        throw new ${validationErrorName}({ 
            message: message,
            errors: [{ 
                instancePath: instancePath,
                schemaPath: schemaPath,
                message: message 
            }],
        });
    }`;
    let jsonParseCheck = "";

    const functionBodyParts: string[] = [];
    const functionNameParts: string[] = [];
    const template = schemaTemplate({
        val: input,
        targetVal: "result",
        schema,
        instancePath: "",
        schemaPath: "",
        subFunctionBodies: functionBodyParts,
        subFunctionNames: functionNameParts,
    });
    const jsonTemplate = schemaTemplate({
        val: "json",
        targetVal: "jsonResult",
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
        jsonParseCheck = `if (typeof ${input} === 'string') {
            const json = JSON.parse(${input});
            let jsonResult = {};
            ${jsonTemplate}
            return jsonResult;
        }`;
    }
    const finalTemplate = `${fallbackTemplate}
    ${functionBodyParts.join("\n")}
    ${jsonParseCheck}
    let result = {};
    ${template}
    return result;`;
    return finalTemplate;
}

export function schemaTemplate(input: TemplateInput): string {
    if (isAScalarSchema(input.schema)) {
        switch (input.schema.type as ScalarType) {
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
    const mainTemplate = `if (typeof ${input.val} === 'boolean') {
        ${input.targetVal} = ${input.val};
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}/type", "${errorMessage}");
    }`;
    if (input.schema.nullable) {
        return `if (${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`;
    }
    return mainTemplate;
}

export function stringTemplate(
    input: TemplateInput<AScalarSchema<"string">>,
): string {
    const errorMessage = `Expected string at ${input.instancePath}`;
    const mainTemplate = `if (typeof ${input.val} === 'string') {
        ${input.targetVal} = ${input.val};
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}/type", "${errorMessage}");
    }`;
    if (input.schema.nullable) {
        return `if (${input.val} === null) {
            ${input.targetVal} = ${input.val};
        } else {
            ${mainTemplate}
        }`;
    }
    return mainTemplate;
}

export function floatTemplate(
    input: TemplateInput<AScalarSchema<"float32" | "float64">>,
): string {
    const errorMessage = `Expected number at ${input.instancePath}`;
    const mainTemplate = `if (typeof ${input.val} === 'number' && !Number.isNaN(${input.val})) {
        ${input.targetVal} = ${input.val};
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}/type", "${errorMessage}");
    }`;
    if (input.schema.nullable) {
        return `if (${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`;
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
    const mainTemplate = `if (typeof ${input.val} === 'number' && Number.isInteger(${input.val}) && ${input.val} >= ${min} && ${input.val} <= ${max}) {
            ${input.targetVal} = ${input.val};
        } else {
            $fallback("${input.instancePath}", "${input.schemaPath}", "Expected valid integer between ${min} and ${max}");
        }`;

    if (input.schema.nullable) {
        return `if (${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`;
    }
    return mainTemplate;
}

export function timestampTemplate(
    input: TemplateInput<AScalarSchema<"timestamp">>,
) {
    const mainTemplate = `if (typeof ${input.val} === 'object' && ${input.val} instanceof Date) {
        ${input.targetVal} = ${input.val};
    } else if (typeof ${input.val} === 'string') {
        ${input.targetVal} = new Date(${input.val});
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}", "Expected instanceof Date or ISO Date string at ${input.instancePath}")
    }`;
    if (input.schema.nullable) {
        return `if (${input.val} === null) {
            ${input.targetVal} = null
        } else {
            ${mainTemplate}
        }`;
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
    const mainTemplate = `if (typeof ${input.val} === 'string' && (${enumTemplate})) {
            ${input.targetVal} = ${input.val};
        } else {
            $fallback("${input.instancePath}", "${input.schemaPath}", "${errorMessage}");
        }`;

    if (input.schema.nullable) {
        return `if(${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`;
    }
    return mainTemplate;
}

function objectTemplate(input: TemplateInput<AObjectSchema>): string {
    const parsingParts: string[] = [];
    const targetVal = `objectVal`;
    if (input.discriminatorKey && input.discriminatorValue) {
        parsingParts.push(
            `${targetVal}.${input.discriminatorKey} = "${input.discriminatorValue}";`,
        );
    }
    for (const key of Object.keys(input.schema.properties)) {
        const subSchema = input.schema.properties[key];
        const innerTemplate = schemaTemplate({
            val: `${input.val}.${key}`,
            targetVal: `${targetVal}.${key}`,
            schema: subSchema,
            instancePath: `${input.instancePath}/${key}`,
            schemaPath: `${input.schemaPath}/properties/${key}`,
            subFunctionBodies: input.subFunctionBodies,
            subFunctionNames: input.subFunctionNames,
        });
        parsingParts.push(innerTemplate);
    }
    if (input.schema.optionalProperties) {
        for (const key of Object.keys(input.schema.optionalProperties)) {
            const subSchema = input.schema.optionalProperties[key];
            const innerTemplate = schemaTemplate({
                val: `${input.val}.${key}`,
                targetVal: `${targetVal}.${key}`,
                schema: subSchema,
                instancePath: `${input.instancePath}/${key}`,
                schemaPath: `${input.schemaPath}/optionalProperties/${key}`,
                subFunctionBodies: input.subFunctionBodies,
                subFunctionNames: input.subFunctionNames,
            });
            parsingParts.push(`if (typeof ${input.val}.${key} === 'undefined') {
                // ignore undefined
            } else {
                ${innerTemplate}
            }`);
        }
    }
    const mainTemplate = `if (typeof ${input.val} === 'object' && ${
        input.val
    } !== null) {
        const ${targetVal} = {}
        ${parsingParts.join("\n")}
        ${input.targetVal} = ${targetVal};
    } else {
        $fallback("${input.instancePath}", "${
            input.schemaPath
        }", "Expected object");
    }`;
    if (input.schema.nullable) {
        return `if(${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`;
    }
    return mainTemplate;
}

export function arraySchema(input: TemplateInput<AArraySchema<any>>): string {
    const innerTemplate = schemaTemplate({
        val: `item`,
        targetVal: "itemResult",
        instancePath: `${input.instancePath}/[0]`,
        schemaPath: `${input.schemaPath}/elements`,
        schema: input.schema.elements,
        subFunctionBodies: input.subFunctionBodies,
        subFunctionNames: input.subFunctionNames,
    });
    const mainTemplate = `if (Array.isArray(${input.val})) {
        const innerResult = [];
        for(const item of ${input.val}) {
            let itemResult;
            ${innerTemplate}
            innerResult.push(itemResult);
        }
        ${input.targetVal} = innerResult;
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}", "Expected Array");
    }`;

    if (input.schema.nullable) {
        return `if (${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`;
    }
    return mainTemplate;
}

export function recordSchema(input: TemplateInput<ARecordSchema<any>>): string {
    const innerTemplate = schemaTemplate({
        schema: input.schema.values,
        instancePath: `${input.instancePath}`,
        schemaPath: `${input.schemaPath}/values`,
        val: `${input.val}[key]`,
        targetVal: `keyVal`,
        subFunctionBodies: input.subFunctionBodies,
        subFunctionNames: input.subFunctionNames,
    });

    const mainTemplate = `if (typeof ${input.val} === 'object' && ${input.val} !== null) {
        const innerResult = {}
        for (const key of Object.keys(${input.val})) {
            let keyVal;
            ${innerTemplate}
            innerResult[key] = keyVal;
        }
        ${input.targetVal} = innerResult;
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}", "Expected Object.");
    }`;
    if (input.schema.nullable) {
        return `if (${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`;
    }
    return mainTemplate;
}

export function discriminatorSchema(
    input: TemplateInput<ADiscriminatorSchema<any>>,
): string {
    const switchParts: string[] = [];
    const types = Object.keys(input.schema.mapping);
    for (const type of types) {
        const innerSchema = input.schema.mapping[type];
        const template = objectTemplate({
            val: input.val,
            targetVal: input.targetVal,
            schema: innerSchema,
            schemaPath: `${input.schemaPath}/mapping`,
            instancePath: `${input.instancePath}`,
            subFunctionBodies: input.subFunctionBodies,
            subFunctionNames: input.subFunctionNames,
            discriminatorKey: input.schema.discriminator,
            discriminatorValue: type,
        });
        switchParts.push(`case "${type}": {
            ${template}
            break;
        }`);
    }
    const mainTemplate = `if (typeof ${input.val} === 'object' && ${
        input.val
    } !== null) {
        switch(${input.val}.${input.schema.discriminator}) {
            ${switchParts.join("\n")}
            default:
                $fallback("${input.instancePath}", "${
                    input.schemaPath
                }/mapping", "${input.val}.${
                    input.schema.discriminator
                } did not match one of the specified values");
                break;
        }
    } else {
        $fallback("${input.instancePath}", "${
            input.schemaPath
        }", "Expected Object.");
    }`;
    if (input.schema.nullable) {
        return `if (${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`;
    }
    return mainTemplate;
}
