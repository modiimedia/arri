import { SchemaFormEmpty } from "@arrirpc/codegen-utils";

import { CodegenContext, DartProperty, outputIsNullable } from "./_common";

export function dartAnyFromSchema(
    schema: SchemaFormEmpty,
    context: CodegenContext,
): DartProperty {
    const typeName = `dynamic`;
    const isNullable = outputIsNullable(schema, context);
    const defaultValue = isNullable ? `null` : `{}`;
    return {
        typeName: `Map<String, dynamic>`,
        isNullable: (schema.nullable || context.isOptional) ?? false,
        defaultValue,
        fromJson(input, key) {
            if (isNullable) {
                return `${input} is dynamic ? ${input} : null`;
            }
            return `${input}`;
        },
        toJson(input) {
            return input;
        },
        toQueryString(input, target, key) {},
    };
}
