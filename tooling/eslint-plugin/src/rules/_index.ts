import type { Linter } from "eslint";
import noAnonymousDiscriminator from "./no-anonymous-discriminator";
import noAnonymousEnumerator from "./no-anonymous-enumerator";
import noAnonymousObject from "./no-anonymous-object";
import noAnonymousRecursive from "./no-anonymous-recursive";

export const rules = {
    "no-anonymous-discriminator": noAnonymousDiscriminator,
    "no-anonymous-enumerator": noAnonymousEnumerator,
    "no-anonymous-object": noAnonymousObject,
    "no-anonymous-recursive": noAnonymousRecursive,
} as const;

export type RuleName = keyof typeof rules;
export type PrefixedRuleName<TPrefix extends string> =
    `${TPrefix}/${keyof typeof rules}`;
export function prefixedRuleMap<T extends string>(
    prefix: T,
    rules: Record<RuleName, Linter.RuleEntry>,
): Record<PrefixedRuleName<T>, Linter.RuleEntry> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};
    for (const key of Object.keys(rules)) {
        result[`${prefix}/${key}`] = rules[key as RuleName];
    }
    return result;
}
