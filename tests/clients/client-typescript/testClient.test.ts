import { ArriRequestError } from "arri-client";
import { ofetch } from "ofetch";
import { TestClient } from "./testClient.rpc";

const baseUrl = "http://127.0.0.1:2020";
const headers = {
    "x-test-header": "test",
};

const client = new TestClient({
    baseUrl,
    headers,
});
const unauthenticatedClient = new TestClient({
    baseUrl,
});
test("posts.getPost", async () => {
    const result = await client.posts.getPost({ postId: "1" });
    expect(result.id).toBe("1");
});

test("posts.getPosts", async () => {
    const result = await client.posts.getPosts({ limit: 50 });
    expect(result.items.length).toBe(50);
    const result2 = await client.posts.getPosts({ limit: 100, type: "video" });
    expect(result2.items.length).toBe(100);
    for (const item of result2.items) {
        expect(item.type).toBe("video");
    }
    try {
        await client.posts.getPosts({ limit: 1000 });
        expect(false);
    } catch (err) {
        expect(err !== undefined);
        expect(err instanceof ArriRequestError);
        if (err instanceof ArriRequestError) {
            expect(err.statusCode).toBe(400);
        }
    }
});

test("posts.updatePost", async () => {
    const result = await client.posts.updatePost({
        postId: "1",
        data: {
            title: "Hello world",
            description: null,
            content: "Hello world 2.0",
            tags: ["1", "2", "3"],
        },
    });
    expect(result.id).toBe("1");
    expect(result.title).toBe("Hello world");
    expect(result.description).toBe(null);
    expect(result.content).toBe("Hello world 2.0");
    expect(result.tags.length).toBe(3);
    expect(result.tags[0]).toBe("1");
    expect(result.tags[1]).toBe("2");
    expect(result.tags[2]).toBe("3");

    const result2 = await client.posts.updatePost({
        postId: "1",
        data: {
            title: "hi",
        },
    });
    expect(result2.id).toBe("1");
    expect(result2.title).toBe("hi");
});

test("unauthenticated request", async () => {
    try {
        await unauthenticatedClient.posts.getPost({
            postId: "1",
        });
        expect(false);
    } catch (err) {
        expect(err instanceof ArriRequestError);
        if (err instanceof ArriRequestError) {
            expect(err.statusCode).toBe(401);
        }
    }
});

test("route request", async () => {
    const result = await ofetch("/routes/authors/12345", {
        method: "post",
        baseURL: baseUrl,
        headers,
        body: {
            name: "John Doe",
        },
    });
    expect(result.id).toBe("12345");
    expect(result.name).toBe("John Doe");
});

test("unauthorized route request", async () => {
    try {
        await ofetch("/routes/authors/12345", {
            method: "post",
            baseURL: baseUrl,
            body: {
                name: "John Doe",
            },
        });
    } catch (err) {
        expect(err instanceof ArriRequestError);
        if (err instanceof ArriRequestError) {
            expect(err.statusCode).toBe(401);
        }
    }
});
