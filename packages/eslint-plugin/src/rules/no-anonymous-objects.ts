import { type Rule } from "eslint";

const guardedSchemaTypes = [
    "object",
    "discriminator",
    "enumerator",
    "stringEnum",
];

const noAnonymousObjects: Rule.RuleModule = {
    meta: {
        type: "suggestion",
    },
    create(context) {
        return {
            CallExpression: (node) => {
                if (
                    node.callee.type !== "MemberExpression" ||
                    node.callee.object.type !== "Identifier" ||
                    node.callee.object.name !== "a"
                ) {
                    return;
                }
                if (node.callee.property.type !== "Identifier") {
                    return;
                }
                const nodeName = node.callee.property.name;
                if (!guardedSchemaTypes.includes(nodeName)) {
                    return;
                }
                if (nodeName === "discriminator") {
                    if (node.arguments.length < 3) {
                        context.report({
                            message: `a.${nodeName}() should specify an id`,
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
                    if (arg3.type === "ObjectExpression") {
                        for (const prop of arg3.properties) {
                            if (prop.type === "Property") {
                                if (
                                    prop.key.type === "Identifier" &&
                                    prop.key.name === "id"
                                ) {
                                    return;
                                }
                                if (
                                    prop.key.type === "Literal" &&
                                    prop.key.value?.toString() === "id"
                                ) {
                                    return;
                                }
                            }
                        }
                    }
                    context.report({
                        message: `a.${nodeName}() should specify an id`,
                        node,
                    });
                    return;
                }
                if (node.arguments.length < 2) {
                    context.report({
                        message: `a.${nodeName}() should specify an id`,
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
                    // using ID shorthand so safe to exit
                    return;
                }
                if (arg2.type === "ObjectExpression") {
                    for (const prop of arg2.properties) {
                        if (prop.type === "Property") {
                            if (
                                prop.key.type === "Identifier" &&
                                prop.key.name === "id"
                            ) {
                                return;
                            }
                            if (
                                prop.key.type === "Literal" &&
                                prop.key.value?.toString() === "id"
                            ) {
                                return;
                            }
                        }
                    }
                }
                context.report({
                    message: `a.${nodeName}() should specify an id`,
                    node,
                });
            },
        };
    },
};

export default noAnonymousObjects;
