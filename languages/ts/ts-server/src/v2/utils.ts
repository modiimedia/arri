export type MaybePromise<T> = Promise<T> | T;

export const textEncoder = new TextEncoder();
export const textDecoder = new TextDecoder('utf8');
