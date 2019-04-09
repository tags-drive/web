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
