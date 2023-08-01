import { test } from "vitest";
import { getAllRoutesFromGlobs } from "./routes";

test("routes", async () => {
    const routes = await getAllRoutesFromGlobs([
        "**/packages/**/_routes_test_files/**/*.route.ts",
    ]);
    expect(routes.length).toBe(3);
    console.log(routes);
    for (const route of routes) {
        if (route.content.id === "UserUpdateRoute") {
            expect(route.content.method).toBe("post");
            expect(route.content.path).toBe("/users/:userId");
        }
    }
});
