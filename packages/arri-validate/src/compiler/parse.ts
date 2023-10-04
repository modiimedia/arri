import { type Type } from "@modii/jtd";
import { type AScalarSchema, isAScalarSchema } from "../schemas";
import { type TemplateInput } from "./common";

export function createParsingTemplate(input: TemplateInput): string {
    return ``;
}

export function schemaTemplate(input: TemplateInput): string {
    if (isAScalarSchema(input.schema)) {
        switch (input.schema.type as Type) {
            case "boolean":
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
}

function booleanTemplate(
    input: TemplateInput<AScalarSchema<"boolean">>,
): string {
    if (input.schema.nullable) {
        const blah = JSON.parse("", (key, value) => {});
    }
}
