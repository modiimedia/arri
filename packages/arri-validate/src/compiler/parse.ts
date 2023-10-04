import { type Type } from "@modii/jtd";
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
import { type AScalarSchema, isAScalarSchema } from "../schemas";
import { type TemplateInput } from "./common";

export function createParsingTemplate(input: TemplateInput): string {
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
        throw new $ValidationError(instancePath, schemaPath, message)
    }`;
    return ``;
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
    return `${input.val}`;
}

function booleanTemplate(
    input: TemplateInput<AScalarSchema<"boolean">>,
): string {
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
        const mainTemplate = `typeof ${input.val} === 'string' && (${
            input.val
        } === 'true' || ${input.val} === 'false') ? ${
            input.val
        } === 'true' : typeof ${input.val} === 'boolean' ? ${
            input.val
        } : $fallback(${
            (input.instancePath,
            input.schemaPath,
            `Expected boolean for "${input.val}"`)
        })`;
        if (input.schema.nullable) {
            return `${input.val} === null ? null : ${mainTemplate}`;
        }
        return mainTemplate;
    }
    const mainTemplate = `typeof ${input.val} === 'boolean' ? ${input.val} : $fallback(${input.instancePath}, ${input.schemaPath}/type, "Expected boolean at ${input.val}. Got " + typeof ${input.val})`;
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate}`;
    }
    return mainTemplate;
}

export function stringTemplate(
    input: TemplateInput<AScalarSchema<"string">>,
): string {
    const mainTemplate = `typeof ${input.val} === 'string' ? ${input.val} : $fallback(${input.instancePath}. ${input.schemaPath}, "Expected string at ${input.val}.")`;
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate}`;
    }
    return mainTemplate;
}

export function floatTemplate(
    input: TemplateInput<AScalarSchema<"float32" | "float64">>,
): string {
    const mainTemplate = `typeof ${input.val} === 'number' ? ${input.val} : $fallback(${input.instancePath}, ${input.schemaPath}, "Expected float at ${input.val}")`;
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
    const mainTemplate = `typeof ${input.val} === 'number' && Number.isInteger(${input.val}) && ${input.val} >= ${min} && ${input.val} <= ${max} ? ${input.val} : $fallback(${input.instancePath}, ${input.schemaPath}, "Expected integer between ${min} and ${max} at ${input.val}")`;
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate}`;
    }
    return mainTemplate;
}

export function timestampTemplate(
    input: TemplateInput<AScalarSchema<"timestamp">>,
) {
    const mainTemplate = `typeof ${input.val} === 'object' && ${input.val} instance of Date ? ${input.val} : typeof ${input.val} === 'string' ? new Date(${input.val}) : $fallback(${input.instancePath} ${input.schemaPath}, "Expected instance of Date or ISO Date string at ${input.val})`;
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate}`;
    }
    return mainTemplate;
}
