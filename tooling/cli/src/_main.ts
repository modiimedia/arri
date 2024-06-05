#! /usr/bin/env node
import { defineCommand, runMain } from "citty";

import build from "./commands/build";
import codegen from "./commands/codegen";
import dev from "./commands/dev";
import init from "./commands/init";
import list from "./commands/list";
import use from "./commands/use";
import version from "./commands/version";

const main = defineCommand({
    subCommands: {
        build,
        codegen,
        dev,
        init,
        list,
        use,
        version,
    },
});

void runMain(main);
