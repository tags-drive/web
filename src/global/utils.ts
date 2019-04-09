export function isErrorStatusCode(code: number): boolean {
    return code >= 400;
}

export function isElementInPath(event: Event, ...ids: string[]): boolean {
    // We need to use type any because Event hasn't property path, composedPath and composedPath().
    // Nevertheless, it's a cross browser way to get path.
    let path = (<any>event).path || ((<any>event).composedPath && (<any>event).composedPath());
    if (path === undefined || path.length === undefined) {
        return false;
    }

    for (let i = 0; i < path.length; i++) {
        for (let j = 0; j < ids.length; j++) {
            if (path[i].id === ids[j]) {
                return true;
            }
        }
    }

    return false;
}

const sizeSuffixes: string[] = ["B", "KB", "MB", "GB", "TB"];

/**
 *
 * @param size in bytes
 * @returns size as a string. Examples: 1.5 KB, 33 MB and etc
 */
export function convertBytesToString(size: number): string {
    let suffixIndex = 0;
    // In bytes
    while (size / 1024 > 1) {
        size /= 1024;
        suffixIndex++;
    }

    if (suffixIndex >= sizeSuffixes.length) {
        return "-";
    }

    let s = size.toFixed(1);
    if (s[s.length - 1] == "0") {
        // Trim trailing dot and zero
        s = s.slice(0, s.length - 2);
    }

    return s + " " + sizeSuffixes[suffixIndex];
}
