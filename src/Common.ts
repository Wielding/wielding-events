export function deepCopy<T>(o: T): T {
    return JSON.parse(JSON.stringify(o));
}
