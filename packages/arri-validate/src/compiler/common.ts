import type { Schema } from "jtd-utils";

export interface TemplateInput<TSchema extends Schema = any> {
    val: string;
    targetVal: string;
    schema: TSchema;
    instancePath: string;
    schemaPath: string;
    discriminatorKey?: string;
    discriminatorValue?: string;
    subFunctionNames: string[];
    subFunctionBodies: string[];
    finalFunctionBody?: string;
}
