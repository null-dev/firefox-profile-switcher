export function resolveAsset(asset) {
    return new URL(asset, import.meta.url).href;
}

