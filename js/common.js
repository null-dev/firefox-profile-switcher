const REQUEST_TYPE_CLOSE_MANAGER = "closeManager";

const STORAGE_NATIVE_INIT = "native.init";
const STORAGE_NATIVE_CONNECTION_STATE = "native.connected";
const STORAGE_CACHE_PROFILE_LIST_KEY = "cache.profile-list";

async function subscribeToStorageKey(storageType, key, callback) {
    let result = await browser.storage[storageType].get(key);
    if(key in result) {
        callback(result[key]);
    }

    browser.storage.onChanged.addListener((changes, areaName) => {
        if(areaName === storageType && key in changes) {
            callback(changes[key].newValue);
        }
    });
}

async function subscribeToProfileList(callback) {
    subscribeToStorageKey('local', STORAGE_CACHE_PROFILE_LIST_KEY, callback);
}

async function subscribeToNativeConnectionState(callback) {
    subscribeToStorageKey('local', STORAGE_NATIVE_CONNECTION_STATE, callback);
}

async function transformAvatarUrl(url) {
    if(url != null && url.length > 0) {
        try {
            const parsed = new URL(url);
            if(parsed.protocol === 'res:') {
                return parsed.pathname;
            } else {
                console.error("Failed to transform avatar URL.", url);
            }
        } catch(e) {
            console.error("Failed to parse avatar URL.", url);
        }
    }

    // Fallback
    return '/img/avatars/modern_cros_100/avatar_anonymous.png';
}

async function fetchAndRoundAvatarAsCanvas(url) {
    const image = new Image();
    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(image, 0, 0);

    ctx.fillStyle = '#fff';
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(image.width/2, image.height/2, image.width/2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    return {canvas, context:ctx};
}
