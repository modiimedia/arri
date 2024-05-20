import { test } from "vitest";

import {
    type ArriConfig,
    defineConfig,
    isArriConfig,
    isResolvedArriConfig,
} from "./config";
test("isArriConfig()", () => {
    const config: ArriConfig = {};
    expect(isArriConfig(config)).toBe(true);
    config.generators = [];
    config.entry = "app.ts";
    expect(isArriConfig(config)).toBe(true);
});
test("isResolvedArriConfig()", () => {
    const config = defineConfig({});
    expect(isResolvedArriConfig(config)).toBe(true);
});
