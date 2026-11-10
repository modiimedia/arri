import { ExampleClientBooksService } from '../src/referenceClient';

export async function main() {
    const client = new ExampleClientBooksService();
    const _ = await client.getBook({ bookId: 'foo' });
}
