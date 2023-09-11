import { defineClientGeneratorPlugin } from "./plugin";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generatedModels: string[] = [];

interface TypescriptClientGeneratorOptions {
    clientName: string;
    outputFile: string;
}

export const typescriptClientGenerator = defineClientGeneratorPlugin(
    (options: TypescriptClientGeneratorOptions) => ({
        generator: async (def) => {
            if (!options.clientName) {
                throw new Error("Name is requires");
            }
            if (!options.outputFile) {
                throw new Error("No output file specified");
            }
            if (Object.keys(def.procedures).length <= 0) {
                throw new Error(
                    "No procedures found in definition file. Typescript client will not be generated.",
                );
            }
            // const result = await createTypescriptClient(
            //     def,
            //     options.clientName,
            // );
            // writeFileSync(options.outputFile, result);
        },
        options,
    }),
);
