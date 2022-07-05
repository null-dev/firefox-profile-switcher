export function resolveAsset(asset) {
    return new URL(asset, import.meta.url).href;
}

let lastUniqueId = 0;
export function getUniqueElementId(): string {
    return `01G6Z1875MYT1SWAAYCRJH7GPE-${++lastUniqueId}`
}