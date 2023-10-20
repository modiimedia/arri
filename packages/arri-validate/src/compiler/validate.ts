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
    isAScalarSchema,
    type ASchema,
    type AScalarSchema,
    isAObjectSchema,
    type AObjectSchema,
    isAStringEnumSchema,
    type AStringEnumSchema,
    isAAraySchema,
    type AArraySchema,
    isARecordSchema,
    type ARecordSchema,
    isADiscriminatorSchema,
    type ADiscriminatorSchema,
} from "../schemas";
import { type Type, type TemplateInput } from "./common";

export function createValidationTemplate(
    inputName: string,
    schema: ASchema<any>,
) {
    const subFunctionNames: string[] = [];
    const subFunctionBodies: string[] = [];
    const template = schemaTemplate({
        val: inputName,
        targetVal: "",
        schema,
        schemaPath: ``,
        instancePath: "",
        subFunctionBodies,
        subFunctionNames,
    });

    return `${subFunctionBodies.join("\n")}
    return ${template}`;
}

function schemaTemplate(input: TemplateInput): string {
    if (isAScalarSchema(input.schema)) {
        switch (input.schema.type as Type) {
            case "boolean":
                return booleanTemplate(input);
            case "float32":
            case "float64":
                return floatTemplate(input);
            case "int8":
                return intTemplate(input, int8Min, int8Max);
            case "int16":
                return intTemplate(input, int16Min, int16Max);
            case "int32":
                return intTemplate(input, int32Min, int32Max);
            case "uint8":
                return intTemplate(input, uint8Min, uint8Max);
            case "uint16":
                return intTemplate(input, uint16Min, uint16Max);
            case "uint32":
                return intTemplate(input, uint32Min, uint32Max);
            case "int64":
                return bigIntTemplate(input, false);
            case "uint64":
                return bigIntTemplate(input, true);
            case "string":
                return stringTemplate(input);
            case "timestamp":
                return timestampTemplate(input);
        }
    }
    if (isAObjectSchema(input.schema)) {
        return objectTemplate(input);
    }
    if (isAStringEnumSchema(input.schema)) {
        return enumTemplate(input);
    }
    if (isAAraySchema(input.schema)) {
        return arrayTemplate(input);
    }
    if (isARecordSchema(input.schema)) {
        return recordTemplate(input);
    }
    if (isADiscriminatorSchema(input.schema)) {
        return discriminatorTemplate(input);
    }

    // any types always return true
    return "true";
}

function booleanTemplate(
    input: TemplateInput<AScalarSchema<"boolean">>,
): string {
    if (input.schema.nullable) {
        return `(${input.val} === null || typeof ${input.val} === 'boolean')`;
    }
    return `typeof ${input.val} === 'boolean'`;
}

function floatTemplate(
    input: TemplateInput<AScalarSchema<"float32" | "float64">>,
): string {
    if (input.schema.nullable) {
        return `((typeof ${input.val} === 'number' && !Number.isNaN(${input.val})) || ${input.val} === null)`;
    }
    return `(typeof ${input.val} === 'number' && !Number.isNaN(${input.val}))`;
}

function intTemplate(
    input: TemplateInput<
        AScalarSchema<
            "int16" | "int32" | "int8" | "uint16" | "uint32" | "uint8"
        >
    >,
    min: number,
    max: number,
): string {
    if (input.schema.nullable) {
        return `((typeof ${input.val} === 'number' && Number.isInteger(${input.val}) && ${input.val} >= ${min} && ${input.val} <= ${max}) || ${input.val} === null)`;
    }
    return `(typeof ${input.val} === 'number' && Number.isInteger(${input.val}) && ${input.val} >= ${min} && ${input.val} <= ${max})`;
}

function bigIntTemplate(
    input: TemplateInput<AScalarSchema<"int64" | "uint64">>,
    isUnsigned = false,
) {
    const mainTemplate = isUnsigned
        ? `typeof ${input.val} === 'bigint' && ${input.val} >= BigInt("0")`
        : `typeof ${input.val} === 'bigint'`;
    if (input.schema.nullable) {
        return `(${mainTemplate}) || ${input.val} === null`;
    }
    return mainTemplate;
}

function stringTemplate(input: TemplateInput<AScalarSchema<"string">>): string {
    if (input.schema.nullable) {
        return `(typeof ${input.val} === 'string' || ${input.val} === null)`;
    }
    return `typeof ${input.val} === 'string'`;
}

function timestampTemplate(
    input: TemplateInput<AScalarSchema<"timestamp">>,
): string {
    if (input.schema.nullable) {
        return `((typeof ${input.val} === 'object' && ${input.val} instanceof Date) || ${input.val} === null)`;
    }
    return `typeof ${input.val} === 'object' && ${input.val}  instanceof Date`;
}

function objectTemplate(input: TemplateInput<AObjectSchema<any>>): string {
    const parts: string[] = [];
    if (input.discriminatorKey && input.discriminatorValue) {
        parts.push(
            `${input.val}.${input.discriminatorKey} === "${input.discriminatorValue}"`,
        );
    }
    for (const key of Object.keys(input.schema.properties)) {
        const prop = input.schema.properties[key];
        parts.push(
            schemaTemplate({
                schema: prop,
                schemaPath: `${input.schemaPath}/properties/${key}`,
                instancePath: `${input.instancePath}/${key}`,
                val: `${input.val}.${key}`,
                targetVal: "",
                subFunctionBodies: input.subFunctionBodies,
                subFunctionNames: input.subFunctionNames,
            }),
        );
    }
    if (input.schema.optionalProperties) {
        for (const key of Object.keys(input.schema.optionalProperties)) {
            const prop = input.schema.optionalProperties;
            parts.push(
                schemaTemplate({
                    schema: prop,
                    schemaPath: `${input.schemaPath}/optionalProperties/${key}`,
                    instancePath: `${input.instancePath}/${key}`,
                    val: `${input.val}.${key}`,
                    targetVal: "",
                    subFunctionBodies: input.subFunctionBodies,
                    subFunctionNames: input.subFunctionNames,
                }),
            );
        }
    }
    const mainTemplate = `typeof ${input.val} === 'object' && ${
        input.val
    } !== null && ${parts.join(" && ")}`;
    if (input.schema.nullable) {
        return `((${mainTemplate}) || ${input.val} === null)`;
    }
    return mainTemplate;
}

function enumTemplate(
    input: TemplateInput<AStringEnumSchema<string[]>>,
): string {
    const enumPart = input.schema.enum
        .map((val) => `${input.val} === "${val}"`)
        .join(" || ");
    if (input.schema.nullable) {
        return `((typeof ${input.val} === 'string' && (${enumPart})) || ${input.val} === null)`;
    }
    return `(typeof ${input.val} === 'string' && (${enumPart}))`;
}

function arrayTemplate(input: TemplateInput<AArraySchema<any>>) {
    const innerTemplate = schemaTemplate({
        val: "item",
        instancePath: `${input.instancePath}/item`,
        schemaPath: `${input.schemaPath}/elements`,
        schema: input.schema.elements,
        targetVal: "",
        subFunctionBodies: input.subFunctionBodies,
        subFunctionNames: input.subFunctionNames,
    });

    if (input.schema.nullable) {
        return `((Array.isArray(${input.val}) && ${input.val}.every((item) => ${innerTemplate})) || ${input.val} === null)`;
    }
    return `(Array.isArray(${input.val}) && ${input.val}.every((item) => ${innerTemplate}))`;
}

function recordTemplate(input: TemplateInput<ARecordSchema<any>>): string {
    const subTemplate = schemaTemplate({
        schema: input.schema.values,
        instancePath: `${input.instancePath}`,
        schemaPath: `${input.schemaPath}/values`,
        val: `${input.val}[key]`,
        targetVal: "",
        subFunctionBodies: input.subFunctionBodies,
        subFunctionNames: input.subFunctionNames,
    });
    const mainTemplate = `typeof ${input.val} === 'object' && ${input.val} !== null && Object.keys(${input.val}).every((key) => ${subTemplate})`;
    if (input.schema.nullable) {
        return `((${mainTemplate}) || ${input.val} === null)`;
    }
    return mainTemplate;
}

function discriminatorTemplate(
    input: TemplateInput<ADiscriminatorSchema<any>>,
): string {
    const parts: string[] = [];
    for (const discriminatorVal of Object.keys(input.schema.mapping)) {
        const subSchema = input.schema.mapping[discriminatorVal];
        parts.push(
            objectTemplate({
                val: input.val,
                targetVal: "",
                schema: subSchema,
                schemaPath: `${input.schemaPath}/mapping/${discriminatorVal}`,
                instancePath: input.instancePath,
                discriminatorKey: input.discriminatorKey,
                discriminatorValue: discriminatorVal,
                subFunctionBodies: input.subFunctionBodies,
                subFunctionNames: input.subFunctionNames,
            }),
        );
    }
    const mainTemplate = `typeof ${input.val} === 'object' && ${
        input.val
    } !== null && (${parts.join(" || ")})`;
    if (input.schema.nullable) {
        return `((${mainTemplate}) || ${input.val} === null)`;
    }
    return mainTemplate;
}
