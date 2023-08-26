declare module "prettier" {
    export async function format(
        input: string,
        opts: { parser: string; tabWidth?: number },
    ): Promise<string>;
}
