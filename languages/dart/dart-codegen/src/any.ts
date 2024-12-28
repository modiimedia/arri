import { SchemaFormEmpty } from '@arrirpc/codegen-utils';

import { CodegenContext, DartProperty, outputIsNullable } from './_common';

export function dartAnyFromSchema(
    schema: SchemaFormEmpty,
    context: CodegenContext,
): DartProperty {
    const typeName = `dynamic`;
    const isNullable = outputIsNullable(schema, context);
    const defaultValue = `null`;
    return {
        typeName,
        isNullable: isNullable,
        defaultValue,
        fromJson(input) {
            return `${input}`;
        },
        toJson(input) {
            return input;
        },
        toQueryString() {
            return `print("[WARNING] any's cannot be serialized to query params. Skipping field at ${context.instancePath}.")`;
        },
        content: '',
    };
}
