import { RuleTester } from "eslint";
import noAnonymousDiscriminator from "./no-anonymous-discriminator";

const tester = new RuleTester();

tester.run("no-anonymous-discriminator", noAnonymousDiscriminator, {
    valid: [
        {
            code: `
const Message = a.discriminator("type", {
    TEXT: a.object({
        content: a.string(),
    }),
    IMAGE: a.object({
        imageUrl: a.string(),
    })
}, { id: "Message" });`,
        },
        {
            code: `
const Message = a.discriminator("Message", "type", {
    TEXT: a.object({
        content: a.string(),
    }),
    IMAGE: a.object({
        imageUrl: a.string(),
    }),
})`,
        },
    ],
    invalid: [
        {
            code: `
const Message = a.discriminator("type", {
    TEXT: a.object({
        content: a.string(),
    }),
    IMAGE: a.object({
        imageUrl: a.string(),
    }),
    MESSAGE: a.object({
        data: a.discriminator("type", {
            TEXT: a.object({
                content: a.string(),
            }),
            IMAGE: a.object({
                imageUrl: a.string(),
            })
        })
    })
})`,
            errors: [
                {
                    message: "discriminator schemas must specify an id",
                },
                {
                    message: "discriminator schemas must specify an id",
                },
            ],
        },
    ],
});
