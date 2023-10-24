#! /usr/bin/env node
import { defineCommand, runMain } from "citty";
import build from "./build";
import codegen from "./codegen";
import dev from "./dev";
import init from "./init";

const main = defineCommand({
    subCommands: {
        build,
        dev,
        codegen,
        init,
    },
});

void runMain(main);
