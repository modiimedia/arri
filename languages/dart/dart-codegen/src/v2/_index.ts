import {
    AppDefinition,
    defineClientGeneratorPlugin,
    Schema,
} from "@arrirpc/codegen-utils";

import { outputIsNullable } from "./_common";

interface DartClientGeneratorOptions {
    clientName: string;
    outputFile: string;
    modelPrefix?: string;
    format?: boolean;
}

export const dartClientGenerator = defineClientGeneratorPlugin(
    (options: DartClientGeneratorOptions) => {
        return {
            generator(def) {},
            options,
        };
    },
);

export function createDartClient(def: AppDefinition) {}

export function dartTypeFromSchema(
    schema: Schema,
    context: CodegenContext,
): DartProperty {}
