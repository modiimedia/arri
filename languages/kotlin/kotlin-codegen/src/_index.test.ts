import fs from "node:fs";
import {
    type AppDefinition,
    normalizeWhitespace,
} from "@arrirpc/codegen-utils";
import path from "pathe";
import { kotlinClientFromAppDefinition } from "./_index";

test("output matches the reference client", () => {
    const referenceSchema = fs.readFileSync(
        path.resolve(
            __dirname,
            "../../../../tests/test-files/AppDefinition.json",
        ),
        {
            encoding: "utf8",
        },
    );
    const referenceClient = fs.readFileSync(
        path.resolve(
            __dirname,
            "../reference/src/main/kotlin/ExampleClient.kt",
        ),
        {
            encoding: "utf8",
        },
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = kotlinClientFromAppDefinition(JSON.parse(referenceSchema), {
        clientName: "ExampleClient",
        outputFile: "",
    });
    expect(normalizeWhitespace(result)).toBe(
        normalizeWhitespace(referenceClient),
    );
});

test("blah", () => {
    const appDef: AppDefinition = {
        arriSchemaVersion: "0.0.4",
        procedures: {
            sayHello: {
                transport: "http",
                method: "get",
                path: "/say-hello",
                params: "SayHelloParams",
                response: "SayHelloResponse",
            },
            "animals.getAnimal": {
                transport: "http",
                method: "get",
                path: "/get-animal",
                params: "GetAnimalParams",
                response: "GetAnimalResponse",
            },
        },
        models: {},
    };
    const client = kotlinClientFromAppDefinition(appDef, {
        clientName: "Client",
        modelPrefix: undefined,
        outputFile: "",
    });
    fs.writeFileSync(
        path.resolve(__dirname, "../.temp/HelloClient.kt"),
        client,
    );
});
