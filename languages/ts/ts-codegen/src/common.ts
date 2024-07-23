import {
    pascalCase,
    removeDisallowedChars,
    Schema,
    stringStartsWithNumber,
} from "@arrirpc/codegen-utils";

export interface TsProperty {
    typeName: string;
    defaultValue: string;
    validationTemplate: (input: string) => string;
    fromJsonTemplate: (input: string, target: string) => string;
    toJsonTemplate: (input: string, target: string, key: string) => string;
    toQueryStringTemplate: (
        input: string,
        target: string,
        key: string,
    ) => string;
    content: string;
}

export interface CodegenContext {
    clientName: string;
    typePrefix: string;
    generatedTypes: string[];
    instancePath: string;
    schemaPath: string;
    discriminatorParent: string;
    discriminatorKey: string;
    discriminatorValue: string;
    versionNumber: string;
    usedFeatures: {
        sse: boolean;
        ws: boolean;
    };
}

export function getJsDocComment(metadata: Schema["metadata"]) {
    const descriptionParts: string[] = [];

    if (metadata?.description?.length) {
        const parts = metadata.description.split("\n");
        for (const part of parts) {
            descriptionParts.push(`* ${part}`);
        }
    }
    if (metadata?.isDeprecated) {
        descriptionParts.push("* @deprecated");
    }
    if (descriptionParts.length === 0) {
        return "";
    }
    return `/**
${descriptionParts.join("\n")}
*/\n`;
}

const illegalChars = "!#^&*()-+=?/][{}|\\~`'\"";

export function validVarName(name: string): string {
    if (stringStartsWithNumber(name)) {
        return `_${removeDisallowedChars(name, illegalChars)}`;
    }
    return removeDisallowedChars(name, illegalChars);
}

export function getTsTypeName(schema: Schema, context: CodegenContext): string {
    if (schema.metadata?.id) {
        const name = pascalCase(schema.metadata.id, { normalize: true });
        return validVarName(name);
    }
    if (context.discriminatorParent && context.discriminatorValue) {
        const name = pascalCase(
            `${context.discriminatorParent}_${context.discriminatorValue}`,
            { normalize: true },
        );
        return validVarName(name);
    }
    const name = pascalCase(context.instancePath.split("/").join("_"), {
        normalize: true,
    });
    return validVarName(name);
}
