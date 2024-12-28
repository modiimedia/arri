import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
    entries: ['./src/index'],
    rollup: {
        emitCJS: true,
        dts: {
            respectExternal: false,
        },
    },
    outDir: 'dist',
    clean: true,
    declaration: true,
    failOnWarn: false,
});
