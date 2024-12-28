import {
    updateCargoToml,
    updateGoMod,
    updatePackageJson,
    updatePubspecYaml,
} from './use';

describe('updatePackageJson()', () => {
    it('updates relevant lines and preserves formatting', () => {
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
        const output = updatePackageJson(input, '2.0.0');
        expect(output.content).toBe(expectedOutput);
        expect(output.updated).toBe(true);
    });
    it('updates relevant lines and preserves jsonc comments', () => {
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
        const output = updatePackageJson(input, '2.0.0');
        expect(output.content).toBe(expectedOutput);
        expect(output.updated).toBe(true);
    });
});

describe('updatePubspecYaml()', () => {
    it('updates relevant lines while preserving formatting and comments', () => {
        const input = `dependencies:
    arri_client: 0.1.0 # this is a comment
    http: 1.0.1
    # this is another comment`;
        const expectedOutput = `dependencies:
    arri_client: ^2.0.0 # this is a comment
    http: 1.0.1
    # this is another comment`;
        const output = updatePubspecYaml(input, '2.0.0');
        expect(output.content).toBe(expectedOutput);
        expect(output.updated).toBe(true);
    });
});

describe('updateCargoToml()', () => {
    it('updates relevant lines while preserving formatting and comments', () => {
        const input1 = `[package]
name = "rust"
version = "0.0.1"
# this is a comment
edition = "2021"

[dependencies]
arri_client = "0.1.0" # this is another comment
tokio = { version = "1.39.2", features = ["full"] }`;
        const expectedOutput1 = `[package]
name = "rust"
version = "0.0.1"
# this is a comment
edition = "2021"

[dependencies]
arri_client = "2.0.0" # this is another comment
tokio = { version = "1.39.2", features = ["full"] }`;
        const output = updateCargoToml(input1, '2.0.0');
        expect(output.content).toBe(expectedOutput1);
        expect(output.updated).toBe(true);
        const input2 = `[package]
name = "rust"
version = "0.0.1"
# this is a comment
edition = "2021"

[dependencies]
arri_client = { version = '0.1.0' } # this is another comment
tokio = { version = "1.39.2", features = ["full"] }`;
        const expectedOutput2 = `[package]
name = "rust"
version = "0.0.1"
# this is a comment
edition = "2021"

[dependencies]
arri_client = { version = '2.1.1' } # this is another comment
tokio = { version = "1.39.2", features = ["full"] }`;
        const output2 = updateCargoToml(input2, '2.1.1');
        expect(output2.content).toBe(expectedOutput2);
        expect(output.updated).toBe(true);
    });
});

describe('updateGoMod()', () => {
    it('updates relevant lines', () => {
        const input = `module main

go 1.23.3

require github.com/modiimedia/arri v0.66.0

require (
	github.com/iancoleman/strcase v0.3.0 // indirect
	github.com/tidwall/gjson v1.18.0 // indirect
	github.com/tidwall/match v1.1.1 // indirect
	github.com/tidwall/pretty v1.2.1 // indirect
)
`;
        const expectedOutput = `module main

go 1.23.3

require github.com/modiimedia/arri v1.12.0

require (
	github.com/iancoleman/strcase v0.3.0 // indirect
	github.com/tidwall/gjson v1.18.0 // indirect
	github.com/tidwall/match v1.1.1 // indirect
	github.com/tidwall/pretty v1.2.1 // indirect
)
`;
        const output = updateGoMod(input, '1.12.0');
        expect(output.content).toBe(expectedOutput);
    });
    it('updates relevant lines and preserves comments', () => {
        const input = `module main

go 1.23.3

require github.com/modiimedia/arri v0.66.0 // this is a comment

require (
	github.com/iancoleman/strcase v0.3.0 // indirect
	github.com/tidwall/gjson v1.18.0 // indirect
	github.com/tidwall/match v1.1.1 // indirect
	github.com/tidwall/pretty v1.2.1 // indirect
)
`;
        const expectedOutput = `module main

go 1.23.3

require github.com/modiimedia/arri v1.12.0 // this is a comment

require (
	github.com/iancoleman/strcase v0.3.0 // indirect
	github.com/tidwall/gjson v1.18.0 // indirect
	github.com/tidwall/match v1.1.1 // indirect
	github.com/tidwall/pretty v1.2.1 // indirect
)
`;
        const output = updateGoMod(input, '1.12.0');
        expect(output.content).toBe(expectedOutput);
    });
});
