/**
 * Error codes raised by Arri itself when a message or call cannot be processed.
 */
export const ARRI_ERROR_CODES = [
    /** Malformed message, broken framing, message sent in the wrong direction, duplicate req-id, or unsupported protocol version */
    'PROTOCOL_ERROR',
    /** No procedure exists with the requested rpc name */
    'PROCEDURE_NOT_FOUND',
    /** The input failed to decode or failed validation. `data` describes the failures. */
    'INVALID_INPUT',
    /** The input's content type is unknown or unsupported */
    'UNSUPPORTED_CONTENT_TYPE',
    /** The server cannot produce the content type the client accepts */
    'NOT_ACCEPTABLE',
    /** The message exceeds the maximum allowed size */
    'MESSAGE_TOO_LARGE',
    /** The server's own output failed to encode or failed validation */
    'OUTPUT_ENCODING_ERROR',
] as const;

/**
 * General purpose error codes. Intended for use by applications, but may also be raised by Arri.
 */
export const GENERAL_ERROR_CODES = [
    'BAD_REQUEST',
    'UNAUTHENTICATED',
    'PERMISSION_DENIED',
    'NOT_FOUND',
    'CONFLICT',
    'FAILED_PRECONDITION',
    'RATE_LIMITED',
    'INTERNAL',
    'UNIMPLEMENTED',
    'UNAVAILABLE',
    'TIMEOUT',
    'UNKNOWN',
] as const;

/**
 * Error codes created by clients for failures that happen on the client side.
 * These are never sent over the wire.
 */
export const CLIENT_ERROR_CODES = [
    /** The call was cancelled by the client */
    'CANCELLED',
    /** The connection failed or was lost */
    'CONNECTION_ERROR',
    /** The server's response could not be decoded */
    'INVALID_RESPONSE',
] as const;

export const ERROR_CODES = [
    ...ARRI_ERROR_CODES,
    ...GENERAL_ERROR_CODES,
    ...CLIENT_ERROR_CODES,
] as const;

/**
 * A broad category of error. Generic code (retry logic, middleware, etc) can act on the code without
 * needing to understand the specific error `type`.
 */
export type ErrorCode = (typeof ERROR_CODES)[number];

const ERROR_CODE_SET: ReadonlySet<string> = new Set(ERROR_CODES);

export function isErrorCode(input: unknown): input is ErrorCode {
    return typeof input === 'string' && ERROR_CODE_SET.has(input);
}

/**
 * Error codes that indicate a transient failure. By default clients may retry calls that fail with these codes.
 *
 * Note: this only means the failure is transient. Whether it is safe to retry a call also depends
 * on whether the procedure is idempotent.
 */
export const RETRYABLE_ERROR_CODES = [
    'UNAVAILABLE',
    'TIMEOUT',
    'RATE_LIMITED',
    'CONNECTION_ERROR',
] as const satisfies readonly ErrorCode[];

const RETRYABLE_ERROR_CODE_SET: ReadonlySet<string> = new Set(
    RETRYABLE_ERROR_CODES,
);

export function isRetryableErrorCode(code: string): boolean {
    return RETRYABLE_ERROR_CODE_SET.has(code);
}

/**
 * The decoded body of an ERROR message. The HTTP binding sends this same shape as its JSON response body.
 *
 * - `code` is the broad category of the error (e.g. `NOT_FOUND`).
 * - `type` identifies the specific error (e.g. `USER_NOT_FOUND`) and is defined by the application.
 *
 * `type` + `data` follow the same shape as an adjacently tagged union (tagKey: "type", valueKey: "data"),
 * which allows procedures to declare typed errors. Clients that don't recognize `type` should fall back
 * to a generic error and leave `data` undecoded.
 */
export interface ArriErrorPayload<TData = unknown> {
    /**
     * Receivers must treat codes they don't recognize as `UNKNOWN`.
     */
    code: ErrorCode | (string & {});
    message: string;
    type?: string;
    data?: TData;
    /**
     * Only included in development builds
     */
    trace?: string[];
}
