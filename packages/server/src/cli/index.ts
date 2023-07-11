#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import dev from "./dev";
import build from "./build";

const main = defineCommand({
    meta: {
        name: "arri",
    },
    subCommands: {
        dev,
        build,
    },
});

runMain(main);
