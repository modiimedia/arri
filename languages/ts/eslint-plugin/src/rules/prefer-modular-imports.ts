import { AST, Rule } from 'eslint';

const preferModularImports: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        fixable: 'code',
        messages: {
            arriModularImportError: "use Arri's modular import syntax instead",
        },
    },

    create(context) {
        return {
            ImportDeclaration(node) {
                if (node.source.value !== '@arrirpc/schema') return;
                let targetNode: (typeof node.specifiers)[number] | undefined;
                let numIdentifiers = 0;
                for (let i = 0; i < node.specifiers.length; i++) {
                    const specifier = node.specifiers[i]!;
                    if (specifier.type !== 'ImportSpecifier') continue;
                    if (specifier.imported.type !== 'Identifier') continue;
                    numIdentifiers++;
                    if (specifier.imported.name !== 'a') continue;
                    targetNode = specifier;
                }
                if (!targetNode) return;
                const fix: Rule.ReportFixer = (fixer) => {
                    if (numIdentifiers === 1) {
                        return fixer.replaceText(
                            node,
                            "import * as a from '@arrirpc/schema';",
                        );
                    }
                    const parent = node.parent as any as AST.Program;
                    if (parent.type !== 'Program')
                        return fixer.insertTextAfter(node, '');
                    const newStringParts: string[] = [];
                    let skipNext = false;
                    let importPart = '';
                    let shouldExitNext = false;
                    const loc = node.loc;
                    console.log('LOC', loc);
                    for (let i = 0; i < parent.tokens.length; i++) {
                        const token = parent.tokens[i]!;
                        if (shouldExitNext) {
                            if (token.value === ';') {
                                newStringParts.push(token.value);
                            }
                            break;
                        }
                        console.log('TOKEN', token.loc);
                        if (token.loc.start.line > (loc?.start.line ?? 0))
                            break;
                        if (token.loc.start.line !== loc?.start.line) continue;
                        if (
                            skipNext &&
                            token.type == 'Punctuator' &&
                            token.value === ','
                        ) {
                            skipNext = false;
                            continue;
                        }
                        skipNext = false;
                        if (token.type == 'Identifier' && token.value === 'a') {
                            skipNext = true;
                            continue;
                        }
                        switch (token.value) {
                            case 'import':
                            case 'from':
                            case '{':
                            case ',':
                                newStringParts.push(token.value + ' ');
                                break;
                            case '}':
                                newStringParts.push(' ' + token.value + ' ');
                                break;
                            case "'@arrirpc/schema'":
                            case '"@arrirpc/schema"':
                                importPart = token.value;
                                newStringParts.push(token.value);
                                shouldExitNext = true;
                                break;
                            default:
                                newStringParts.push(token.value);
                        }
                    }
                    return fixer.replaceText(
                        node,
                        `import * as a from ${importPart};\n${newStringParts.join('')}`,
                    );
                };
                context.report({
                    node: targetNode,
                    messageId: 'arriModularImportError',
                    fix: fix,
                });
            },
        };
    },
};

export default preferModularImports;
