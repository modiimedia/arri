import fs from "node:fs";
import { normalizeWhitespace, type SchemaFormType } from "arri-codegen-utils";
import { TestAppDefinition } from "arri-codegen-utils/dist/testModels";
import { a } from "arri-validate";
import path from "pathe";
import {
    type GeneratorContext,
    rustBoolFromSchema,
    rustStructFromSchema,
    createRustClient,
    rustClientGenerator,
} from "./index";

const defaultContext: GeneratorContext = {
    schemaPath: "",
    instancePath: "",
    generatedTypes: [],
    clientName: "",
};

describe("Scalar Types", () => {
    test("bool", () => {
        const schema: SchemaFormType = {
            type: "boolean",
        };
        const schemaResult = rustBoolFromSchema(schema, defaultContext);
        expect(schemaResult.fieldTemplate).toBe(`bool`);

        const nullableSchema: SchemaFormType = {
            type: "boolean",
            nullable: true,
        };
        const nullableSchemaResult = rustBoolFromSchema(
            nullableSchema,
            defaultContext,
        );
        expect(nullableSchemaResult.fieldTemplate).toBe("Option<bool>");
    });
});

describe("objects", () => {
    test("simple object", () => {
        const User = a.object(
            {
                id: a.string(),
                name: a.string(),
                date: a.timestamp(),
                isAdmin: a.boolean(),
                numFollowers: a.optional(a.float32()),
            },
            {
                id: "User",
            },
        );
        const result = rustStructFromSchema(User, {
            clientName: "",
            generatedTypes: [],
            instancePath: "",
            schemaPath: "",
        });
        expect(normalizeWhitespace(result.content)).toBe(
            normalizeWhitespace(`struct User {
            id: String,
            name: String,
            date: DateTime<FixedOffset>,
            is_admin: bool,
            num_followers: Option<f32>,
        }
        
        impl ArriModel for User {
            fn new() -> Self {
                User {
                    id: "".to_string(),
                    name: "".to_string(),
                    date: DateTime::default(),
                    is_admin: false,
                    num_followers: None,
                }
            }
            fn from_json(input: Value) -> Self {
                match input {
                    Value::Object(val) => {
                        let id = match val.get("id") {
                            Some(Value::String(id_val)) => id_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let name = match val.get("name") {
                            Some(Value::String(name_val)) => name_val.to_owned(),
                            _ => "".to_string(),
                        };
                        let date = match val.get("date") {
                            Some(Value::String(date_val)) => match DateTime::<FixedOffset>::parse_from_rfc3339(date_val.as_str()) {
                                Ok(date_val_result) => date_val_result,
                                _ => DateTime::default(),
                            },
                            _ => DateTime::default(),
                        };
                        let is_admin = match val.get("isAdmin") {
                            Some(Value::Bool(is_admin_val)) => is_admin_val,
                            _ => false,
                        };
                        let num_followers = match val.get("numFollowers") {
                            Some(Value(num_followers_val)) => match num_followers_val {
                                Some(Value::Number(num_followers_val)) => match f32::try_from(num_followers_val.as_f64().unwrap_or(0.0)) {
                                    Ok(num_followers_val_result) => Some(num_followers_val_result),
                                    _ => None,
                                },
                                _ => None,
                            },
                            _ => None,
                        }
                        Self {
                            id,
                            name,
                            date,
                            is_admin,
                            num_followers,
                        }
                    }
                }
            }
            fn from_json_string(input: String) -> Self {
                match Value::from_str(input.as_str()) {
                    Ok(val) => Self::from_json(val),
                    _ => Self::new(),
                }
            }
            fn to_json_string(&self) -> String {
                let mut output = "{".to_string();
                output.push_str("\\"id\\":");
                output.push_str(format!("\\"{}\\"", &self.id.replace("\\n", "\\\\n").replace("\\"", "\\\\\\"")).as_str());
                output.push_str(",\\"name\\":");
                output.push_str(format!("\\"{}\\"", &self.name.replace("\\n", "\\\\n").replace("\\"", "\\\\\\"")).as_str());
                output.push_str(",\\"date\\":");
                output.push_str(format!("\\"{}\\"", &self.date.to_rfc3339()).as_str());
                output.push_str(",\\"isAdmin\\":");
                output.push_str(&self.is_admin.to_string().as_str());
                match &self.num_followers {
                    Some(num_followers_val) => {
                        output.push_str(",\\"numFollowers\\":");
                        output.push_str(num_followers_val.to_string().as_str());
                    },
                    _ => {},
                };
                output.push('}');
                output
            }
            fn to_query_params_string(&self) -> String {
                let mut parts: Vec<String> = Vec::new();
                parts.push(format!("id={}", &self.id));
                parts.push(format!("name={}", &self.name));
                parts.push(format!("date={}", &self.date.to_rfc3339()));
                parts.push(format!("isAdmin={}", &self.is_admin));
                match &self.num_followers {
                    Some(num_followers_val) => {
                        parts.push(format!("numFollowers={}", num_followers_val.to_string()));
                    },
                    _ => {},
                };
                parts.join("&")
            }
        }`),
        );
    });
});

test("Test App Def", async () => {
    const outputFile = path.resolve(__dirname, "../.tmp/test_client.rpc.rs");
    if (!fs.existsSync(outputFile)) {
        fs.mkdirSync(path.resolve(__dirname, "../.tmp"));
    }
    await rustClientGenerator({
        clientName: "Test Client",
        outputFile,
    }).generator(TestAppDefinition);
    const client = fs.readFileSync(outputFile, { encoding: "utf8" });
    const referenceClient = fs
        .readFileSync(
            path.resolve(__dirname, "../../rust-reference/src/test_client.rs"),
            { encoding: "utf8" },
        )
        .split("// TESTS //")[0];
    expect(normalizeWhitespace(client)).toBe(
        normalizeWhitespace(referenceClient),
    );
});
