import { ExampleClient } from "./exampleClient.rpc";

async function main() {
    const client = new ExampleClient({});
    const getUserResult = await client.users.getUser({
        userId: "1",
    });
    console.log(getUserResult);
    const updateUserResult = await client.users.updateUser({
        userId: "1",
        data: {
            name: "Suzy Q",
            email: "suzyq@gmail.com",
            createdAt: new Date().getTime(),
        },
    });
    console.log(updateUserResult);
}

void main();
