import { type Rule } from "eslint";
import { argHasIdKey, isNestedInSchema } from "./_common";

const noAnonymousDiscriminator: Rule.RuleModule = {
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
                if (propName !== "discriminator") {
                    return;
                }
                if (isNestedInSchema(node, ["recursive"], context)) {
                    return;
                }
                if (node.arguments.length < 3) {
                    context.report({
                        message: "discriminator schemas must specify an id",
                        node,
                    });
                    return;
                }
                const arg1 = node.arguments[0]!;
                const arg2 = node.arguments[1]!;
                const arg3 = node.arguments[2]!;
                if (
                    arg1.type === "Literal" &&
                    (arg1.value?.toString().length ?? 0) > 0 &&
                    arg2.type === "Literal" &&
                    (arg2.value?.toString().length ?? 0) > 0
                ) {
                    // using ID shorthand so safe to exit
                    return;
                }
                if (argHasIdKey(arg3)) {
                    return;
                }
                context.report({
                    message: "discriminator schemas must specify an id",
                    node,
                });
            },
        };
    },
};

export default noAnonymousDiscriminator;
