import { H3Error, createError } from "h3";

export function isH3Error(input: unknown): input is H3Error {
    if (typeof input !== "object" || input == null) {
        return false;
    }
    const keys = Object.keys(input);
    if (
        keys.includes("statusCode") &&
        typeof (input as any)["statusCode"] === "number"
    ) {
        return true;
    }
    return false;
}

export function defineError(
    statusCode: number,
    opts: Partial<Omit<H3Error, "statusCode">> = {}
): H3Error {
    const statusMessage = opts.statusMessage ?? opts.message;
    const message = opts.message ?? opts.statusMessage;

    return createError({
        statusCode,
        ...opts,
        statusMessage,
        message,
    });
}
