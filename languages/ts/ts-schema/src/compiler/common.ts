import type { Schema } from '@arrirpc/type-defs';

export interface TemplateInput<TSchema extends Schema = any> {
    val: string;
    targetVal: string;
    schema: TSchema;
    instancePath: string;
    schemaPath: string;
    discriminatorKey?: string;
    discriminatorValue?: string;
    subFunctions: Record<string, string>;
    finalFunctionBody?: string;
    shouldCoerce: boolean | undefined;
}
