import {
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormType,
    isSchemaFormValues,
    type SchemaFormEnum,
    type Schema,
    type SchemaFormType,
    type SchemaFormValues,
    type SchemaFormProperties,
    type SchemaFormElements,
    type SchemaFormDiscriminator,
} from "jtd-utils";
import { camelCase } from "scule";
import { randomUUID } from "uncrypto";
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
import { type TemplateInput } from "./common";

export function createParsingTemplate(input: string, schema: Schema): string {
    const validationErrorName = `$ValidationError${camelCase(
        schema.metadata?.id ?? randomUUID(),
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
        targetVal: "result",
        schema,
        instancePath: "",
        schemaPath: "",
        subFunctionBodies: functionBodyParts,
        subFunctionNames: functionNameParts,
    });

    if (
        isSchemaFormProperties(schema) ||
        isSchemaFormValues(schema) ||
        isSchemaFormElements(schema) ||
        isSchemaFormDiscriminator(schema)
    ) {
        jsonParseCheck = `if (typeof ${input} === 'string') {
            const json = JSON.parse(${input});
            let result = {};
            ${jsonTemplate}
            return result;
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
    if (isSchemaFormType(input.schema)) {
        switch (input.schema.type) {
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
            case "int64":
                return bigIntTemplate(input, false);
            case "uint64":
                return bigIntTemplate(input, true);
        }
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
    return `${input.val}`;
}

function booleanTemplate(input: TemplateInput<SchemaFormType>): string {
    const errorMessage = input.instancePath.length
        ? `Expected boolean for ${input.instancePath}`
        : `Expected boolean`;
    const templateParts: string[] = [];
    if (input.instancePath.length === 0) {
        templateParts.push(`if (typeof ${input.val} === 'string') {
            if (${input.val} === 'true') {
                ${input.targetVal} = true;
            }
            if (${input.val} === 'false') {
                ${input.targetVal} = false;
            }`);
        if (input.schema.nullable) {
            templateParts.push(`if (${input.val} === 'null') {
                ${input.targetVal} = null;
            }`);
        }
        templateParts.push(
            `$fallback("${input.instancePath}", "${input.schemaPath}/type", "${errorMessage}");`,
        );
        templateParts.push("}");
    }
    const mainTemplate = `if (typeof ${input.val} === 'boolean') {
        ${input.targetVal} = ${input.val};
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}/type", "${errorMessage}");
    }`;
    if (input.schema.nullable) {
        templateParts.push(`if (${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`);
    } else {
        templateParts.push(mainTemplate);
    }
    return templateParts.join("\n");
}

export function stringTemplate(input: TemplateInput<SchemaFormType>): string {
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

function getVarName(input: string): string {
    return camelCase(
        input.split(".").join("_").split("[").join("_").split("]").join("_"),
    );
}

export function floatTemplate(input: TemplateInput<SchemaFormType>): string {
    const valName = getVarName(`${input.val}Val`);
    const templateParts: string[] = [];
    if (input.instancePath.length === 0) {
        templateParts.push(`if (typeof ${input.val} === 'string') {
            const ${valName} = Number(${input.val});
            if (!Number.isNaN(parsedVal)) {
                ${input.targetVal} = ${valName};
            }`);
        if (input.schema.nullable) {
            templateParts.push(`if (${input.val} === 'null') {
                ${input.targetVal} = null;
            }`);
        }
        templateParts.push(
            `$fallback("${input.instancePath}", "${input.schemaPath}/type", \`Could not parse number from \${${input.val}}\`);`,
        );
        templateParts.push("}");
    }
    const errorMessage = `Expected number at ${input.instancePath}`;
    const mainTemplate = `if (typeof ${input.val} === 'number' && !Number.isNaN(${input.val})) {
        ${input.targetVal} = ${input.val};
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}/type", "${errorMessage}");
    }`;
    if (input.schema.nullable) {
        templateParts.push(`if (${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`);
    } else {
        templateParts.push(mainTemplate);
    }
    return templateParts.join("\n");
}

export function intTemplate(
    input: TemplateInput<SchemaFormType>,
    min: number,
    max: number,
) {
    const templateParts: string[] = [];

    if (input.instancePath.length === 0) {
        templateParts.push(`if (typeof ${input.val} === 'string') {
            const parsedVal = Number(${input.val});
            if (Number.isInteger(parsedVal) && parsedVal >= ${min} && parsedVal <= ${max}) {
                ${input.targetVal} = ${input.val};
            }`);
        if (input.schema.nullable) {
            templateParts.push(`if (${input.val} === 'null') {
                ${input.targetVal} = null;
            }`);
        }
        templateParts.push(
            `$fallback("${input.instancePath}", "${input.schemaPath}", "Expected valid integer between ${min} and ${max});`,
        );
        templateParts.push("}");
    }
    const mainTemplate = `if (typeof ${input.val} === 'number' && Number.isInteger(${input.val}) && ${input.val} >= ${min} && ${input.val} <= ${max}) {
            ${input.targetVal} = ${input.val};
        } else {
            $fallback("${input.instancePath}", "${input.schemaPath}", "Expected valid integer between ${min} and ${max}");
        }`;

    if (input.schema.nullable) {
        templateParts.push(`if (${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`);
    } else {
        templateParts.push(mainTemplate);
    }
    return templateParts.join("\n");
}

export function bigIntTemplate(
    input: TemplateInput<SchemaFormType>,
    isUnsigned: boolean,
): string {
    const templateParts: string[] = [];
    templateParts.push(`if (typeof ${input.val} === 'string') {`);
    if (input.instancePath.length === 0 && input.schema.nullable) {
        templateParts.push(`if (${input.val} === 'null') {
            ${input.targetVal} = null;
        } else {`);
    }
    templateParts.push(`try { 
        const val = BigInt(${input.val});`);
    if (isUnsigned) {
        templateParts.push(`if (val >= BigInt("0")) {
            ${input.targetVal} = val;
        } else {
            $fallback("${input.instancePath}", "${input.schemaPath}", "Unsigned int must be greater than or equal to 0.");
        }`);
    } else {
        templateParts.push(`${input.targetVal} = val;`);
    }
    templateParts.push(`} catch(err) {
        $fallback("${input.instancePath}", "${input.schemaPath}", "Unable to parse BigInt from ${input.val}.");
    }`);
    if (input.instancePath.length === 0 && input.schema.nullable) {
        templateParts.push("}");
    }
    templateParts.push("}");
    if (isUnsigned) {
        templateParts.push(`else if (typeof ${input.val} === 'bigint') {
        if (${input.val} >= BigInt("0")) {
            ${input.targetVal} = ${input.val};
        } else {
            $fallback("${input.instancePath}", "${input.schemaPath}", "Unsigned int must be greater than or equal to 0.");
        }
    } else if (typeof ${input.val} === 'number') {
        if (${input.val} >= 0) {
            ${input.targetVal} = BigInt(${input.val});
        } else {
            $fallback("${input.instancePath}", "${input.schemaPath}", "Unsigned int must be greater than or equal to 0.");
        }
    }`);
    } else {
        templateParts.push(`else if (typeof ${input.val} === 'bigint') {
            ${input.targetVal} = ${input.val};
        } else if (typeof ${input.val} === 'number') {
            ${input.targetVal} = BigInt(${input.val});
        }`);
    }
    if (input.schema.nullable) {
        templateParts.push(`else if (${input.val} === null) {
            ${input.targetVal} = null;
        }`);
    }
    templateParts.push(`else {
        $fallback("${input.instancePath}", "${input.schemaPath}", "Expected BigInt or Integer string.");
    }`);
    return templateParts.join("\n");
}

export function timestampTemplate(input: TemplateInput<SchemaFormType>) {
    const templateParts: string[] = [];
    if (input.instancePath.length === 0) {
        templateParts.push(`if (typeof ${input.val} === 'string') {
            const parsedVal = new Date(${input.val});
            if (!Number.isNaN(parsedVal.getMonth())) {
                ${input.targetVal} = parsedVal;
            }`);
        if (input.schema.nullable) {
            templateParts.push(`if (${input.val} === 'null') {
                ${input.targetVal} = null;
            }`);
        }
        templateParts.push(
            `$fallback("${input.instancePath}", "${input.schemaPath}", "Expected instanceof Date or ISO Date string");`,
        );
        templateParts.push("}");
    }
    const mainTemplate = `if (typeof ${input.val} === 'object' && ${input.val} instanceof Date) {
        ${input.targetVal} = ${input.val};
    } else if (typeof ${input.val} === 'string') {
        ${input.targetVal} = new Date(${input.val});
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}", "Expected instanceof Date or ISO Date string at ${input.instancePath}")
    }`;
    if (input.schema.nullable) {
        templateParts.push(`if (${input.val} === null) {
            ${input.targetVal} = null
        } else {
            ${mainTemplate}
        }`);
    } else {
        templateParts.push(mainTemplate);
    }
    return templateParts.join("\n");
}

function enumTemplate(input: TemplateInput<SchemaFormEnum>): string {
    const enumTemplate = input.schema.enum
        .map((val) => `${input.val} === "${val}"`)
        .join(" || ");
    const errorMessage = `Expected one of the following values: [${input.schema.enum.join(
        ", ",
    )}]${input.instancePath.length ? ` at ${input.instancePath}` : ""}.`;
    const templateParts: string[] = [];
    templateParts.push(`if (typeof ${input.val} === 'string') {
        if (${enumTemplate}) {
            ${input.targetVal} = ${input.val};
        }
    `);
    if (input.instancePath.length === 0 && input.schema.nullable) {
        templateParts.push(`else if (${input.val} === 'null') {
            ${input.targetVal} = null;
        }`);
    }
    templateParts.push(
        `else {
            $fallback("${input.instancePath}", "${input.schemaPath}", "${errorMessage}"); 
        }
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}", "${errorMessage}");
    }`,
    );
    const mainTemplate = templateParts.join("\n");
    if (input.schema.nullable) {
        return `if (${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`;
    }
    return mainTemplate;
}

function objectTemplate(input: TemplateInput<SchemaFormProperties>): string {
    const innerTargetVal = camelCase(
        `${input.val
            .split(".")
            .join("_")
            .split("[")
            .join("_")
            .split("]")
            .join("")}_innerVal`,
    );
    const parsingParts: string[] = [];
    if (input.discriminatorKey && input.discriminatorValue) {
        parsingParts.push(
            `${innerTargetVal}.${input.discriminatorKey} = "${input.discriminatorValue}";`,
        );
    }
    for (const key of Object.keys(input.schema.properties)) {
        const subSchema = input.schema.properties[key];
        const innerTemplate = schemaTemplate({
            val: `${input.val}.${key}`,
            targetVal: `${innerTargetVal}.${key}`,
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
                targetVal: `${innerTargetVal}.${key}`,
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
        const ${innerTargetVal} = {};
        ${parsingParts.join("\n")}
        ${input.targetVal} = ${innerTargetVal};
    } else {
        $fallback("${input.instancePath}", "${
            input.schemaPath
        }", "Expected object");
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

export function arrayTemplate(
    input: TemplateInput<SchemaFormElements>,
): string {
    const resultVar = camelCase(
        `${input.targetVal
            .split(".")
            .join("_")
            .split("[")
            .join("_")
            .split("]")
            .join("_")}_innerResult`,
    );
    const itemVar = `${resultVar}Item`;
    const itemResultVar = `${itemVar}Result`;

    const innerTemplate = schemaTemplate({
        val: itemVar,
        targetVal: itemResultVar,
        instancePath: `${input.instancePath}/[0]`,
        schemaPath: `${input.schemaPath}/elements`,
        schema: input.schema.elements,
        subFunctionBodies: input.subFunctionBodies,
        subFunctionNames: input.subFunctionNames,
    });
    const mainTemplate = `if (Array.isArray(${input.val})) {
        const ${resultVar} = [];
        for(const ${itemVar} of ${input.val}) {
            let ${itemResultVar};
            ${innerTemplate}
            ${resultVar}.push(${itemResultVar});
        }
        ${input.targetVal} = ${resultVar};
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

export function discriminatorTemplate(
    input: TemplateInput<SchemaFormDiscriminator>,
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

export function recordTemplate(input: TemplateInput<SchemaFormValues>): string {
    const valPrefix = camelCase(
        input.val
            .split(".")
            .join("_")
            .split("[")
            .join("_")
            .split("]")
            .join("_"),
    );
    const resultVal = `${valPrefix}Result`;
    const loopVal = `${valPrefix}Key`;
    const loopResultVal = `${loopVal}Val`;
    const innerTemplate = schemaTemplate({
        val: `${input.val}[${loopVal}]`,
        targetVal: loopResultVal,
        instancePath: `${input.instancePath}/[key]`,
        schemaPath: `${input.schemaPath}/values`,
        schema: input.schema.values,
        subFunctionBodies: input.subFunctionBodies,
        subFunctionNames: input.subFunctionNames,
    });
    const mainTemplate = `if (typeof ${input.val} === 'object' && ${input.val} !== null) {
        const ${resultVal} = {};
        for(const ${loopVal} of Object.keys(${input.val})) {
            let ${loopResultVal};
            ${innerTemplate};
            ${resultVal}[${loopVal}] = ${loopResultVal};
        }
        ${input.targetVal} = ${resultVal};
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}", "Expected object.");
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
