declare module "prettier" {
    export function format(input: string, opts: { parser: string }): string;
}
