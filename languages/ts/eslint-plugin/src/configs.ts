import type { Linter } from 'eslint';

import plugin from './plugin';
import { prefixedRuleMap } from './rules/_index';

export const flatConfigs = {
    recommended: {
        plugins: {
            arri: plugin,
        },
        rules: prefixedRuleMap('arri', {
            'no-anonymous-object': 2,
            'no-anonymous-enumerator': 2,
            'no-anonymous-discriminator': 2,
            'no-anonymous-recursive': 2,
            'prefer-modular-imports': 0,
        }),
    } satisfies Linter.Config,
    all: {
        plugins: {
            arri: plugin,
        },
        rules: prefixedRuleMap('arri', {
            'no-anonymous-discriminator': 2,
            'no-anonymous-enumerator': 2,
            'no-anonymous-object': 2,
            'no-anonymous-recursive': 2,
            'prefer-modular-imports': 2,
        }),
    } satisfies Linter.Config,
} as const;

export default flatConfigs;
