import { execSync } from 'child_process';
import { defineCommand, runMain } from 'citty';

const bundleBenchmark = defineCommand({
    run() {
        execSync(`pnpm jiti scripts/bundle-benchmark.ts`, {
            stdio: 'inherit',
        });
    },
});

runMain({
    subCommands: {
        'bundle-benchmark': bundleBenchmark,
    },
});
