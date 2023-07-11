import { test } from "vitest";
import { getAllRoutes } from "./routes";

test("routes", async () => {
    const routes = await getAllRoutes([
        "**/packages/**/_routes_test_files/**/*.route.ts",
    ]);
    expect(routes.length).toBe(3);
});
