import { type SchemaFormDiscriminator } from "arri-codegen-utils";
import {
    getTypeName,
    type GeneratorContext,
    type RustProperty,
} from "./common";

export function rustTaggedUnionFromSchema(
    schema: SchemaFormDiscriminator,
    context: GeneratorContext,
): RustProperty {
    const enumName = getTypeName(schema, context);
    if (context.instancePath === "") {
        context.rootTypeName = enumName;
    }
}
