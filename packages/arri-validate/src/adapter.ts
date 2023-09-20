import { type ASchema } from "./schemas";

export type ValidationAdapter = <T>(input: any) => ASchema<T>;
