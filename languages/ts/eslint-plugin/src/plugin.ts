import type { ESLint } from 'eslint';

import { prefixedRuleMap, rules as allRules } from './rules/_index';

export const meta: ESLint.Plugin['meta'] = {
    name: '@arrirpc',
};

export const configs: ESLint.Plugin['configs'] = {
    'legacy-config-recommended': {
        plugins: ['@arrirpc'],
        rules: prefixedRuleMap('@arrirpc', {
            'no-anonymous-object': 2,
            'no-anonymous-recursive': 2,
            'no-anonymous-discriminator': 2,
            'no-anonymous-enumerator': 2,
            'prefer-modular-imports': 0,
        }),
    },
    'legacy-config-all': {
        plugins: ['@arrirpc'],
        rules: prefixedRuleMap('@arrirpc', {
            'no-anonymous-object': 2,
            'no-anonymous-recursive': 2,
            'no-anonymous-discriminator': 2,
            'no-anonymous-enumerator': 2,
            'prefer-modular-imports': 2,
        }),
    },
};

export const rules = allRules;

type DefaultExport = {
    meta: ESLint.Plugin['meta'];
    configs: ESLint.Plugin['configs'];
    rules: typeof allRules;
};
const defaultExport: DefaultExport = { meta, configs, rules: allRules };

export default defaultExport;
