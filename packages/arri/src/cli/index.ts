import { defineCommand, runMain } from "citty";
import { dev } from "./dev";

const main = defineCommand({
    subCommands: {
        dev,
    },
});

void runMain(main);
