import { type Schema } from "@arrirpc/type-defs";

import { a } from "../_index";

it("Produces valid JTD Schema", () => {
    const Schema = a.any();
    expect(JSON.parse(JSON.stringify(Schema))).toStrictEqual({
        metadata: {},
    } satisfies Schema);

    const SchemaWithMetadata = a.any({
        id: "AnySchema",
        description: "This can be any type",
    });
    expect(JSON.parse(JSON.stringify(SchemaWithMetadata))).toStrictEqual({
        metadata: {
            id: "AnySchema",
            description: "This can be any type",
        },
    });
});
