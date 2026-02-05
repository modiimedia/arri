import { goServer } from './goServer';
import { tsServer } from './tsServer';
import { tsServerNext } from './tsServerNext';
export { type TsServerConfig } from './tsServer';
export { type TsServerNextConfig } from './tsServerNext';
export const servers = {
    tsServer,
    tsServerNext,
    goServer,
} as const;
