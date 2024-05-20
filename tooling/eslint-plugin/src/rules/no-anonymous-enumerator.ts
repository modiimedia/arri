import { type Rule } from "eslint";

import { argHasIdKey } from "./_common";

const noAnonymousEnumerator: Rule.RuleModule = {
    meta: {
        type: "suggestion",
    },
    create(context) {
        return {
            CallExpression(node) {
                if (
                    node.callee.type !== "MemberExpression" ||
                    node.callee.object.type !== "Identifier" ||
                    node.callee.object.name !== "a" ||
                    node.callee.property.type !== "Identifier"
                ) {
                    return;
                }
                const propName = node.callee.property.name;
                if (propName !== "enumerator" && propName !== "stringEnum") {
                    return;
                }
                if (node.arguments.length < 2) {
                    context.report({
                        message: "enum schemas must specify an id",
                        node,
                    });
                    return;
                }
                const arg1 = node.arguments[0]!;
                const arg2 = node.arguments[1]!;
                if (
                    arg1.type === "Literal" &&
                    (arg1.value?.toString().length ?? 0) > 0
                ) {
                    // Using ID shorthand
                    return;
                }
                if (argHasIdKey(arg2)) {
                    return;
                }
                context.report({
                    message: "enum schemas must specify an id",
                    node,
                });
            },
        };
    },
};

export default noAnonymousEnumerator;
