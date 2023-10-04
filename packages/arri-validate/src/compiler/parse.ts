import { type Type } from "@modii/jtd";
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
            case "timestamp":
            case "float64":
            case "float32":
            case "int32":
            case "int16":
            case "int8":
            case "uint32":
            case "uint16":
            case "uint8":
                break;
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
        const mainTemplate = `typeof ${input.val} === 'string' && (${input.val} === 'true' || ${input}`;
    }
    const mainTemplate = `typeof ${input.val} === 'boolean' ? ${input.val} : $fallback(${input.instancePath}, ${input.schemaPath}/type, "Expected boolean. Got " + typeof ${input.val})`;
    if (input.schema.nullable) {
        return `${input.val} === null ? null : ${mainTemplate}`;
    }
    return mainTemplate;
}
