import { type Rule,SourceCode } from "eslint";
import { type BaseCallExpression, type Node } from "estree";

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
    node: Node,
    schemaTypes: string[],
    context: Rule.RuleContext,
    log = false,
) {
    const sourceCode =
        "sourceCode" in context
            ? context.sourceCode
            : // legacy method
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((context as any).getSourceCode() as SourceCode);
    const ancestors = sourceCode.getAncestors(node);
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

        if (schemaTypes.includes(nodeName as never)) {
            return true;
        }
    }
    return false;
}
