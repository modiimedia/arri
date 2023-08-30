import { type ResolvedArriConfig } from "../config";
import { getRpcMetaFromPath } from "./dev";

describe("Naming RPCs", () => {
    test("Basic route", () => {
        const config: ResolvedArriConfig = {
            rootDir: "/files/items/examples-app",
            srcDir: "src",
            entry: "",
            procedureDir: "procedures",
            procedureGlobPatterns: ["**/*.rpc.ts"],
            clientGenerators: [],
            buildDir: ".arri",
        };
        const result = getRpcMetaFromPath(
            config,
            "/files/items/example-app/src/procedures/users/getUser.rpc.ts",
        );
        expect(result?.id).toBe("users.getUser");
        expect(result?.httpPath).toBe("/users/get-user");
    });
    test("Route with weird chars", () => {
        const config: ResolvedArriConfig = {
            rootDir: "",
            srcDir: "src",
            entry: "",
            procedureDir: "procedures",
            procedureGlobPatterns: ["**/*.rpc.ts"],
            clientGenerators: [],
            buildDir: ".arri",
        };
        const result = getRpcMetaFromPath(
            config,
            "./src/procedures/(users)/!+getUser.rpc.ts",
        );
        expect(result?.id).toBe("users.getUser");
        expect(result?.httpPath).toBe("/users/get-user");
    });
});
