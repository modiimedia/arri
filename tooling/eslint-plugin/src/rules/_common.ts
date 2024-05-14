import { type Rule } from "eslint";
import { type BaseCallExpression } from "estree";

export function argHasIdKey(
    arg: BaseCallExpression["arguments"][number],
): boolean {
    if (arg.type === "ObjectExpression") {
        for (const prop of arg.properties) {
            if (prop.type === "Property") {
                if (prop.key.type === "Identifier" && prop.key.name === "id") {
                    return true;
                }
                if (
                    prop.key.type === "Literal" &&
                    prop.key.value?.toString() === "id"
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

export function isNestedInSchema(
    schemaTypes: string[],
    context: Rule.RuleContext,
    log = false,
) {
    const ancestors = context.getAncestors();
    if (log) {
        console.log(ancestors);
    }
    for (const node of ancestors) {
        if (
            node.type !== "CallExpression" ||
            node.callee.type !== "MemberExpression" ||
            node.callee.object.type !== "Identifier" ||
            node.callee.object.name !== "a"
        ) {
            continue;
        }
        if (node.callee.property.type !== "Identifier") {
            continue;
        }
        const nodeName = node.callee.property.name;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        if (schemaTypes.includes(nodeName as any)) {
            return true;
        }
    }
    return false;
}
