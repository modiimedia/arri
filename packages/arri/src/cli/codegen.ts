import { existsSync, readFileSync } from "node:fs";
import { dartClientGenerator } from "arri-codegen-dart";
import { type AppDefinition } from "arri-codegen-utils";
import { defineCommand } from "citty";
import { ofetch } from "ofetch";

const codegenDart = defineCommand({
    args: {
        location: {
            type: "positional",
            required: true,
            description:
                "The path to an Arri definition file or a url that returns an Arri definition file.",
        },
        clientName: {
            type: "string",
            alias: ["name"],
            required: true,
        },
        outFile: {
            type: "string",
            alias: ["out", "o"],
            required: true,
        },
    },
    async run({ args }) {
        const isUrl =
            args.location.startsWith("http://") ||
            args.location.startsWith("https://");
        let def: AppDefinition | undefined;
        if (isUrl) {
            const result = await ofetch(args.location);
            def = result;
        } else {
            if (!existsSync(args.location)) {
                throw new Error(`Unable to find ${args.location}`);
            }
            const jsonString = JSON.parse(
                readFileSync(args.location, { encoding: "utf-8" }),
            );
            def = jsonString;
        }
        if (!def) {
            throw new Error("Unable to load ApplicationDefinition json file");
        }
        await dartClientGenerator({
            clientName: args.clientName,
            outputFile: args.outFile,
        }).generator(def);
    },
});

const codegenTypescript = defineCommand({
    args: {
        location: {
            type: "positional",
            required: true,
            description:
                "The path to an Arri definition file or a url that returns an Arri definition file.",
        },
        clientName: {
            type: "string",
            alias: ["name"],
            required: true,
        },
        outFile: {
            type: "string",
            alias: ["out", "o"],
            required: true,
        },
    },
    run({ args }) {},
});

export default defineCommand({
    subCommands: {
        dart: codegenDart,
        typescript: codegenTypescript,
    },
    run({ args }) {},
});
