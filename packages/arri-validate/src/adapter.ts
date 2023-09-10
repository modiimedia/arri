import { ASchema } from "arri-shared";

export { ValidationError } from "./lib/validation";
export type { ErrorObject } from "ajv";

export type ValidationAdapter = <T>(input: any) => ASchema<T>;
