import * as dartCodegen from "@arrirpc/codegen-dart";
import * as kotlinCodegen from "@arrirpc/codegen-kotlin";
import * as rustCodegen from "@arrirpc/codegen-rust";
import * as swiftCodegen from "@arrirpc/codegen-swift";
import * as typescriptCodegen from "@arrirpc/codegen-ts";

export { DEV_DEFINITION_ENDPOINT } from "./commands/dev";
export * from "./config";
export * from "./serverConfigs/_config";
export * from "./serverConfigs/_index";
export {
    type AppDefinition,
    createAppDefinition,
} from "@arrirpc/codegen-utils";

export const generators = {
    dartClient: dartCodegen.dartClientGenerator,
    kotlinClient: kotlinCodegen.kotlinClientGenerator,
    rustClient: rustCodegen.rustClientGenerator,
    typescriptClient: typescriptCodegen.typescriptClientGenerator,
    swiftClient: swiftCodegen.swiftClientGenerator,
} as const;

export const codegen = {
    dart: dartCodegen,
    kotlin: kotlinCodegen,
    rust: rustCodegen,
    swift: swiftCodegen,
    ts: typescriptCodegen,
};
