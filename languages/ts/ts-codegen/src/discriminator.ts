import { SchemaFormDiscriminator } from "@arrirpc/codegen-utils";

import { CodegenContext, getTsTypeName, TsProperty } from "./common";
import { tsObjectFromSchema } from "./object";

export function tsTaggedUnionFromSchema(
    schema: SchemaFormDiscriminator,
    context: CodegenContext,
): TsProperty {
    const typeName = getTsTypeName(schema, context);
    const prefixedTypeName = `${context.typePrefix}${typeName}`;
    const defaultValue = schema.nullable
        ? "null"
        : `$$${prefixedTypeName}.new()`;

    const result: TsProperty = {
        typeName: schema.nullable
            ? `${prefixedTypeName} | null`
            : prefixedTypeName,
        defaultValue,
        validationTemplate(input: string): string {
            const mainPart = `$$${prefixedTypeName}.validate(${input})`;
            if (schema.nullable) {
                return `(${mainPart} || ${input} === null)`;
            }
            return mainPart;
        },
        fromJsonTemplate(input: string, target: string): string {
            return `if (isObject(${input})) {
                ${target} = $$${prefixedTypeName}.fromJson(${input});
            } else {
                ${target} = ${defaultValue}; 
            }`;
        },
        toJsonTemplate(input: string, target: string, _key: string): string {
            if (schema.nullable) {
                return `if (${input} != null) {
                    ${target} += $$${prefixedTypeName}.toJsonString(${input});
                } else {
                    ${target} += 'null'; 
                }`;
            }
            return `${target} += $$${prefixedTypeName}.toJsonString(${input});`;
        },
        toQueryStringTemplate(_: string, __: string, ___: string): string {
            return `console.warn("[WARNING] Cannot serialize nested objects to query string. Skipping property at ${context.instancePath}.");`;
        },
        content: "",
    };
    if (context.generatedTypes.includes(typeName)) return result;
    const subTypes: { value: string; data: TsProperty }[] = [];
    const discriminatorKey = schema.discriminator;
    for (const key of Object.keys(schema.mapping)) {
        const subSchema = schema.mapping[key]!;
        const subType = tsObjectFromSchema(subSchema, {
            clientName: context.clientName,
            typePrefix: context.typePrefix,
            generatedTypes: context.generatedTypes,
            instancePath: context.instancePath,
            schemaPath: `${context.schemaPath}/mapping/${key}`,
            discriminatorParent: typeName,
            discriminatorKey: discriminatorKey,
            discriminatorValue: key,
            versionNumber: context.versionNumber,
            hasSseProcedure: context.hasSseProcedure,
            hasWsProcedure: context.hasWsProcedure,
        });
        subTypes.push({ value: key, data: subType });
    }
    result.content = `export type ${prefixedTypeName} = ${subTypes.map((type) => type.data.typeName).join(" |")};
export const $$${prefixedTypeName}: ArriModelValidator<${prefixedTypeName}> = {
    new(): ${prefixedTypeName} {
        return $$${subTypes[0]!.data.typeName}.new();
    },
    validate(input): input is ${prefixedTypeName} {
        if (!isObject(input)) {
            return false;
        }
        if (typeof input.${discriminatorKey} !== 'string') {
            return false;
        }
        switch (input.${discriminatorKey}) {
${subTypes
    .map(
        (type) => `            case "${type.value}":
                return $$${type.data.typeName}.validate(input);`,
    )
    .join("\n")}
            default:
                return false;
        }
    },
    fromJson(input): ${prefixedTypeName} {
        switch (input.${discriminatorKey}) {
${subTypes
    .map(
        (type) => `            case "${type.value}":
                return $$${type.data.typeName}.fromJson(input);`,
    )
    .join("\n")}
            default:
                return $$${subTypes[0]!.data.typeName}.new();
        }
    },
    fromJsonString(input): ${prefixedTypeName} {
        return $$${prefixedTypeName}.fromJson(JSON.parse(input));
    },
    toJsonString(input): string {
        switch (input.${discriminatorKey}) {
${subTypes
    .map(
        (type) => `            case "${type.value}":
                return $$${type.data.typeName}.toJsonString(input);`,
    )
    .join("\n")}
            default:
                throw new Error(\`Unhandled case "\${(input as any).${discriminatorKey}}"\`);
        }
    },
    toUrlQueryString(input): string {
        switch (input.${discriminatorKey}) {
${subTypes
    .map(
        (type) => `            case "${type.value}":
                return $$${type.data.typeName}.toUrlQueryString(input);`,
    )
    .join("\n")}
            default:
                throw new Error('Unhandled case');
        }
    }
}
${subTypes.map((type) => type.data.content).join("\n")}
`;
    context.generatedTypes.push(typeName);
    return result;
}
