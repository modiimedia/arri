import { type ArriSchema } from "./lib/typedefs";
export { ValidationError } from "./lib/validation";
export type { ErrorObject } from "ajv";
export type ValidationAdapter = <T>(input: any) => ArriSchema<T>;
export function createValidationAdapter(adapter: ValidationAdapter) {
    return adapter;
}
