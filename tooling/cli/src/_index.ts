import { dartClientGenerator } from "@arrirpc/codegen-dart";
import { kotlinClientGenerator } from "@arrirpc/codegen-kotlin";
import { rustClientGenerator } from "@arrirpc/codegen-rust";
import { swiftClientGenerator } from "@arrirpc/codegen-swift";
import { typescriptClientGenerator } from "@arrirpc/codegen-ts";

export { DEV_DEFINITION_ENDPOINT } from "./commands/dev";
export * from "./config";
export * from "./serverConfigs/_config";
export * from "./serverConfigs/_index";
export {
    type AppDefinition,
    createAppDefinition,
} from "@arrirpc/codegen-utils";

export const generators = {
    dartClient: dartClientGenerator,
    kotlinClient: kotlinClientGenerator,
    rustClient: rustClientGenerator,
    typescriptClient: typescriptClientGenerator,
    swiftClient: swiftClientGenerator,
} as const;
