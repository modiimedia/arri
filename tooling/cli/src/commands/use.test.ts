import { updatePackageJson, updatePubspecYaml } from "./use";

describe("updatePackageJson()", () => {
    it("updates relevant lines and preserves formatting", () => {
        const input = `{
    "dependencies": {
        "arri": "^0.1.1",
        "@arrirpc/client": "^0.1.1",
        "express": "^1.0.0"
    },
    "devDependencies": {
        "@arrirpc/eslint-plugin": "^0.1.1"
    }
}`;
        const expectedOutput = `{
    "dependencies": {
        "arri": "^2.0.0",
        "@arrirpc/client": "^2.0.0",
        "express": "^1.0.0"
    },
    "devDependencies": {
        "@arrirpc/eslint-plugin": "^2.0.0"
    }
}`;
        const output = updatePackageJson(input, "2.0.0");
        expect(output).toBe(expectedOutput);
    });
    it("updates relevant lines and preserves jsonc comments", () => {
        const input = `{
    "dependencies": {
        "arri": "^0.1.1", // this is a comment
        "express": "^1.0.0",
        "@arrirpc/server": "^0.1.1",
    },
    "devDependencies": {
        "@arrirpc/eslint-plugin": "^0.1.1", // this is "another comment"
    },
}`;
        const expectedOutput = `{
    "dependencies": {
        "arri": "^2.0.0", // this is a comment
        "express": "^1.0.0",
        "@arrirpc/server": "^2.0.0",
    },
    "devDependencies": {
        "@arrirpc/eslint-plugin": "^2.0.0", // this is "another comment"
    },
}`;
        const output = updatePackageJson(input, "2.0.0");
        expect(output).toBe(expectedOutput);
    });
});

describe("updatePubspecYaml()", () => {
    it("updates relevant lines while preserving formatting and comments", () => {
        const input = `dependencies:
    arri_client: 0.1.0 # this is a comment
    http: 1.0.1
    # this is another comment`;
        const expectedOutput = `dependencies:
    arri_client: ^2.0.0 # this is a comment
    http: 1.0.1
    # this is another comment`;
        const output = updatePubspecYaml(input, "2.0.0");
        expect(output).toBe(expectedOutput);
    });
});
