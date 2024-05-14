#! /usr/bin/env node
import { defineCommand, runMain } from "citty";
import build from "./commands/build";
import codegen from "./commands/codegen";
import dev from "./commands/dev";
import init from "./commands/init";

const main = defineCommand({
    subCommands: {
        build,
        dev,
        codegen,
        init,
    },
});

void runMain(main);
