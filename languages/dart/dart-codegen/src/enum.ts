import { camelCase, SchemaFormEnum } from "@arrirpc/codegen-utils";

import {
    CodegenContext,
    DartProperty,
    getDartClassName,
    outputIsNullable,
} from "./_common";

export function dartEnumFromSchema(
    schema: SchemaFormEnum,
    context: CodegenContext,
): DartProperty {
    const isNullable = outputIsNullable(schema, context);
    const enumName = getDartClassName(schema, context);
    const typeName = isNullable ? `${enumName}?` : enumName;
    const enumValues = schema.enum.map((val) => ({
        name: camelCase(val, { normalize: true }),
        serialValue: val,
    }));
    if (!enumValues.length) {
        throw new Error(
            `Enum schemas must have at least one enum value. At ${context.instancePath}.`,
        );
    }
    const defaultValue = isNullable
        ? "null"
        : `${context.modelPrefix}${enumName}.${enumValues[0]?.name}`;
    const output: DartProperty = {
        typeName,
        isNullable,
        defaultValue,
        fromJson(input, _key) {
            if (isNullable) {
                return `${input} is String ? ${context.modelPrefix}${enumName}.fromString(${input}) : null`;
            }
            return `${context.modelPrefix}${enumName}.fromString(typeFromDynamic<String>(${input}, ""))`;
        },
        toJson(input) {
            if (context.isOptional) {
                return `${input}!.serialValue`;
            }
            if (schema.nullable) {
                return `${input}?.serialValue`;
            }
            return `${input}.serialValue`;
        },
        toQueryString(input, target, key) {
            if (context.isOptional) {
                return `if (${input} != null) ${target}.add("${key}=\${${input}!.serialValue}")`;
            }
            if (schema.nullable) {
                return `${target}.add("${key}=\${${input}?.serialValue}")`;
            }
            return `${target}.add("${key}=\${${input}.serialValue}")`;
        },
        content: "",
    };
    if (context.generatedTypes.includes(enumName)) {
        return output;
    }
    output.content = `enum ${context.modelPrefix}${enumName} implements Comparable<${context.modelPrefix}${enumName}> {
${enumValues.map((val) => `  ${val.name}("${val.serialValue}")`).join(",\n")};

  const ${context.modelPrefix}${enumName}(this.serialValue);
  final String serialValue;

  factory ${context.modelPrefix}${enumName}.fromString(String input) {
    for (final val in values) {
      if (val.serialValue == input) {
        return val;
      }
    }
    return ${enumValues[0]!.name};
  }

  @override
  int compareTo(${enumName} other) => name.compareTo(other.name);
}`;
    context.generatedTypes.push(enumName);
    return output;
}
