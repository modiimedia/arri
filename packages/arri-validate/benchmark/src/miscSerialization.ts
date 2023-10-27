import AJV from "ajv/dist/jtd";
import benny from "benny";
import { a } from "../../src/_index";

const ajv = new AJV({ strictSchema: false });

const UserNotification = a.discriminator("type", {
    POST_COMMENT: a.object({
        userId: a.string(),
        postId: a.string(),
        commentId: a.string(),
        commentText: a.string(),
    }),
    POST_LIKE: a.object({
        userId: a.string(),
        postId: a.string(),
    }),
});

type UserNotification = a.infer<typeof UserNotification>;

const User = a.object({
    id: a.string(),
    name: a.nullable(a.string()),
    createdAt: a.timestamp(),
    metadata: a.nullable(
        a.object({
            numFollowers: a.number(),
            numFollowing: a.number(),
        }),
    ),
    notifications: a.array(UserNotification),
});

type User = a.infer<typeof User>;

const userInput: User = {
    id: "1",
    name: "John Doe",
    createdAt: new Date(),
    metadata: {
        numFollowers: 100,
        numFollowing: 100000,
    },
    notifications: [
        {
            type: "POST_COMMENT",
            userId: "2",
            postId: "5",
            commentId: "1",
            commentText: "You suck",
        },
        {
            type: "POST_LIKE",
            userId: "2",
            postId: "5",
        },
        {
            type: "POST_LIKE",
            userId: "2",
            postId: "5",
        },
    ],
};

function serialize1(input: User): string {
    function notificationToJson(input: UserNotification): string {
        switch (input.type) {
            case "POST_COMMENT":
                return `{"type":"POST_COMMENT","userId":"${input.userId}","postId":"${input.postId}","commentId":"${input.commentId}","commentText":"${input.commentText}"}`;
            case "POST_LIKE":
                return `{"type":"POST_LIKE","userId":"${input.userId}","postId":"${input.postId}"}`;
            default:
                return "null";
        }
    }
    return `{"id":"${input.id}","name":${
        input.name === null ? "null" : `"${input.name}"`
    },"createdAt":"${input.createdAt.toISOString()}","metadata":${
        input.metadata === null
            ? "null"
            : `{"numFollowers":${input.metadata.numFollowers},"numFollowing":${input.metadata.numFollowing}}`
    },"notifications":[${input.notifications
        .map((item) => notificationToJson(item))
        .join(",")}]}`;
}
function serialize2(input: User): string {
    let json = "";
    json += "{";
    json += `"id":`;
    json += `"${input.id}"`;
    json += `,"name":`;
    if (typeof input.name === "string") {
        json += `"${input.name}"`;
    } else {
        json += "null";
    }
    json += `,"createdAt":`;
    json += `"${input.createdAt.toISOString()}"`;
    json += `,"metadata":`;
    if (typeof input.metadata === "object" && input.metadata !== null) {
        json += "{";
        json += `"numFollowers":`;
        json += `${input.metadata.numFollowers}`;
        json += `,"numFollowing":`;
        json += `${input.metadata.numFollowing}`;
        json += "}";
    }
    json += `,"notifications":`;
    json += "[";
    for (let i = 0; i < input.notifications.length; i++) {
        const item = input.notifications[i];
        if (i !== 0) {
            json += ",";
        }
        switch (item.type) {
            case "POST_COMMENT":
                json += "{";
                json += '"userId":';
                json += `"${item.userId}"`;
                json += ',"postId":';
                json += `"${item.postId}"`;
                json += `,"commentId":`;
                json += `"${item.commentId}"`;
                json += `,"commentText":`;
                json += `"${item.commentText}"`;
                json += "}";
                break;
            case "POST_LIKE":
                json += "{";
                json += '"userId":';
                json += `"${item.userId}"`;
                json += `,"postId":`;
                json += `"${item.postId}"`;
                json += "}";
                break;
        }
    }
    json += "]";
    return json;
}

const arriCompiledSerializer = a.compile(User).serialize;
const arriCompiledSerializerV2 = a.compile(User).serializeV2;
const ajvCompiledSerializer = ajv.compileSerializer(User);
void benny.suite(
    "Misc Serialization",
    benny.add("Ternaries", () => {
        serialize1(userInput);
    }),
    benny.add("If Statements", () => {
        serialize2(userInput);
    }),
    benny.add("Arri", () => {
        a.serialize(User, userInput);
    }),
    benny.add("Arri (Compiled)", () => {
        arriCompiledSerializer(userInput);
    }),
    benny.add("Arri (Compiled V2)", () => {
        arriCompiledSerializerV2(userInput);
    }),
    benny.add("Ajv (Compiled)", () => {
        ajvCompiledSerializer(userInput);
    }),
    benny.add("JSON.stringify", () => {
        JSON.stringify(userInput);
    }),
    benny.cycle(),
    benny.complete(),
    benny.save({
        file: "misc-serialization",
        format: "chart.html",
        folder: "benchmark/dist",
    }),
);
