/**
 * Header keys that map to message fields. They cannot be used as custom headers.
 */
export const RESERVED_HEADERS = [
    'req-id',
    'content-type',
    'accept',
    'client-version',
    'msg-id',
    'last-msg-id',
    'heartbeat-interval',
    'reason',
] as const;
export type ReservedHeader = (typeof RESERVED_HEADERS)[number];

const RESERVED_HEADER_SET: ReadonlySet<string> = new Set(RESERVED_HEADERS);

export function isReservedHeader(
    lowercaseKey: string,
): lowercaseKey is ReservedHeader {
    return RESERVED_HEADER_SET.has(lowercaseKey);
}

/**
 * Header keys starting with this prefix are reserved for transport bindings
 * (e.g. the HTTP binding's `arri-connection-id`). They cannot be used as custom headers.
 *
 * Bindings should name any headers they define using this prefix so that they never collide
 * with user defined headers. Bindings are also responsible for rejecting custom headers that collide
 * with names their underlying transport treats specially (e.g. `host` or `content-length` for HTTP).
 */
export const BINDING_HEADER_PREFIX = 'arri-' as const;

export function isBindingHeader(lowercaseKey: string): boolean {
    return lowercaseKey.startsWith(BINDING_HEADER_PREFIX);
}

const HTTP_TOKEN_REGEX = /^[A-Za-z0-9!#$%&'*+.^_`|~-]+$/;

/**
 * Header keys are case-insensitive. Use {@link normalizeHeaderKey} to get the encoded form.
 */
export function isValidHeaderKey(key: string): boolean {
    return HTTP_TOKEN_REGEX.test(key);
}

export function normalizeHeaderKey(key: string): string {
    return key.toLowerCase();
}

const PRINTABLE_ASCII_OR_TAB_REGEX = /^[\t\x20-\x7E]*$/;

/**
 * Header values may only contain printable ASCII characters (0x20-0x7E) and tabs.
 */
export function isValidHeaderValue(value: string): boolean {
    return PRINTABLE_ASCII_OR_TAB_REGEX.test(value);
}

/**
 * Remove leading and trailing whitespace from a header value.
 * Only spaces and tabs count as whitespace.
 */
export function trimHeaderValue(value: string): string {
    let start = 0;
    let end = value.length;
    while (start < end && isSpaceOrTab(value.charCodeAt(start))) start++;
    while (end > start && isSpaceOrTab(value.charCodeAt(end - 1))) end--;
    return start === 0 && end === value.length
        ? value
        : value.substring(start, end);
}

function isSpaceOrTab(charCode: number): boolean {
    return charCode === 0x20 || charCode === 0x09;
}

/**
 * Anything that can be used to initialize {@link ArriHeaders}.
 *
 * Iterables of key/value pairs include the native `Headers` class and `ArriHeaders` itself.
 */
export type ArriHeadersInit =
    | Record<string, string>
    | Iterable<readonly [string, string]>;

/**
 * Custom headers attached to a message.
 *
 * Mirrors the API of the standard `Headers` class but enforces Arri's header rules:
 *
 * - Keys are case-insensitive and are stored lowercase.
 * - Keys must be valid HTTP token characters.
 * - Reserved keys (see {@link RESERVED_HEADERS}) cannot be used.
 * - Keys starting with `arri-` are reserved for transport bindings (see {@link BINDING_HEADER_PREFIX}).
 * - Values have leading and trailing spaces/tabs removed.
 * - Values may only contain printable ASCII characters and tabs.
 *
 * Invalid input throws a `TypeError` (the same as the standard `Headers` class).
 */
export class ArriHeaders implements Iterable<[string, string]> {
    private readonly _map = new Map<string, string>();

    constructor(init?: ArriHeadersInit) {
        if (init === undefined) return;
        if (isIterable(init)) {
            for (const [key, value] of init) this.append(key, value);
            return;
        }
        for (const [key, value] of Object.entries(init)) {
            this.append(key, value);
        }
    }

    /**
     * Returns the value of the header or `null` if it isn't present.
     */
    get(key: string): string | null {
        return this._map.get(normalizeHeaderKey(key)) ?? null;
    }

    has(key: string): boolean {
        return this._map.has(normalizeHeaderKey(key));
    }

    /**
     * Set a header, replacing any existing value.
     */
    set(key: string, value: string): void {
        const [normalizedKey, normalizedValue] = validate(key, value);
        this._map.set(normalizedKey, normalizedValue);
    }

    /**
     * Add a value to a header. If the header already exists the values are joined with `", "`.
     */
    append(key: string, value: string): void {
        const [normalizedKey, normalizedValue] = validate(key, value);
        const existing = this._map.get(normalizedKey);
        this._map.set(
            normalizedKey,
            existing === undefined
                ? normalizedValue
                : `${existing}, ${normalizedValue}`,
        );
    }

    delete(key: string): void {
        this._map.delete(normalizeHeaderKey(key));
    }

    get size(): number {
        return this._map.size;
    }

    keys(): IterableIterator<string> {
        return this._map.keys();
    }

    values(): IterableIterator<string> {
        return this._map.values();
    }

    entries(): IterableIterator<[string, string]> {
        return this._map.entries();
    }

    [Symbol.iterator](): IterableIterator<[string, string]> {
        return this._map.entries();
    }

    forEach(
        callback: (value: string, key: string, headers: ArriHeaders) => void,
    ): void {
        for (const [key, value] of this._map) callback(value, key, this);
    }

    toJSON(): Record<string, string> {
        return Object.fromEntries(this._map);
    }
}

function validate(key: string, value: string): [string, string] {
    if (!isValidHeaderKey(key)) {
        throw new TypeError(
            `Invalid header key "${key}". Header keys may only contain valid HTTP token characters.`,
        );
    }
    const normalizedKey = normalizeHeaderKey(key);
    if (isReservedHeader(normalizedKey)) {
        throw new TypeError(
            `"${normalizedKey}" is a reserved header and cannot be used as a custom header.`,
        );
    }
    if (isBindingHeader(normalizedKey)) {
        throw new TypeError(
            `"${normalizedKey}" cannot be used as a custom header. Header keys starting with "${BINDING_HEADER_PREFIX}" are reserved for transport bindings.`,
        );
    }
    const normalizedValue = trimHeaderValue(value);
    if (!isValidHeaderValue(normalizedValue)) {
        throw new TypeError(
            `Invalid value for header "${normalizedKey}". Header values may only contain printable ASCII characters and tabs.`,
        );
    }
    return [normalizedKey, normalizedValue];
}

function isIterable(
    input: ArriHeadersInit,
): input is Iterable<readonly [string, string]> {
    return (
        typeof (input as Partial<Iterable<unknown>>)[Symbol.iterator] ===
        'function'
    );
}
