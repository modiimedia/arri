import { test } from "vitest";

import { type ArriConfig, isArriConfig } from "./config";
test("isArriConfig()", () => {
    const config: ArriConfig = {
        generators: [],
    };
    expect(isArriConfig(config)).toBe(true);
    config.generators = [];
    expect(isArriConfig(config)).toBe(true);
});
