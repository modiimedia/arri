import { Schema } from '@arrirpc/codegen-utils';

import { CodegenContext, TsProperty } from './common';

export function tsAnyFromSchema(
    schema: Schema,
    context: CodegenContext,
): TsProperty {
    const typeName = 'any';
    const defaultValue = schema.nullable ? 'null' : 'undefined';
    return {
        typeName,
        defaultValue,
        validationTemplate(_) {
            return 'true';
        },
        fromJsonTemplate(input, target) {
            return `${target} = ${input}`;
        },
        toJsonTemplate(input, target) {
            return `${target} += JSON.stringify(${input})`;
        },
        toQueryStringTemplate(_input, _target, _key) {
            return `console.warn("[WARNING] Cannot serialize any's to query string. Skipping property at ${context.instancePath}.")`;
        },
        content: '',
    };
}
