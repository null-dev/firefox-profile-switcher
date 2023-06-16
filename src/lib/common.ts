import LazyLoad from "vanilla-lazyload";
import type {ILazyLoadInstance} from "vanilla-lazyload";
import browser from "webextension-polyfill";
import {nativeGetAvatar} from "~/lib/native";
import {derived, readable} from "svelte/store";
import type {Readable} from "svelte/store";
import {defaultGlobalOptions} from "~/lib/model/profiles";
import type {ProfileList, ProfileOrder, GlobalOptions} from "~/lib/model/profiles";
import {reducedMotionStore} from "~/lib/util/anim";

export const RECOMMENDED_CONNECTOR_VERSION = "0.0.9";

export const REQUEST_TYPE_CLOSE_MANAGER = "closeManager";

export const STORAGE_NATIVE_INIT = "native.init";
export const STORAGE_NATIVE_CONNECTION_STATE = "native.connected";
export const STORAGE_NATIVE_CONNECTOR_VERSION = "native.connector-version";
export const STORAGE_CACHE_PROFILE_LIST = "cache.profile-list";
export const STORAGE_CACHE_GLOBAL_OPTIONS = "cache.global-options";
export const STORAGE_CACHE_CUSTOM_AVATARS = "cache.custom-avatars";
export const STORAGE_CACHE_PROFILE_ORDER = "cache.profile-order";

export const EXTENSION_ID = browser.i18n.getMessage("@@extension_id");

function storageKeyStore(storageType, key, deriver?: (value: any, initial: boolean) => any): Readable<any | null> {
    let deriverOrDefault = deriver;
    if(deriverOrDefault == null)
        deriverOrDefault = z => z;
    return readable(deriverOrDefault(null, true), set => {
        browser.storage[storageType].get(key)
            .then(result => set(deriverOrDefault(result[key], false)));

        const listener = (changes, areaName) => {
            if(areaName === storageType && key in changes) {
                set(deriverOrDefault(changes[key].newValue, false));
            }
        };
        browser.storage.onChanged.addListener(listener);
        return () => browser.storage.onChanged.removeListener(listener);
    });
}

const profileOrderStore: Readable<ProfileOrder> = storageKeyStore('local', STORAGE_CACHE_PROFILE_ORDER,
    (o, initial) => initial ? o : (o ?? []));
const unsortedProfileListStore: Readable<ProfileList | null> = storageKeyStore('local', STORAGE_CACHE_PROFILE_LIST);
export const profileListStore: Readable<ProfileList | null> = derived(
    [unsortedProfileListStore, profileOrderStore],
    ([profileList, profileOrder]) => {
        // Only produce result when both profile list store and profile order store are ready
        // This prevents animations from playing when the ProfileList first starts up
        if(profileList == null || profileOrder == null) {
            return null;
        } else {
            const lookup = {};
            profileOrder.forEach((id, idx) => {
                lookup[id] = idx;
            });
            function profileIdx(id) {
                return lookup[id] ?? profileOrder.length
            }
            return {
                ...profileList,
                profiles: [...profileList.profiles].sort(
                    (a, b) => profileIdx(a.id) - profileIdx(b.id)
                )
            };
        }
    }
);
export const nativeConnectionStateStore: Readable<boolean> = storageKeyStore(
    'local',
    STORAGE_NATIVE_CONNECTION_STATE,
        state => state ?? false
);
export const nativeConnectorVersionStore = storageKeyStore('local', STORAGE_NATIVE_CONNECTOR_VERSION);
export const globalOptionsStore: Readable<GlobalOptions> = storageKeyStore('local', STORAGE_CACHE_GLOBAL_OPTIONS, options => ({
    ...defaultGlobalOptions(),
    ...(options ?? {})
}));
export const customAvatarsStore: Readable<string[]> = storageKeyStore('local', STORAGE_CACHE_CUSTOM_AVATARS,
        avatars => avatars ?? []);
export const darkModeStore: Readable<boolean> = derived(
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
export const disableAnimationsStore: Readable<boolean> = derived(
    [globalOptionsStore, reducedMotionStore],
    ([globalOptions, reducedMotion]) => {
        return reducedMotion || globalOptions.disableAnimations
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
    function loadImage(url: string | null): ILazyLoadInstance | null {
        const src = imageSrcOrPromise(url);
        if (typeof src === 'string') {
            img.src = src;
            return null;
        } else {
            return lazyLoadPromise(img, src);
        }
    }

    let lazyLoad: ILazyLoadInstance | null = loadImage(url);

    return {
        update(url: string | null) {
            lazyLoad?.destroy();
            lazyLoad = loadImage(url);
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
