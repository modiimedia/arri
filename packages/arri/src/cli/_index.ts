#! /usr/bin/env node
import { defineCommand, runMain } from "citty";
import build from "./build";
import codegen from "./codegen";
import dev from "./dev";

const main = defineCommand({
    subCommands: {
        build,
        dev,
        codegen,
    },
});

void runMain(main);
