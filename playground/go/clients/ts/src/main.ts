import { Client } from "./myClient.g";

async function main() {
    const client = new Client({ baseUrl: "http://localhost:3000" });

    await client.SayHello({ name: "John" });
}

main();
