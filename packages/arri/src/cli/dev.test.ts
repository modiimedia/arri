import { type ResolvedArriConfig } from "../config";
import { getRpcMetaFromPath } from "./_common";

describe("Naming RPCs", () => {
    test("Basic route", () => {
        const config: ResolvedArriConfig = {
            port: 3000,
            rootDir: "/files/items/examples-app",
            srcDir: "src",
            entry: "",
            procedureDir: "procedures",
            procedureGlobPatterns: ["**/*.rpc.ts"],
            generators: [],
            buildDir: ".arri",
            esbuild: {},
            serverEntry: "",
            https: false,
            http2: false,
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
            port: 3000,
            rootDir: "",
            srcDir: "src",
            entry: "",
            procedureDir: "procedures",
            procedureGlobPatterns: ["**/*.rpc.ts"],
            generators: [],
            buildDir: ".arri",
            esbuild: {},
            serverEntry: "",
            https: false,
            http2: false,
        };
        const result = getRpcMetaFromPath(
            config,
            "./src/procedures/(users)/!+getUser.rpc.ts",
        );
        expect(result?.id).toBe("users.getUser");
        expect(result?.httpPath).toBe("/users/get-user");
    });
});
