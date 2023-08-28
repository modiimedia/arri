#! /usr/bin/env node
import { defineCommand, runMain } from "citty";
import dev from "./dev";
import codegen from "./codegen";

const main = defineCommand({
    subCommands: {
        dev,
        codegen,
    },
});

void runMain(main);
