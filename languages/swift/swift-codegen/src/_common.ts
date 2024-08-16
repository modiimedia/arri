import {
    camelCase,
    pascalCase,
    removeDisallowedChars,
    Schema,
    stringStartsWithNumber,
} from "@arrirpc/codegen-utils";

export interface GeneratorContext {
    clientVersion: string;
    clientName: string;
    typePrefix: string;
    instancePath: string;
    schemaPath: string;
    generatedTypes: string[];
    discriminatorParent?: string;
    discriminatorKey?: string;
    discriminatorValue?: string;
    isOptional?: boolean;
}

export interface SwiftProperty {
    typeName: string;
    defaultValue: string;
    isNullable: boolean;
    canBeQueryString: boolean;
    fromJsonTemplate: (input: string, target: string, key: string) => string;
    toJsonTemplate: (input: string, target: string) => string;
    toQueryStringTemplate: (
        input: string,
        target: string,
        key: string,
    ) => string;
    cloneTemplate?: (
        input: string,
        key: string,
    ) => {
        bodyContent: string;
        fieldContent: string;
    };
    content: string;
}

export function isNullableType(
    schema: Schema,
    context: GeneratorContext,
): boolean {
    return schema.nullable === true || context.isOptional === true;
}

export function validTypeName(input: string): string {
    const formatted = removeDisallowedChars(
        pascalCase(input.split("[").join("_").split("]").join("_"), {
            normalize: true,
        }),
        illegalPropertyChars,
    );
    if (reservedKeywords[formatted]) {
        return `_${formatted}`;
    }
    if (stringStartsWithNumber(formatted)) {
        return `_${formatted}`;
    }
    return formatted;
}

export function getTypeName(schema: Schema, context: GeneratorContext): string {
    if (schema.metadata?.id) {
        const typeName = validTypeName(schema.metadata.id);
        return typeName;
    }
    if (context.discriminatorParent && context.discriminatorValue) {
        const typeName = validTypeName(
            `${context.discriminatorParent}_${context.discriminatorValue}`,
        );
        return typeName;
    }
    const typeName = validTypeName(context.instancePath.split("/").join("_"));
    return typeName;
}

const reservedKeywords: Record<string, boolean> = {
    associatedType: true,
    class: true,
    deinit: true,
    enum: true,
    extension: true,
    fileprivate: true,
    func: true,
    import: true,
    init: true,
    inout: true,
    internal: true,
    let: true,
    open: true,
    operator: true,
    private: true,
    precedencegroup: true,
    protocol: true,
    public: true,
    rethrows: true,
    static: true,
    subscript: true,
    typealias: true,
    var: true,
    break: true,
    case: true,
    catch: true,
    continue: true,
    default: true,
    defer: true,
    do: true,
    else: true,
    fallthrough: true,
    for: true,
    guard: true,
    if: true,
    in: true,
    repeat: true,
    return: true,
    throw: true,
    switch: true,
    where: true,
    while: true,
    Any: true,
    as: true,
    false: true,
    is: true,
    nil: true,
    self: true,
    Self: true,
    super: true,
    true: true,
    try: true,
};

const illegalPropertyChars = "!@#$%^&*()+=[]{}\\|;:'\",./?><`~";

export function validSwiftKey(input: string) {
    const key = removeDisallowedChars(
        camelCase(input, { normalize: true }),
        illegalPropertyChars,
    );
    if (reservedKeywords[key]) {
        return `\`${key}\``;
    }
    if (stringStartsWithNumber(key)) {
        return `_${key}`;
    }
    return key;
}

export function codeComments(schema: Schema, leading = "") {
    const description = schema.metadata?.description
        ?.split("\n")
        .map((line) => `${leading}/// ${line}`)
        .join("\n");
    if (description && schema.metadata?.isDeprecated) {
        return `${description}\n${leading}@available(*, deprecated)\n`;
    }
    if (description) {
        return `${description}\n`;
    }
    if (schema.metadata?.isDeprecated) {
        return `${leading}@available(*, deprecated)\n`;
    }
    return "";
}
