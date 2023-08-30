#! /usr/bin/env node
import { defineCommand, runMain } from "citty";
import codegen from "./codegen";
import dev from "./dev";

const main = defineCommand({
    subCommands: {
        dev,
        codegen,
    },
});

void runMain(main);
