import {
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEmpty,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormRef,
    isSchemaFormType,
    isSchemaFormValues,
    type Schema,
    type SchemaFormDiscriminator,
    type SchemaFormElements,
    type SchemaFormEmpty,
    type SchemaFormEnum,
    type SchemaFormProperties,
    type SchemaFormRef,
    type SchemaFormType,
    type SchemaFormValues,
} from '@arrirpc/type-defs';
import { camelCase } from 'scule';

import {
    int8Max,
    int8Min,
    int16Max,
    int16Min,
    int32Max,
    int32Min,
    uint8Max,
    uint8Min,
    uint16Max,
    uint16Min,
    uint32Max,
    uint32Min,
} from '../lib/numberConstants';
import { inputRequiresTransformation, type TemplateInput } from './common';

export function createParsingTemplate(
    input: string,
    schema: Schema,
    shouldCoerce = false,
): string {
    const fallbackTemplate = `
    function $fallback(instancePath, schemaPath, message) {
        context.errors.push({
            message: message,
            instancePath: instancePath,
            schemaPath: schemaPath,
        })
    }`;
    let jsonParseCheck = '';

    const subFunctions: Record<string, string> = {};
    const requiresTransformation =
        !shouldCoerce && inputRequiresTransformation(schema);
    const template = schemaTemplate({
        val: input,
        targetVal: 'result',
        schema,
        instancePath: '',
        schemaPath: '',
        subFunctions,
        shouldCoerce: shouldCoerce,
        requiresTransformation: requiresTransformation,
    });
    const jsonTemplate = schemaTemplate({
        val: 'json',
        targetVal: 'result',
        schema,
        instancePath: '',
        schemaPath: '',
        subFunctions,
        shouldCoerce: shouldCoerce,
        requiresTransformation: requiresTransformation,
    });

    if (
        isSchemaFormProperties(schema) ||
        isSchemaFormValues(schema) ||
        isSchemaFormElements(schema) ||
        isSchemaFormDiscriminator(schema)
    ) {
        jsonParseCheck = `if (typeof ${input} === 'string') {
            const json = JSON.parse(${input});
            ${requiresTransformation ? `let result = {};` : ''};
            ${jsonTemplate}
            ${requiresTransformation ? `return result;` : `return ${input};`}
        }`;
    }

    if (isSchemaFormEmpty(schema)) {
        jsonParseCheck = `try {
            const json = JSON.parse(${input});
            return json;
        } catch {
            return ${input};
        }`;
    }

    const functionBodyParts = Object.keys(subFunctions).map(
        (key) => subFunctions[key],
    );
    const finalTemplate = `${fallbackTemplate}
    ${functionBodyParts.join('\n')}
    ${jsonParseCheck}
    ${requiresTransformation ? `let result = {};` : `return ${input};`}
    ${template}
    ${requiresTransformation ? `return result;` : `return ${input};`}`;
    return finalTemplate;
}

export function schemaTemplate(input: TemplateInput): string {
    if (isSchemaFormType(input.schema)) {
        switch (input.schema.type) {
            case 'boolean':
                return booleanTemplate(input);
            case 'string':
                return stringTemplate(input);
            case 'timestamp':
                return timestampTemplate(input);
            case 'float64':
            case 'float32':
                return floatTemplate(input);
            case 'int32':
                return intTemplate(input, int32Min, int32Max);
            case 'int16':
                return intTemplate(input, int16Min, int16Max);
            case 'int8':
                return intTemplate(input, int8Min, int8Max);
            case 'uint32':
                return intTemplate(input, uint32Min, uint32Max);
            case 'uint16':
                return intTemplate(input, uint16Min, uint16Max);
            case 'uint8':
                return intTemplate(input, uint8Min, uint8Max);
            case 'int64':
                return bigIntTemplate(input, false);
            case 'uint64':
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
    if (isSchemaFormRef(input.schema)) {
        return refTemplate(input);
    }
    return anyTemplate(input);
}

export function anyTemplate(input: TemplateInput<SchemaFormEmpty>): string {
    if (input.instancePath.length === 0) {
        return `try {
            ${input.targetVal} = JSON.parse(${input.val});
        } catch {
            ${input.targetVal} = ${input.val};
        }`;
    }
    return maybeInclude(
        `${input.targetVal} = ${input.val}`,
        input.requiresTransformation,
    );
}

function maybeInclude(input: string, requiresTransformation: boolean) {
    if (requiresTransformation) {
        return input;
    }
    return '';
}

export function booleanTemplate(input: TemplateInput<SchemaFormType>): string {
    const errorMessage = 'expected boolean';
    const templateParts: string[] = [];
    if (input.shouldCoerce) {
        templateParts.push(`if (${input.val} === true || ${input.val} === 'true' || ${input.val} === 'TRUE' || ${input.val} === 1 || ${input.val} === '1') {
                ${input.targetVal} = true;
            }
            else if (${input.val} === false || ${input.val} === 'false' || ${input.val} === 'FALSE' || ${input.val} === 0 || ${input.val} === '0') {
                ${input.targetVal} = false;
            }`);
        if (input.schema.nullable) {
            templateParts.push(`else if (${input.val} === null || ${input.val} === 'null') {
                    ${input.targetVal} = null;
                }`);
        }
        templateParts.push(
            `else {
                $fallback("${input.instancePath}", "${input.schemaPath}/type", "${errorMessage}");
            }`,
        );
        return templateParts.join('\n');
    }
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
        templateParts.push('}');
    }
    const mainTemplate = `if (typeof ${input.val} === 'boolean') {
        ${maybeInclude(`${input.targetVal} = ${input.val};`, input.requiresTransformation)}
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}/type", "${errorMessage}");
    }`;
    if (input.schema.nullable) {
        templateParts.push(`if (${input.val} === null) {
            ${maybeInclude(`${input.targetVal} = null`, input.requiresTransformation)};
        } else {
            ${mainTemplate}
        }`);
    } else {
        templateParts.push(mainTemplate);
    }
    return templateParts.join('\n');
}

export function stringTemplate(input: TemplateInput<SchemaFormType>): string {
    const errorMessage = `expected string`;
    const mainTemplate = `if (typeof ${input.val} === 'string') {
        ${maybeInclude(`${input.targetVal} = ${input.val};`, input.requiresTransformation)}
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}/type", "${errorMessage}");
    }`;
    if (input.schema.nullable) {
        return `if (${input.val} === null) {
            ${maybeInclude(`${input.targetVal} = ${input.val}`, input.requiresTransformation)}
        } else {
            ${mainTemplate}
        }`;
    }
    return mainTemplate;
}

function getVarName(input: string): string {
    return camelCase(
        input.split('.').join('_').split('[').join('_').split(']').join('_'),
    );
}

export function floatTemplate(input: TemplateInput<SchemaFormType>): string {
    const valName = getVarName(`${input.val}Val`);
    const templateParts: string[] = [];
    if (input.instancePath.length === 0 || input.shouldCoerce) {
        templateParts.push(`if (typeof ${input.val} === 'string') {
            const ${valName} = Number(${input.val});
            if (!Number.isNaN(${valName})) {
                ${maybeInclude(`${input.targetVal} = ${valName};`, input.requiresTransformation)}
            }`);
        if (input.schema.nullable) {
            templateParts.push(`else if (${input.val} === 'null') {
                ${maybeInclude(`${input.targetVal} = null;`, input.requiresTransformation)}
            }`);
        }
        templateParts.push(
            `else { 
                $fallback("${input.instancePath}", "${input.schemaPath}/type", \`Could not parse number from \${${input.val}}\`);
            }`,
        );
        templateParts.push('}');
    }
    const errorMessage = `Expected number at ${input.instancePath}`;
    const mainTemplate = `if (typeof ${input.val} === 'number' && !Number.isNaN(${input.val})) {
        ${maybeInclude(`${input.targetVal} = ${input.val};`, input.requiresTransformation)}
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}/type", "${errorMessage}");
    }`;
    if (input.schema.nullable) {
        templateParts.push(`${input.instancePath.length === 0 || input.shouldCoerce ? 'else ' : ''}if (${input.val} === null) {
            ${maybeInclude(`${input.targetVal} = null;`, input.requiresTransformation)}
        } else {
            ${mainTemplate}
        }`);
    } else {
        templateParts.push(
            `${input.instancePath.length === 0 || input.shouldCoerce ? 'else ' : ''}${mainTemplate}`,
        );
    }
    return templateParts.join('\n');
}

export function intTemplate(
    input: TemplateInput<SchemaFormType>,
    min: number,
    max: number,
) {
    const templateParts: string[] = [];
    const shouldCoerce = input.shouldCoerce || input.instancePath.length === 0;
    if (shouldCoerce) {
        templateParts.push(`if (typeof ${input.val} === 'string') {
            const parsedVal = Number(${input.val});
            if (Number.isInteger(parsedVal) && parsedVal >= ${min} && parsedVal <= ${max}) {
                ${input.targetVal} = parsedVal;
            }`);
        if (input.schema.nullable) {
            templateParts.push(`else if (${input.val} === 'null') {
                ${input.targetVal} = null;
            }`);
        }
        templateParts.push(
            `else {
                $fallback("${input.instancePath}", "${input.schemaPath}", "Expected valid integer between ${min} and ${max}");
            }`,
        );
        templateParts.push('}');
    }
    const mainTemplate = `if (typeof ${input.val} === 'number' && Number.isInteger(${input.val}) && ${input.val} >= ${min} && ${input.val} <= ${max}) {
            ${input.targetVal} = ${input.val};
        } else {
            $fallback("${input.instancePath}", "${input.schemaPath}", "Expected valid integer between ${min} and ${max}");
        }`;
    const prefix = shouldCoerce ? `else ` : '';
    if (input.schema.nullable) {
        templateParts.push(`${prefix}if (${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`);
    } else {
        templateParts.push(prefix + mainTemplate);
    }
    return templateParts.join('\n');
}

export function bigIntTemplate(
    input: TemplateInput<SchemaFormType>,
    isUnsigned: boolean,
): string {
    const templateParts: string[] = [];
    templateParts.push(
        `if (typeof ${input.val} === 'string' || typeof ${input.val} === 'number') {`,
    );
    if (
        (input.instancePath.length === 0 || input.shouldCoerce) &&
        input.schema.nullable
    ) {
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
        $fallback("${input.instancePath}", "${input.schemaPath}", \`Unable to parse BigInt from \${${input.val}}\`);
    }`);
    if (
        (input.instancePath.length === 0 || input.shouldCoerce) &&
        input.schema.nullable
    ) {
        templateParts.push('}');
    }
    templateParts.push('}');
    if (isUnsigned) {
        templateParts.push(`else if (typeof ${input.val} === 'bigint') {
        if (${input.val} >= BigInt("0")) {
            ${input.targetVal} = ${input.val};
        } else {
            $fallback("${input.instancePath}", "${input.schemaPath}", "Unsigned int must be greater than or equal to 0.");
        }
    }`);
    } else {
        templateParts.push(`else if (typeof ${input.val} === 'bigint') {
            ${input.targetVal} = ${input.val};
        }`);
    }
    if (input.schema.nullable) {
        templateParts.push(`else if (${input.val} === null) {
            ${input.targetVal} = null;
        }`);
    }
    templateParts.push(`else {
        $fallback("${input.instancePath}", "${input.schemaPath}", \`Expected BigInt or Integer string. Got \${${input.val}}\`);
    }`);
    return templateParts.join('\n');
}

export function timestampTemplate(input: TemplateInput<SchemaFormType>) {
    const templateParts: string[] = [];
    if (input.shouldCoerce) {
        return `if (typeof ${input.val} === 'string') {
            try {
                const parsedVal = new Date(${input.val});
                if (!Number.isNaN(parsedVal.getMonth())) {
                    ${input.targetVal} = parsedVal;
                } ${
                    input.schema.nullable
                        ? `else if (${input.val} === 'null') {
                                ${input.targetVal} = null;
                            }`
                        : ''
                } else {
                    $fallback("${input.instancePath}", "${input.schemaPath}", "Unable to coerce date"); 
                }
            } catch (err) {
                $fallback("${input.instancePath}", "${input.schemaPath}", "Unable to parse date"); 
            }    
        } else if (typeof ${input.val} === 'number') {
            const parsedVal = new Date(${input.val});
            if (!Number.isNaN(parsedVal.getMonth())) {
                ${input.targetVal} = parsedVal;
            } else {
                $fallback("${input.instancePath}", "${input.schemaPath}", "Unable to parse date");  
            }
        } else if (typeof ${input.val} === 'object' && ${input.val} instanceof Date) {
            ${input.targetVal} = ${input.val};
        }${
            input.schema.nullable
                ? ` else if (${input.val} === null) {
                    ${input.targetVal} = null;    
                }`
                : ''
        } else {
                $fallback("${input.instancePath}", "${input.schemaPath}", "Unable to parse date");  
            }`;
    }
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
        templateParts.push('}');
    }
    const mainTemplate = `if (typeof ${input.val} === 'object' && ${input.val} instanceof Date) {
        ${input.targetVal} = ${input.val};
    } else if (typeof ${input.val} === 'string') {
        ${input.targetVal} = new Date(${input.val});
    } else {
        $fallback("${input.instancePath}", "${input.schemaPath}", "Expected instanceof Date or ISO Date string")
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
    return templateParts.join('\n');
}

export function enumTemplate(input: TemplateInput<SchemaFormEnum>): string {
    const enumTemplate = input.schema.enum
        .map((val) => `${input.val} === "${val}"`)
        .join(' || ');
    const errorMessage = `Expected one of the following values: [${input.schema.enum.join(
        ', ',
    )}]`;
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
    const mainTemplate = templateParts.join('\n');
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
    const depthStr = getDepthStr(input.instancePath);
    const innerTargetVal = `__${depthStr}`;
    const parsingParts: string[] = [];
    if (input.discriminatorKey && input.discriminatorValue) {
        parsingParts.push(
            `${innerTargetVal}.${input.discriminatorKey} = "${input.discriminatorValue}";`,
        );
    }
    if (input.schema.strict) {
        const keyVal = `_${depthStr}_keys`;
        const optionalKeyVal = `_${depthStr}_optionalKeys`;
        const keys = Object.keys(input.schema.properties)
            .map((key) => `"${key}"`)
            .join(',');
        const optionalKeys = Object.keys(input.schema.optionalProperties ?? {})
            .map((key) => `"${key}"`)
            .join(',');
        parsingParts.push(
            `const ${keyVal} = [${keys}];
            const ${optionalKeyVal} = [${optionalKeys}];
            for (let _key of Object.keys(${input.val})) {
                if(!${keyVal}.includes(_key) && !${optionalKeyVal}.includes(_key) && _key !== "${input.discriminatorKey ?? ''}") {
                    $fallback("${input.instancePath}", "${input.schemaPath}/strict", \`The following key is now allowed by the schema "\${_key}".\`);
                }
            }
                `,
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
            subFunctions: input.subFunctions,
            shouldCoerce: input.shouldCoerce,
            requiresTransformation: input.requiresTransformation,
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
                subFunctions: input.subFunctions,
                shouldCoerce: input.shouldCoerce,
                requiresTransformation: input.requiresTransformation,
            });
            parsingParts.push(`if (typeof ${input.val}.${key} === 'undefined') {
                // ignore undefined
            } else {
                ${innerTemplate}
            }`);
        }
    }
    let mainTemplate = `if (typeof ${input.val} === 'object' && ${
        input.val
    } !== null) {
        const ${innerTargetVal} = {};
        ${parsingParts.join('\n')}
        ${input.targetVal} = ${innerTargetVal};
    } else {
        $fallback("${input.instancePath}", "${
            input.schemaPath
        }", "Expected object");
    }`;
    const fnName = refFunctionName(input.schema.metadata?.id ?? '');
    if (Object.keys(input.subFunctions).includes(fnName)) {
        if (!input.subFunctions[fnName]) {
            input.subFunctions[fnName] = `function ${fnName}(_fnVal) {
                    let _fnTarget
                ${mainTemplate
                    .split(` ${input.val}`)
                    .join(' _fnVal')
                    .split(`(${input.val}`)
                    .join(`(_fnVal`)
                    .split(` ${input.targetVal}`)
                    .join(` _fnTarget`)
                    .split(`(${input.targetVal}`)
                    .join('(_fnTarget')}
                return _fnTarget;
            }`;
        }
        mainTemplate = `${input.targetVal} = ${fnName}(${input.val});`;
    }
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
    const resultVar = `__${getDepthStr(input.instancePath)}`;
    const itemVar = `${resultVar}AItem`;
    const itemResultVar = `${itemVar}AResult`;
    const innerTemplate = schemaTemplate({
        val: itemVar,
        targetVal: itemResultVar,
        instancePath: `${input.instancePath}/[i]`,
        schemaPath: `${input.schemaPath}/elements`,
        schema: input.schema.elements,
        subFunctions: input.subFunctions,
        shouldCoerce: input.shouldCoerce,
        requiresTransformation: input.requiresTransformation,
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
        const innerSchema = input.schema.mapping[type]!;
        const template = objectTemplate({
            val: input.val,
            targetVal: input.targetVal,
            schema: innerSchema,
            schemaPath: `${input.schemaPath}/mapping`,
            instancePath: `${input.instancePath}`,
            discriminatorKey: input.schema.discriminator,
            discriminatorValue: type,
            subFunctions: input.subFunctions,
            shouldCoerce: input.shouldCoerce,
            requiresTransformation: input.requiresTransformation,
        });
        switchParts.push(`case "${type}": {
            ${template}
            break;
        }`);
    }
    let mainTemplate = `if (typeof ${input.val} === 'object' && ${
        input.val
    } !== null) {
        switch(${input.val}.${input.schema.discriminator}) {
            ${switchParts.join('\n')}
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
    const fnName = refFunctionName(input.schema.metadata?.id ?? '');
    if (Object.keys(input.subFunctions).includes(fnName)) {
        if (!input.subFunctions[fnName]) {
            input.subFunctions[fnName] = `function ${fnName}(_fnVal) {
                let _fnTarget;
                ${mainTemplate
                    .split(` ${input.val}`)
                    .join(` _fnVal`)
                    .split(`(${input.val}`)
                    .join(`(_fnVal`)
                    .split(` ${input.targetVal}`)
                    .join(` _fnTarget`)
                    .split(`(${input.targetVal}`)
                    .join(`(_fnTarget`)}
                return _fnTarget;
            }`;
        }
        mainTemplate = `${input.targetVal} = ${fnName}(${input.val});`;
    }
    if (input.schema.nullable) {
        return `if (${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${mainTemplate}
        }`;
    }
    return mainTemplate;
}

function getDepthStr(instancePath: string) {
    const parts = instancePath.split('/');
    const depth = parts.length;
    return `D${depth}`;
}

export function recordTemplate(input: TemplateInput<SchemaFormValues>): string {
    const valPrefix = getDepthStr(input.instancePath);
    const resultVal = `__${valPrefix}RResult`;
    const loopVal = `__${valPrefix}RKey`;
    const loopResultVal = `${loopVal}RVal`;
    const innerTemplate = schemaTemplate({
        val: `${input.val}[${loopVal}]`,
        targetVal: loopResultVal,
        instancePath: `${input.instancePath}/[key]`,
        schemaPath: `${input.schemaPath}/values`,
        schema: input.schema.values,
        subFunctions: input.subFunctions,
        shouldCoerce: input.shouldCoerce,
        requiresTransformation: input.requiresTransformation,
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

function refFunctionName(id: string) {
    return `__parse_${id}`;
}

export function refTemplate(input: TemplateInput<SchemaFormRef>): string {
    const fnName = refFunctionName(input.schema.ref);
    if (!Object.keys(input.subFunctions).includes(fnName)) {
        input.subFunctions[fnName] = '';
    }
    if (input.schema.nullable) {
        return `if (${input.val} === null) {
            ${input.targetVal} = null;
        } else {
            ${input.targetVal} = ${fnName}(${input.val});
        }`;
    }
    return `${input.targetVal} = ${fnName}(${input.val})`;
}
