export function normalizeWhitespace(input: string) {
    if (input.includes("\n\n")) {
        return normalizeWhitespace(input.split("\n\n").join("\n"));
    }
    const lines: string[] = [];
    for (const line of input.split("\n")) {
        lines.push(line.trim());
    }
    return lines.join("\n").trim();
}
