import { writeFileSync } from "fs";
import path from "pathe";

const template = `import { type ArriApp } from "./index";

declare module "#virtual/app" {
    const VirtualContext: ArriApp;
    export default VirtualContext;
}
`;

async function main() {
    writeFileSync(path.resolve(__dirname, "../dist/virtual.d.ts"), template);
}

void main();
