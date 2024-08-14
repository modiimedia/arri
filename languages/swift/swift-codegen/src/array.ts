import { SchemaFormElements } from "@arrirpc/codegen-utils";

import { GeneratorContext, isNullableType, SwiftProperty } from "./_common";
import { swiftTypeFromSchema } from "./_index";

export function swiftArrayFromSchema(
    schema: SchemaFormElements,
    context: GeneratorContext,
): SwiftProperty {
    const subType = swiftTypeFromSchema(schema.elements, {
        clientVersion: context.clientVersion,
        clientName: context.clientName,
        typePrefix: context.typePrefix,
        instancePath: `${context.instancePath}/[element]`,
        schemaPath: `${context.schemaPath}/elements`,
        generatedTypes: context.generatedTypes,
    });
    const isNullable = isNullableType(schema, context);
    const typeName = isNullable
        ? `[${subType.typeName}]?`
        : `[${subType.typeName}]`;
    const defaultValue = isNullable ? "" : "[]";
    return {
        typeName,
        isNullable,
        defaultValue,
        canBeQueryString: false,
        fromJsonTemplate(input, target) {},
        toJsonTemplate(input, target) {},
        toQueryStringTemplate(input, target, key) {},
        cloneTemplate(input, key) {},
        content: subType.content,
    };
}
