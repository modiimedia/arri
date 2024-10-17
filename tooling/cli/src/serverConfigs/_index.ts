import { goServer } from "./goServer";
import { tsServer } from "./tsServer";
export { type TsServerConfig } from "./tsServer";
export const servers = {
    tsServer,
    goServer,
} as const;
