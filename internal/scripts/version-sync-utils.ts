export function updateCargoToml(content: string, version: string): string {
    const cargoTomlParts = content.split('\n');
    for (let i = 0; i < cargoTomlParts.length; i++) {
        const line = cargoTomlParts[i]!;
        if (line.startsWith('version = ')) {
            cargoTomlParts[i] = `version = "${version}"`;
            continue;
        }
        if (
            line.includes('path = "../') ||
            (line.includes('path="../') &&
                (line.includes('version =') || line.includes('version=')))
        ) {
            let replaceStart = line.indexOf('version = ');
            if (replaceStart < 0) {
                replaceStart = line.indexOf('version=');
            }
            let replaceEnd = -1;
            let hasSeenQuote = false;
            charLoop: for (let j = replaceStart; j < line.length; j++) {
                const char = line[j]!;
                if (char === '"' && hasSeenQuote) {
                    replaceEnd = j + 1;
                    break charLoop;
                }
                if (char === '"') {
                    hasSeenQuote = true;
                    continue charLoop;
                }
            }
            cargoTomlParts[i] = replaceRange(
                line,
                replaceStart,
                replaceEnd,
                `version = "${version}"`,
            );
            continue;
        }
    }
    return cargoTomlParts.join('\n');
}

export function replaceRange(
    input: string,
    start: number,
    end: number,
    substitute: string,
) {
    return input.substring(0, start) + substitute + input.substring(end);
}
