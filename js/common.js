const RECOMMENDED_CONNECTOR_VERSION = "0.0.7";

const REQUEST_TYPE_CLOSE_MANAGER = "closeManager";

const STORAGE_NATIVE_INIT = "native.init";
const STORAGE_NATIVE_CONNECTION_STATE = "native.connected";
const STORAGE_NATIVE_CONNECTOR_VERSION = "native.connector-version";
const STORAGE_CACHE_PROFILE_LIST_KEY = "cache.profile-list";
const STORAGE_CACHE_GLOBAL_OPTIONS = "cache.global-options";

const EXTENSION_ID = browser.i18n.getMessage("@@extension_id");

const DEFAULT_GLOBAL_OPTIONS = {
    darkMode: null
};

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

async function subscribeToNativeConnectorVersion(callback) {
    subscribeToStorageKey('local', STORAGE_NATIVE_CONNECTOR_VERSION, callback);
}

async function subscribeToGlobalOptions(callback) {
    subscribeToStorageKey('local', STORAGE_CACHE_GLOBAL_OPTIONS, options => {
        callback({
            ...DEFAULT_GLOBAL_OPTIONS,
            ...(options != null ? options : {})
        });
    });
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

// Dark mode
let profileDarkMode = false;
let globalDarkMode = false;
let darkModeListeners = [];
function updateDarkMode() {
    let dark;
    if(globalDarkMode != null) {
        dark = globalDarkMode;
    } else if(profileDarkMode != null) {
        dark = profileDarkMode;
    } else {
        dark = false;
    }
    if(dark) {
        document.documentElement.classList.add("dark-mode");
    } else {
        document.documentElement.classList.remove("dark-mode");
    }
    for(const listener of darkModeListeners) listener(dark);
}
subscribeToProfileList(profiles => {
    if(profiles != null) {
        const currentProfile = profiles.profiles.find(it => it.id === profiles.current_profile_id);
        if(currentProfile != null && currentProfile.options != null) {
            profileDarkMode = currentProfile.options.darkMode;
        } else {
            profileDarkMode = null;
        }
        updateDarkMode();
    }
});
subscribeToGlobalOptions(globalOptions => {
    if(globalOptions != null) {
        globalDarkMode = globalOptions.darkMode;
    } else {
        globalDarkMode = null;
    }
    updateDarkMode();
});
