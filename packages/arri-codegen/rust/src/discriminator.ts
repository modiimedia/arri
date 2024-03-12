import { type SchemaFormDiscriminator } from "arri-codegen-utils";
import { type GeneratorContext, type RustProperty } from "./common";

export function rustTaggedUnionFromSchema(
    schema: SchemaFormDiscriminator,
    context: GeneratorContext,
): RustProperty {}
