import { type Rule } from "eslint";
import { type CallExpression, Node } from "estree";
import { argHasIdKey, isNestedInSchema } from "./_common";

const guardedSchemaTypes = ["object", "partial", "pick", "extend"] as const;
type SchemaType = (typeof guardedSchemaTypes)[number];

const defaultMessage = "root object schemas should specify an id";

const noAnonymousObject: Rule.RuleModule = {
    meta: {
        type: "suggestion",
    },
    create(context) {
        return {
            CallExpression: (node) => {
                if (
                    node.callee.type !== "MemberExpression" ||
                    node.callee.object.type !== "Identifier" ||
                    node.callee.object.name !== "a" ||
                    node.callee.property.type !== "Identifier"
                ) {
                    return;
                }
                const nodeName = node.callee.property.name;
                if (!guardedSchemaTypes.includes(nodeName as never)) {
                    return;
                }
                switch (nodeName as SchemaType) {
                    case "pick":
                        handlePick(node, context);
                        return;
                    case "partial":
                        handlePartial(node, context);
                        return;
                    case "extend":
                        handleExtend(node, context);
                        return;
                    case "object":
                        handleObject(node, context);
                }
            },
        };
    },
};

function handleObject(
    node: CallExpression & Rule.NodeParentExtension,
    context: Rule.RuleContext,
) {
    if (!isRootObjectSchema(node, context)) {
        return;
    }
    if (node.arguments.length < 2) {
        context.report({
            message: defaultMessage,
            node,
        });
        return;
    }
    const arg1 = node.arguments[0]!;
    const arg2 = node.arguments[1]!;
    if (arg1.type === "Literal" && (arg1.value?.toString().length ?? 0) > 0) {
        // using ID shorthand so safe to exit
        return;
    }
    if (argHasIdKey(arg2)) {
        return;
    }
    context.report({
        message: defaultMessage,
        node,
    });
}

function handlePartial(
    node: CallExpression & Rule.NodeParentExtension,
    context: Rule.RuleContext,
) {
    if (!isRootObjectSchema(node, context)) {
        return;
    }
    if (node.arguments.length < 2) {
        context.report({
            message: defaultMessage,
            node,
        });
        return;
    }
    if (argHasIdKey(node.arguments[1]!)) {
        return;
    }
    context.report({
        message: defaultMessage,
        node,
    });
}

function handlePick(
    node: CallExpression & Rule.NodeParentExtension,
    context: Rule.RuleContext,
) {
    if (!isRootObjectSchema(node, context)) {
        return;
    }
    if (node.arguments.length < 3) {
        context.report({
            message: defaultMessage,
            node,
        });
        return;
    }
    if (argHasIdKey(node.arguments[2]!)) {
        return;
    }
    context.report({
        message: defaultMessage,
        node,
    });
}

function handleExtend(
    expression: CallExpression & Rule.NodeParentExtension,
    context: Rule.RuleContext,
) {
    if (!isRootObjectSchema(expression, context)) {
        return;
    }
    if (expression.arguments.length < 3) {
        context.report({
            message: defaultMessage,
            node: expression,
        });
        return;
    }
    if (argHasIdKey(expression.arguments[2]!)) {
        return;
    }
    context.report({
        message: defaultMessage,
        node: expression,
    });
}

function isRootObjectSchema(
    node: Node,
    context: Rule.RuleContext,
    log = false,
) {
    return !isNestedInSchema(
        node,
        [...guardedSchemaTypes, "discriminator", "recursive"],
        context,
        log,
    );
}

export default noAnonymousObject;
