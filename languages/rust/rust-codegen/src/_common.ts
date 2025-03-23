import {
    pascalCase,
    removeDisallowedChars,
    Schema,
    snakeCase,
} from '@arrirpc/codegen-utils';
import path from 'pathe';

export interface GeneratorContext {
    clientVersion: string;
    clientName: string;
    typeNamePrefix: string;
    instancePath: string;
    schemaPath: string;
    generatedTypes: string[];
    discriminatorKey?: string;
    discriminatorValue?: string;
    isOptional?: boolean;
    rootService: string | undefined;
}

export interface RustProperty {
    typeId: string;
    /**
     * The type name with the optional typePrefix
     */
    finalTypeName: string;
    defaultValue: string;
    isNullable: boolean;
    fromJsonTemplate: (input: string, key: string) => string;
    toJsonTemplate: (input: string, target: string) => string;
    toQueryStringTemplate: (
        input: string,
        key: string,
        target: string,
    ) => string;
    content: string;
}

const reservedKeywords = [
    'as',
    'break',
    'const',
    'continue',
    'crate',
    'else',
    'enum',
    'extern',
    'false',
    'fn',
    'for',
    'if',
    'impl',
    'in',
    'let',
    'loop',
    'match',
    'mod',
    'move',
    'mut',
    'pub',
    'ref',
    'return',
    'self',
    'Self',
    'static',
    'struct',
    'super',
    'trait',
    'true',
    'type',
    'unsafe',
    'use',
    'where',
    'while',
    'async',
    'await',
    'dyn',
    'abstract',
    'become',
    'box',
    'do',
    'final',
    'macro',
    'override',
    'priv',
    'typeof',
    'unsized',
    'virtual',
    'yield',
    'try',
    'macro_rules',
    'union',
    "'static",
    'dyn',
];

const illegalChars = '.!@#$%^&*()-+=\\][{}\'";?';
const numberChars = '0123456789';

export function validRustIdentifier(key: string): string {
    const output = removeDisallowedChars(snakeCase(key), illegalChars);
    if (numberChars.includes(output.charAt(0))) {
        return `r#_${output}`;
    }
    if (reservedKeywords.includes(output)) {
        return `r#${output}`;
    }
    return output;
}

export function validRustName(name: string): string {
    const output = removeDisallowedChars(
        pascalCase(name, { normalize: true }),
        illegalChars,
    );
    if (numberChars.includes(output.charAt(0))) {
        return `r#_${output}`;
    }
    if (reservedKeywords.includes(output)) {
        return `r#${output}`;
    }
    return output;
}

export const tmpDir = path.resolve(__dirname, '../.temp');

export function outputIsOptionType(
    schema: Schema,
    context: GeneratorContext,
): boolean {
    return schema.nullable === true || context.isOptional === true;
}

export function getTypeName(schema: Schema, context: GeneratorContext): string {
    if (schema.metadata?.id) {
        return validRustName(schema.metadata.id);
    }
    if (context.discriminatorKey && context.discriminatorValue) {
        const parts = context.instancePath.split('/');
        const name = validRustName(
            `${parts.join('_')}_${context.discriminatorValue}`,
        );
        return name;
    }
    return validRustName(context.instancePath.split('/').join('_'));
}

export function formatDescriptionComment(
    description: string,
    leading = '',
): string {
    return description
        .split('\n')
        .map((line) => `${leading}/// ${line}`)
        .join('\n');
}

export function maybeStr(show: boolean, char: string) {
    if (show) {
        return char;
    }
    return '';
}
