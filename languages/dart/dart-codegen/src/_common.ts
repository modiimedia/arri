import {
    camelCase,
    pascalCase,
    removeDisallowedChars,
    Schema,
} from "@arrirpc/codegen-utils";

export interface CodegenContext {
    clientName: string;
    modelPrefix: string;
    generatedTypes: string[];
    instancePath: string;
    schemaPath: string;
    clientVersion?: string;
    isOptional?: boolean;
    discriminatorParentId?: string;
    discriminatorValue?: string;
    discriminatorKey?: string;
}

export interface DartProperty {
    typeName: string;
    isNullable: boolean;
    content: string;
    defaultValue: string;
    fromJson: (input: string, key?: string) => string;
    toJson: (input: string, target: string, key: string) => string;
    toQueryString: (input: string, target: string, key: string) => string;
}

export function outputIsNullable(schema: Schema, context: CodegenContext) {
    if (schema.nullable) {
        return true;
    }
    if (context.isOptional) {
        return true;
    }
    return false;
}

const reservedIdentifierKeywords: Record<string, 0 | 1 | 2 | 3> = {
    abstract: 2,
    as: 2,
    assert: 0,
    async: 3,
    await: 1,
    base: 3,
    break: 0,
    case: 0,
    catch: 0,
    class: 0,
    const: 0,
    continue: 0,
    covariant: 2,
    default: 0,
    deferred: 2,
    do: 0,
    dynamic: 2,
    else: 0,
    enum: 0,
    export: 2,
    extends: 0,
    extension: 2,
    external: 2,
    factory: 2,
    false: 0,
    final: 0,
    finally: 0,
    for: 0,
    Function: 2,
    get: 2,
    hide: 3,
    if: 0,
    implements: 2,
    import: 2,
    in: 0,
    interface: 2,
    is: 0,
    late: 2,
    library: 2,
    mixin: 2,
    new: 0,
    null: 0,
    of: 3,
    on: 3,
    operator: 2,
    part: 2,
    required: 2,
    rethrow: 0,
    return: 0,
    sealed: 3,
    set: 2,
    show: 3,
    static: 2,
    super: 0,
    switch: 0,
    sync: 3,
    this: 0,
    throw: 0,
    true: 0,
    try: 0,
    type: 2,
    typedef: 2,
    var: 0,
    void: 0,
    when: 3,
    with: 0,
    while: 0,
    yield: 1,
};

export function canUseIdentifier(input: string) {
    const reservedId = reservedIdentifierKeywords[input];
    if (typeof reservedId === "undefined") {
        return true;
    }
    switch (reservedId) {
        case 0:
            return false;
        case 1:
            return true;
        case 2:
            return true;
        case 3:
            return true;
        default:
            reservedId satisfies never;
            throw new Error("Unhandled case");
    }
}

export function sanitizeIdentifier(input: string): string {
    const bannedCharacters = "!@#$%^&*()-=+[{}]\\|/?.><,;`~";
    const result = removeDisallowedChars(input, bannedCharacters);
    const numbers = "0123456789";
    if (numbers.includes(result.charAt(0))) {
        return `k_${result}`;
    }
    return result;
}

export function canUseClassName(input: string) {
    const reservedId = reservedIdentifierKeywords[input];
    if (typeof reservedId === "undefined") {
        return true;
    }
    switch (reservedId) {
        case 0:
            return false;
        case 1:
            return false;
        case 2:
            return false;
        case 3:
            return true;
        default:
            reservedId satisfies never;
            throw new Error("Unhandled case");
    }
}

export function validDartIdentifier(input: string): string {
    const finalIdentifier = sanitizeIdentifier(
        camelCase(input, { normalize: true }),
    );
    if (!canUseIdentifier(finalIdentifier)) {
        return `k_${finalIdentifier}`;
    }
    return finalIdentifier;
}

export function validDartClassName(input: string, modelPrefix: string): string {
    const className = sanitizeIdentifier(
        pascalCase(input, { normalize: true }),
    );
    if (canUseClassName(className) || modelPrefix.length) {
        return className;
    }
    return `Class${className}`;
}

export function getDartClassName(
    schema: Schema,
    context: CodegenContext,
): string {
    if (schema.metadata?.id) {
        return validDartClassName(schema.metadata.id, context.modelPrefix);
    }
    if (context.discriminatorParentId) {
        return validDartClassName(
            `${context.discriminatorParentId}_${context.discriminatorValue}`,
            context.modelPrefix,
        );
    }
    return validDartClassName(
        context.instancePath.split("/").join("_"),
        context.modelPrefix,
    );
}
