import fs from 'node:fs';
import path from 'node:path';

import { Config } from 'prettier';

export function getPrettierConfig() {
    const fileContent = fs.readFileSync(
        path.resolve(import.meta.dirname, '../../../../.prettierrc'),
        'utf8',
    );
    return JSON.parse(fileContent) as Config;
}
