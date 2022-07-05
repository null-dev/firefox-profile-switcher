import LazyLoad, {ILazyLoad, ILazyLoadInstance} from "vanilla-lazyload";
import browser from "webextension-polyfill";
import {nativeGetAvatar} from "~/lib/native";
import {derived, Readable, readable} from "svelte/store";
import {defaultGlobalOptions, ProfileList} from "~/lib/model/profiles";

export const RECOMMENDED_CONNECTOR_VERSION = "0.0.9";

export const REQUEST_TYPE_CLOSE_MANAGER = "closeManager";

export const STORAGE_NATIVE_INIT = "native.init";
export const STORAGE_NATIVE_CONNECTION_STATE = "native.connected";
export const STORAGE_NATIVE_CONNECTOR_VERSION = "native.connector-version";
export const STORAGE_CACHE_PROFILE_LIST_KEY = "cache.profile-list";
export const STORAGE_CACHE_GLOBAL_OPTIONS = "cache.global-options";
export const STORAGE_CACHE_CUSTOM_AVATARS = "cache.custom-avatars";

export const EXTENSION_ID = browser.i18n.getMessage("@@extension_id");

function storageKeyStore(storageType, key, deriver?): Readable<any | null> {
    let deriverOrDefault = deriver;
    if(deriverOrDefault == null)
        deriverOrDefault = z => z;
    return readable(null, set => {
        browser.storage[storageType].get(key)
            .then(result => set(deriverOrDefault(result[key])));

        const listener = (changes, areaName) => {
            if(areaName === storageType && key in changes) {
                set(deriverOrDefault(changes[key].newValue));
            }
        };
        browser.storage.onChanged.addListener(listener);
        return () => browser.storage.onChanged.removeListener(listener);
    });
}

export const profileListStore: Readable<ProfileList | null> = storageKeyStore('local', STORAGE_CACHE_PROFILE_LIST_KEY);
export const nativeConnectionStateStore: Readable<boolean> = storageKeyStore(
    'local',
    STORAGE_NATIVE_CONNECTION_STATE,
        state => state ?? false
);
export const nativeConnectorVersionStore = storageKeyStore('local', STORAGE_NATIVE_CONNECTOR_VERSION);
export const globalOptionsStore = storageKeyStore('local', STORAGE_CACHE_GLOBAL_OPTIONS, options => ({
    ...defaultGlobalOptions(),
    ...(options ?? {})
}));
export const customAvatarsStore = storageKeyStore('local', STORAGE_CACHE_CUSTOM_AVATARS,
        avatars => avatars ?? []);
export const darkModeStore = derived(
    [profileListStore, globalOptionsStore],
    ([profileList, globalOptions]) => {
        const profileDarkMode = profileList
            ?.profiles
            ?.find(it => it.id === profileList.current_profile_id)
            ?.options
            ?.darkMode;
        const globalDarkMode = globalOptions?.darkMode;
        return globalDarkMode ?? profileDarkMode ?? false;
    }
);

const FALLBACK_AVATAR_IMAGE = '/img/avatars/modern_cros_100/avatar_anonymous.png';
// Image element should always be: object-fit: cover
function imageSrcOrPromise(url: string | null): string | Promise<string> {
    if(url != null && url.length > 0) {
        try {
            const parsed = new URL(url);
            if(parsed.protocol === 'res:') {
                return parsed.pathname;
            } else if(parsed.protocol === 'custom:') {
                return (async () => {
                    let url;
                    try {
                        const avatar = await nativeGetAvatar(parsed.pathname);
                        url = `data:${avatar.mime};base64,${avatar.data}`;
                    } catch (e) {
                        console.error("Failed to load custom image:", parsed.pathname, e);
                        url = FALLBACK_AVATAR_IMAGE;
                    }
                    return url;
                })();
            } else {
                console.error("Failed to transform avatar URL.", url);
            }
        } catch(e) {
            console.error("Failed to parse avatar URL.", url, e);
        }
    }

    // Fallback
    return FALLBACK_AVATAR_IMAGE;
}

function lazyLoadPromise(img: HTMLImageElement, promise: Promise<string>): ILazyLoadInstance {
    LazyLoad.resetStatus(img);
    return new LazyLoad({
        unobserve_entered: true,
        callback_enter: async () => {
            img.src = await promise;
        }
    }, [img] as any);
}

export function loadAvatarIntoImageAction(img: HTMLImageElement, url: string | null) {
    const src = imageSrcOrPromise(url)
    let lazyLoad: ILazyLoadInstance | null = null;
    if (typeof src === 'string') {
        img.src = src;
    } else {
        lazyLoad = lazyLoadPromise(img, src);
    }

    return {
        update(url: string | null) {
            lazyLoad?.destroy();
            const src = imageSrcOrPromise(url);
            if (typeof src === 'string') {
                lazyLoad = null;
                img.src = src;
            } else {
                lazyLoad = lazyLoadPromise(img, src);
            }
        },

        destroy() {
            lazyLoad?.destroy();
        }
    };
}

export async function fetchAndRoundAvatarAsCanvas(url) {
    const image = new Image();
    const loadPromise = new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
    });
    const src = imageSrcOrPromise(url);
    if (typeof src === 'string') {
        image.src = src;
    } else {
        image.src = await src;
    }
    await loadPromise;

    const canvas = document.createElement("canvas");
    const dim = Math.min(image.width, image.height);
    canvas.width = dim;
    canvas.height = dim;
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'source-over';
    // Simulate object-fit: cover
    ctx.drawImage(
        image,
        (image.width - dim)/2,
        (image.height - dim)/2,
        dim,
        dim,
        0,
        0,
        dim,
        dim
    );

    ctx.fillStyle = '#fff';
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(dim/2, dim/2, dim/2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    return {canvas, context:ctx};
}