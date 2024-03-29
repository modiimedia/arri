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
    type SchemaFormRef,
    isSchemaFormRef,
} from "jtd-utils";
import { camelCase } from "scule";
import { type TemplateInput } from "./common";

interface SerializeTemplateInput<TSchema extends Schema = any>
    extends TemplateInput<TSchema> {
    outputPrefix: string;
    needsSanitization: string[];
}

export function createSerializationV2Template(
    inputName: string,
    schema: Schema,
) {
    const subFunctions: Record<string, string> = {};
    const context: SerializeTemplateInput<any> = {
        val: inputName,
        targetVal: "json",
        schema,
        schemaPath: "",
        instancePath: "",
        outputPrefix: "",
        needsSanitization: [],
        subFunctions,
    };
    const result = template(context);
    if (isSchemaFormType(schema) || isSchemaFormEnum(schema)) {
        return result;
    }
    const subFunctionParts = Object.keys(subFunctions).map(
        (key) => subFunctions[key],
    );
    return `
    let json = '';
    ${subFunctionParts.join("\n")}
    ${context.needsSanitization.length > 0 ? `const STR_ESCAPE = /[\\u0000-\\u001f\\u0022\\u005c\\ud800-\\udfff]|[\\ud800-\\udbff](?![\\udc00-\\udfff])|(?:[^\\ud800-\\udbff]|^)[\\udc00-\\udfff]/;` : ""}
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
    if (isSchemaFormRef(input.schema)) {
        return refTemplate(input);
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
        default:
            input.schema.type satisfies never;
            throw new Error("Invalid value in 'type'");
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
    input.needsSanitization.push(input.instancePath);
    const mainTemplate = `${input.targetVal} += \`${input.outputPrefix ?? ""}\`;
if (${input.val}.length < 42) {
    let __result__ = "";
    let __last__ = -1;
    let __point__ = 255;
    let __finished__ = false;
    for (let i = 0; i < ${input.val}.length; i++) {
        __point__ = ${input.val}.charCodeAt(i);
        if (__point__ < 32 || (__point__ >= 0xd800 && __point__ <= 0xdfff)) {
            ${input.targetVal} += JSON.stringify(${input.val});
            __finished__ = true;
            break;
        }
        if (__point__ === 0x22 || __point__ === 0x5c) {
            __last__ === -1 && (__last__ = 0);
            __result__ += ${input.val}.slice(__last__, i) + '\\\\';
            __last__ = i;
        }
    }
    if(!__finished__) {
        if (__last__ === -1) {
            ${input.targetVal} += \`"\${${input.val}}"\`;
        } else {
            ${input.targetVal} += \`"\${__result__}\${${input.val}.slice(__last__)}"\`;
        }
    }
} else if (${input.val}.length < 5000 && !STR_ESCAPE.test(${input.val})) {
    ${input.targetVal} += \`"\${${input.val}}"\`;
} else {
    ${input.targetVal} += JSON.stringify(${input.val});
}`;
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
    const mainTemplate = `
    if(Number.isNaN(${input.val})) {
        throw new Error("Expected number at ${input.instancePath} got NaN");
    }
    ${input.targetVal} += \`${input.outputPrefix}\${${input.val}}\`;`;
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
    const templateParts: string[] = [`${input.targetVal} += '{';`];
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
        const key = propKeys[i]!;
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
            val: `___val___.${key}`,
            targetVal: input.targetVal,
            instancePath: `${input.instancePath}/${key}`,
            schemaPath: `${input.schemaPath}/properties/${key}`,
            outputPrefix: includeComma ? `,"${key}":` : `"${key}":`,
            needsSanitization: input.needsSanitization,
            subFunctions: input.subFunctions,
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
            const key = optionalPropKeys[i]!;
            const optionalPropSchema = input.schema.optionalProperties?.[
                key
            ] as Schema;
            if (!optionalPropSchema) {
                continue;
            }
            const innerVal = `___val___.${key}`;
            const innerTemplate = template({
                schema: optionalPropSchema,
                schemaPath: `${input.schemaPath}/optionalProperties/${key}`,
                instancePath: `${input.instancePath}/${key}`,
                val: innerVal,
                targetVal: input.targetVal,
                outputPrefix: `"${key}":`,
                needsSanitization: input.needsSanitization,
                subFunctions: input.subFunctions,
            });
            const innerTemplateWithComma = template({
                schema: optionalPropSchema,
                schemaPath: `${input.schemaPath}/optionalProperties/${key}`,
                instancePath: `${input.instancePath}/${key}`,
                val: innerVal,
                targetVal: input.targetVal,
                outputPrefix: `,"${key}":`,
                needsSanitization: input.needsSanitization,
                subFunctions: input.subFunctions,
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
            const key = optionalPropKeys[i]!;
            const optionalPropSchema = input.schema.optionalProperties?.[key];
            if (!optionalPropSchema) {
                continue;
            }
            const innerVal = `___val___.${key}`;
            const innerTemplate = template({
                schema: optionalPropSchema,
                schemaPath: `${input.schemaPath}/optionalProperties/${key}`,
                instancePath: `${input.instancePath}/${key}`,
                val: innerVal,
                targetVal: "json",
                outputPrefix: `,"${key}":`,
                needsSanitization: input.needsSanitization,
                subFunctions: input.subFunctions,
            });
            const completeInnerTemplate = `if (typeof ${innerVal} !== 'undefined') {
                ${innerTemplate}
            }`;
            templateParts.push(completeInnerTemplate);
        }
    }
    templateParts.push(`${input.targetVal} += '}';`);
    let mainTemplate = templateParts.join("\n");
    const fnName = refFnName(input.schema.metadata?.id ?? "");
    if (hasFunctionName(fnName, input.subFunctions)) {
        if (!hasFunctionBody(fnName, input.subFunctions)) {
            input.subFunctions[fnName] = `function ${fnName}(__inputVal__) {
                ${mainTemplate.split("___val___").join("__inputVal__")}
            }`;
        }
        mainTemplate = `${fnName}(${input.val});`;
    }
    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'object' && ${input.val} !== null) {
            ${input.targetVal} += '${input.outputPrefix}';
            ${mainTemplate.split("___val___").join(input.val)}
        } else {
            ${input.targetVal} += '${input.outputPrefix}null';
        }`;
    }
    return `
    ${input.targetVal} += '${input.outputPrefix}';
    ${mainTemplate.split("___val___").join(input.val)}`;
}

function hasFunctionName(name: string, fns: Record<string, string>) {
    return typeof fns[name] === "string";
}

function hasFunctionBody(name: string, fns: Record<string, string>) {
    return typeof fns[name] === "string" && fns[name]!.length > 0;
}

export function arrayTemplate(
    input: SerializeTemplateInput<SchemaFormElements>,
): string {
    const itemVarName = camelCase(`${input.val || "list"}_item`);
    const templateParts: string[] = [
        `${input.targetVal} += '${input.outputPrefix}[';`,
    ];
    const innerTemplate = template({
        schema: input.schema.elements,
        schemaPath: `${input.schemaPath}/elements`,
        instancePath: `${input.instancePath}/i`,
        val: itemVarName,
        targetVal: input.targetVal,
        outputPrefix: "",
        needsSanitization: input.needsSanitization,
        subFunctions: input.subFunctions,
    });
    templateParts.push(`for (let i = 0; i < ${input.val}.length; i++) {
        const ${itemVarName} = ${input.val}[i];
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
        outputPrefix: "",
        needsSanitization: input.needsSanitization,
        subFunctions: input.subFunctions,
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
    const inputPlaceholder = "<<<tempval>>>";
    const templateParts = [`switch(${inputPlaceholder}.${discriminatorKey}) {`];
    for (const val of discriminatorVals) {
        const valSchema = input.schema.mapping[val];
        const innerTemplate = template({
            schema: valSchema,
            schemaPath: `${input.schemaPath}/mapping/${val}`,
            instancePath: `${input.instancePath}`,
            val: inputPlaceholder,
            targetVal: input.targetVal,
            discriminatorKey,
            discriminatorValue: val,
            outputPrefix: input.outputPrefix,
            needsSanitization: input.needsSanitization,
            subFunctions: input.subFunctions,
        });
        templateParts.push(`case '${val}': {
            ${innerTemplate}
            break;
        }`);
    }
    templateParts.push("}");
    let mainTemplate = templateParts.join("\n");
    const fnName = refFnName(input.schema.metadata?.id ?? "");
    if (hasFunctionName(fnName, input.subFunctions)) {
        if (!hasFunctionBody(fnName, input.subFunctions)) {
            input.subFunctions[fnName] = `function ${fnName}(__fnInput__){
                ${mainTemplate.split(inputPlaceholder).join("__fnInput__")}
            }`;
        }
        mainTemplate = `${fnName}(${input.val});`;
    }

    if (input.schema.nullable) {
        return `if (typeof ${input.val} === 'object' && ${input.val} !== null) {
            ${mainTemplate.split(inputPlaceholder).join(input.val)}
        } else {
            ${input.targetVal} += '${input.outputPrefix}null';
        }`;
    }
    return mainTemplate.split(inputPlaceholder).join(input.val);
}

export function anyTemplate(
    input: SerializeTemplateInput<SchemaFormEmpty>,
): string {
    if (input.outputPrefix) {
        const mainTemplate = `if (typeof ${input.val} !== 'undefined') {
            ${input.targetVal} += '${input.outputPrefix}' + JSON.stringify(${input.val});
        }`;
        if (input.schema.nullable) {
            return `if (${input.val} === null) {
                ${input.targetVal} += '${input.outputPrefix}null';
            } else {
                ${mainTemplate}
            }`;
        }
        return mainTemplate;
    }
    return `if (typeof ${input.val} !== 'undefined') {
        ${input.targetVal} += JSON.stringify(${input.val});
    }`;
}

function refFnName(id: string) {
    return `__serialize_${id}`;
}

export function refTemplate(
    input: SerializeTemplateInput<SchemaFormRef>,
): string {
    const fnName = refFnName(input.schema.ref);
    if (!Object.keys(input.subFunctions).includes(fnName)) {
        input.subFunctions[fnName] = "";
    }
    if (input.schema.nullable) {
        return `if (${input.val} === null) {
            ${input.targetVal} += '${input.outputPrefix}null';
        } else {
            ${input.targetVal} += '${input.outputPrefix}';
            ${fnName}(${input.val});
        }`;
    }
    return `${input.targetVal} += '${input.outputPrefix}';
    ${fnName}(${input.val});`;
}
