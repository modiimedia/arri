import { servers } from 'arri';

import config from '../ts/arri.config';

config.server = servers.goServer({
    cwd: __dirname,
});

export default config;
