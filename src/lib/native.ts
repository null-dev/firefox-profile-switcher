import browser from "webextension-polyfill";
import {
    EXTENSION_ID,
    STORAGE_CACHE_PROFILE_LIST,
    STORAGE_NATIVE_CONNECTION_STATE,
    STORAGE_NATIVE_CONNECTOR_VERSION,
    STORAGE_NATIVE_INIT
} from "~/lib/common";
import type {Profile} from "~/lib/model/profiles";

const REQUEST_TYPE_NATIVE = "nativeRequest";

const NATIVE_NAME = "ax.nd.profile_switcher_ff";

const NATIVE_RECONNECT_INTERVAL = 5000;
const NATIVE_REQUEST_TIMEOUT = 1000 * 60; // 1 min

class NativeException {
    message: string;
    constructor(message: string) {
        this.message = message;
    }
}

// TODO Cleanup the typing here
type NativeReqHandler = (any) => void;

let nativePort = null;
let lastNativeReqId = 0;
let waitingNativeReqs: Record<number, NativeReqHandler> = {};
async function initNativePort(eventCallback) {
    // We write a value to ensure browser creates the storage folder for this extension
    await browser.storage.local.set({[STORAGE_NATIVE_INIT]: true});

    try {
        nativePort = browser.runtime.connectNative(NATIVE_NAME);
        console.log("Native connection established!");
    } catch(e) {
        console.error("Native component connection failure, reconnecting...", e);

        browser.storage.local.set({[STORAGE_NATIVE_CONNECTION_STATE]: false});
        browser.storage.local.set({[STORAGE_NATIVE_CONNECTOR_VERSION]: null});
        setTimeout(() => initNativePort(eventCallback), NATIVE_RECONNECT_INTERVAL);
        return;
    }
    nativePort.onMessage.addListener(resp => {
        if(resp.id === -1) {
            eventCallback(resp.resp);
        } else {
            const handler = waitingNativeReqs[resp.id];
            if(handler != null)
                handler(resp.resp);
        }
    });
    function onNativeDisconnect(p) {
        console.error("Native component disconnected, reconnecting...", p, p.error);
        nativePort = null;
        // Clear all handlers
        let handlersToCall = Object.values(waitingNativeReqs);
        waitingNativeReqs = {};
        for(const handler of handlersToCall) {
            handler({success: false, error: "The extension got disconnected from it's connector!"});
        }
        browser.storage.local.set({[STORAGE_NATIVE_CONNECTION_STATE]: false});
        setTimeout(() => initNativePort(eventCallback), NATIVE_RECONNECT_INTERVAL);
    }
    nativePort.onDisconnect.addListener(onNativeDisconnect);

    // Tell daemon to init
    const profileList = await browser.storage.local.get(STORAGE_CACHE_PROFILE_LIST);
    let curProfileId = null;
    if(profileList != null) {
        const profileListData = profileList[STORAGE_CACHE_PROFILE_LIST];
        if(profileListData != null) {
            curProfileId = profileListData.current_profile_id;
        }
    }
    
    browser.windows.onFocusChanged.addListener(onWindowFocusChange);
    
    nativeRequestInternal(nativePort, "Initialize", {
        extension_id: EXTENSION_ID,
        extension_version: APP_VERSION,
        profile_id: curProfileId
    }).then(result => {
        console.debug("Native component initialization complete!", result);
        browser.storage.local.set({[STORAGE_NATIVE_CONNECTION_STATE]: true});
    }).catch(err => {
        console.error("Failed to init native component, retrying!", err);
        nativePort.disconnect();
        onNativeDisconnect(err);
    });
}
export function initNative(eventCallback) {
    initNativePort(eventCallback);
    browser.runtime.onMessage.addListener((req, sender) => {
        if(sender.id === browser.runtime.id && req.type === REQUEST_TYPE_NATIVE) {
            return new Promise(async (resolve, reject) => {
                try {
                    const result = await nativeRequestInternal(nativePort, req.command, req.data, req.options);
                    resolve({success: true, result});
                } catch(error) {
                    resolve({success: false, error});
                }
            });
        }
    });
}

async function nativeRequest(command, data, options?) {
    if(window.failNativeRequests === true) {
        throw new Error("window.failNativeRequests === true");
    }

    if(nativePort != null) {
        return await nativeRequestInternal(nativePort, command, data, options);
    } else {
        const result = await browser.runtime.sendMessage({
            type: REQUEST_TYPE_NATIVE,
            command,
            data,
            options
        });
        if(result.success) {
            return result.result;
        } else {
            throw result.error;
        }
    }
}

async function nativeRequestInternal(nativePort, command, data, options?) {
    if(data == null) data = {};
    const builtReq = {command, ...data};
    const startTime = new Date().getTime();
    const reqId = ++lastNativeReqId;
    const { timeout = NATIVE_REQUEST_TIMEOUT } = options ?? {};
    console.debug("Sending native request:", builtReq);

    const response = new Promise((resolve, reject) => {
        waitingNativeReqs[reqId] = resp => {
            console.debug("Got native response in: " + (new Date().getTime() - startTime) + "ms.");
            if(resp.success) {
                delete resp.success;
                resolve(resp);
            } else {
                console.error("Native error:", resp);
                reject(new NativeException(resp.error));
            }
        };

        try {
            nativePort.postMessage({
                id: reqId,
                msg: builtReq
            });
        } catch(e) {
            reject(e);
        }
    });
    const race = [response];
    if(timeout > 0) {
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new NativeException("The operation took too long to complete!"));
            }, timeout);
        });
        race.push(timeoutPromise);
    }

    try {
        return await Promise.race(race);
    } catch(e) {
        console.error("Native request error:", e);
        throw e;
    } finally {
        delete waitingNativeReqs[reqId];
    }
}

export async function nativeLaunchProfile(profileId, url?) {
    return await nativeRequest("LaunchProfile", {profile_id: profileId, url});
}

export async function nativeCreateProfile(profileName, profileAvatar, profileOptions?): Promise<{ profile: Profile }> {
    let options = profileOptions;
    if(options == null)
        options = {};

    return await nativeRequest("CreateProfile", {
        name: profileName,
        avatar: profileAvatar,
        options
    });
}

export async function nativeUpdateProfile(profileId, profileName, profileAvatar, profileDefault, profileOptions) {
    let options = profileOptions;
    if(options == null)
        options = {};

    return await nativeRequest("UpdateProfile", {
        profile_id: profileId,
        name: profileName,
        avatar: profileAvatar,
        options,
        default: profileDefault
    });
}

export async function nativeDeleteProfile(profileId) {
    return await nativeRequest("DeleteProfile", {
        profile_id: profileId
    });
}

export async function nativeUpdateOptions(changes) {
    return await nativeRequest("UpdateOptions", {
        changes
    });
}

export async function nativeCloseManager() {
    return await nativeRequest("CloseManager", {});
}

export async function nativeAddAvatars() {
    return await nativeRequest("AddAvatars", { timeout: -1 });
}

export async function nativeGetAvatar(id) {
    return await nativeRequest("GetAvatar", { avatar: id });
}

export async function nativeDeleteAvatar(id) {
    return await nativeRequest("DeleteAvatar", { avatar: id });
}

export async function nativeUpdateProfileOrder(order) {
    return await nativeRequest("UpdateProfileOrder", { order });
}

//Make the last focused window be the current "Default Profile" so that external links open in whatever was the last window you focused.
export async function onWindowFocusChange(windowID) {
    //We're not in the currently active Profile or no main window has been focused again yet
    if(windowID < 0) { return; }

    const profileList = await browser.storage.local.get(STORAGE_CACHE_PROFILE_LIST_KEY);
    if(profileList != null) {
        const profileListData = profileList[STORAGE_CACHE_PROFILE_LIST_KEY];
        if(profileListData != null) {
            const curProfile = profileListData.profiles.find((profile) => profile.id == profileListData.current_profile_id);
            if(curProfile.default == true) { return; } //Don't waste time setting default again
            
            await nativeUpdateProfile(curProfile.id, curProfile.name, curProfile.avatar, true, curProfile.options);
        }
    }
}
