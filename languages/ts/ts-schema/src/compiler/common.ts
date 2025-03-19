import {
    isSchemaFormDiscriminator,
    isSchemaFormElements,
    isSchemaFormEnum,
    isSchemaFormProperties,
    isSchemaFormType,
    isSchemaFormValues,
    type Schema,
} from '@arrirpc/type-defs';

export interface TemplateInput<TSchema extends Schema = any> {
    val: string;
    targetVal: string;
    schema: TSchema;
    instancePath: string;
    schemaPath: string;
    discriminatorKey?: string;
    discriminatorValue?: string;
    subFunctions: Record<string, string>;
    finalFunctionBody?: string;
    shouldCoerce: boolean | undefined;
    requiresTransformation: boolean;
}

export function inputRequiresTransformation(
    schema: Schema,
    depth = 0,
): boolean {
    if (isSchemaFormType(schema)) {
        if (depth === 0) return true;
        switch (schema.type) {
            case 'string':
                return false;
            case 'boolean':
            case 'float32':
            case 'float64':
            case 'int8':
            case 'uint8':
            case 'int16':
            case 'uint16':
            case 'int32':
            case 'uint32':
                return depth > 0;
            case 'int64':
            case 'uint64':
            case 'timestamp':
                return true;
            default:
                schema.type satisfies never;
                return false;
        }
    }
    if (isSchemaFormEnum(schema)) return false;
    if (isSchemaFormProperties(schema)) {
        for (const key of Object.keys(schema.properties)) {
            if (
                inputRequiresTransformation(schema.properties[key]!, depth + 1)
            ) {
                return true;
            }
        }
        if (schema.optionalProperties) {
            for (const key of Object.keys(schema.optionalProperties)) {
                if (
                    inputRequiresTransformation(
                        schema.optionalProperties[key]!,
                        depth + 1,
                    )
                ) {
                    return true;
                }
            }
        }
    }
    if (isSchemaFormElements(schema)) {
        return inputRequiresTransformation(schema.elements, depth + 1);
    }
    if (isSchemaFormValues(schema)) {
        return inputRequiresTransformation(schema.values, depth + 1);
    }
    if (isSchemaFormDiscriminator(schema)) {
        for (const key of Object.keys(schema.mapping)) {
            if (inputRequiresTransformation(schema.mapping[key]!, depth + 1)) {
                return true;
            }
        }
    }
    return false;
}
