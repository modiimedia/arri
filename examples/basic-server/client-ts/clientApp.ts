import { ExampleClient } from "./exampleClient.rpc";

async function main() {
    const client = new ExampleClient({});
    const getUserResult = await client.users.getUser();
    console.log(getUserResult);
    const updateUserResult = await client.users.updateUser({
        userId: "12345",
    });
    console.log(updateUserResult.id);
}

void main();
