import { a } from "../../../../../../languages/ts/ts-schema/dist";
import { defineRpc } from "@arrirpc/server";

const ObjectWithPascalCaseKeys = a.object("ObjectWithPascalCaseKeys", {
    CreatedAt: a.timestamp(),
    DisplayName: a.string(),
    EmailAddress: a.optional(a.string()),
    PhoneNumber: a.nullable(a.string()),
    IsAdmin: a.optional(a.boolean()),
});

export default defineRpc({
    params: ObjectWithPascalCaseKeys,
    response: ObjectWithPascalCaseKeys,
    handler({ params }) {
        return params;
    },
});
