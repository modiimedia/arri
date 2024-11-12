import { camelCase, SchemaFormElements } from "@arrirpc/codegen-utils";

import { tsTypeFromSchema } from "./_index";
import { CodegenContext, TsProperty, validVarName } from "./common";

export function tsArrayFromSchema(
    schema: SchemaFormElements,
    context: CodegenContext,
): TsProperty {
    const innerType = tsTypeFromSchema(schema.elements, {
        clientName: context.clientName,
        typePrefix: context.typePrefix,
        generatedTypes: context.generatedTypes,
        instancePath: `${context.instancePath}/[element]`,
        schemaPath: `${context.schemaPath}/elements`,
        discriminatorParent: "",
        discriminatorKey: "",
        discriminatorValue: "",
        versionNumber: context.versionNumber,
        usedFeatures: context.usedFeatures,
        rpcGenerators: context.rpcGenerators,
    });
    const typeName = `(${innerType.typeName})[]`;
    const defaultValue = schema.nullable ? "null" : "[]";
    return {
        typeName: schema.nullable ? `${typeName} | null` : typeName,
        defaultValue,
        validationTemplate(input) {
            const mainPart = `Array.isArray(${input}) 
                && ${input}.every(
                    (_element) => ${innerType.validationTemplate("_element")}
            )`;
            if (schema.nullable) {
                return `((${mainPart}) || 
                ${input} === null)`;
            }
            return mainPart;
        },
        fromJsonTemplate(input, target) {
            return `if (Array.isArray(${input})) {
                ${target} = [];
                for (const ${target}El of ${input}) {
                    let ${target}ElValue: ${innerType.typeName};
                    ${innerType.fromJsonTemplate(`${target}El`, `${target}ElValue`)}
                    ${target}.push(${target}ElValue);
                }
            } else {
                ${target} = ${defaultValue};
            }`;
        },
        toJsonTemplate(input, target) {
            const elVar = `_${camelCase(validVarName(input.split(".").join("_")), { normalize: true })}El`;
            const elKeyVar = `${elVar}Key`;
            if (schema.nullable) {
                return `if (${input} !== null) {
                    ${target} += '[';
                    for (let i = 0; i < ${input}.length; i++) {
                        if (i !== 0) ${target} += ',';
                        const ${elVar} = ${input}[i];
                        ${innerType.toJsonTemplate(elVar, target, elKeyVar)}
                    }
                    ${target} += ']';
                } else {
                    ${target} += 'null'; 
                }`;
            }
            return `${target} += '[';
            for (let i = 0; i < ${input}.length; i++) {
                if (i !== 0) ${target} += ',';
                const ${elVar} = ${input}[i];
                ${innerType.toJsonTemplate(elVar, target, elKeyVar)}
            }
            ${target} += ']';`;
        },
        toQueryStringTemplate(_input, _target, _key) {
            return `console.warn('[WARNING] Cannot serialize arrays to query string. Skipping property at ${context.instancePath}.')`;
        },
        content: innerType.content,
    };
}
