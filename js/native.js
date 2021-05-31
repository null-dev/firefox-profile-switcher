const REQUEST_TYPE_NATIVE = "nativeRequest";

const NATIVE_NAME = "ax.nd.profile_switcher_ff";

const NATIVE_RECONNECT_INTERVAL = 5000;

class NativeException {
    constructor(message) {
        this.message = message;
    }
}

let nativePort = null;
let lastNativeReqId = 0;
let waitingNativeReqs = {};
async function initNativePort(eventCallback) {
    // We write a value to ensure browser creates the storage folder for this extension
    await browser.storage.local.set({[STORAGE_NATIVE_INIT]: true});

    try {
        nativePort = browser.runtime.connectNative(NATIVE_NAME);
        browser.storage.local.set({[STORAGE_NATIVE_CONNECTION_STATE]: true});
        console.log("Native connection established!");
    } catch(e) {
        console.error("Native component connection failure, reconnecting...", e);
        browser.storage.local.set({[STORAGE_NATIVE_CONNECTION_STATE]: false});
        browser.storage.local.set({[STORAGE_NATIVE_CONNECTOR_VERSION]: null});
        setTimeout(() => initNativePort(), NATIVE_RECONNECT_INTERVAL);
        return;
    }
    nativePort.onMessage.addListener(resp => {
        if(resp.id === -1) {
            eventCallback(resp.resp);
        } else {
            const handler = waitingNativeReqs[resp.id];
            delete waitingNativeReqs[resp.id];
            handler(resp.resp);
        }
    });
    function onNativeDisconnect(p) {
        console.error("Native component disconnected, reconnecting...", p);
        nativePort = null;
        let handlersToCall = [];
        for (const handler of Object.values(waitingNativeReqs)) {
            handlersToCall.push(handler);
        }
        waitingNativeReqs = {};
        for(const handler of handlersToCall) {
            handler({success: false, error: "The extension got disconnected from it's connector!"});
        }
        browser.storage.local.set({[STORAGE_NATIVE_CONNECTION_STATE]: false});
        setTimeout(() => initNativePort(eventCallback), NATIVE_RECONNECT_INTERVAL);
    }
    nativePort.onDisconnect.addListener(onNativeDisconnect);
    
    // Tell daemon to init
    const profileList = await browser.storage.local.get(STORAGE_CACHE_PROFILE_LIST_KEY);
    let curProfileId = null;
    if(profileList != null) {
        const profileListData = profileList[STORAGE_CACHE_PROFILE_LIST_KEY];
        if(profileListData != null) {
            curProfileId = profileListData.current_profile_id;
        }
    }
    nativeRequestInternal(nativePort, "Initialize", {
        extension_id: browser.i18n.getMessage("@@extension_id"),
        profile_id: curProfileId
    }).then(result => {
        console.debug("Native component initialization complete!", result);
    }).catch(err => {
        console.error("Failed to init native component, retrying!", err);
        nativePort.disconnect();
        onNativeDisconnect(err);
    });
}
async function initNative(eventCallback) {
    initNativePort(eventCallback);
    await browser.runtime.onMessage.addListener(async (req, sender) => {
        if(sender.id === browser.runtime.id && req.type === REQUEST_TYPE_NATIVE) {
            return new Promise(async (resolve, reject) => {
                try {
                    const result = await nativeRequestInternal(nativePort, req.command, req.data);
                    resolve({success: true, result});
                } catch(error) {
                    console.error("Internal native request error!", error);
                    resolve({success: false, error});
                }
            });
        }
    });
}

async function nativeRequest(command, data) {
    if(nativePort != null) {
        return await nativeRequestInternal(nativePort, command, data);
    } else {
        const result = await browser.runtime.sendMessage({
            type: REQUEST_TYPE_NATIVE,
            command,
            data
        });
        if(result.success) {
            return result.result;
        } else {
            throw result.error;
        }
    }
}

async function nativeRequestInternal(nativePort, command, data) {
    if(data == null) data = {};
    const builtReq = {command, ...data};
    const startTime = new Date().getTime();
    const reqId = ++lastNativeReqId;

    return new Promise((resolve, reject) => {
        waitingNativeReqs[reqId] = resp => {
            console.debug("Got native response in: " + (new Date().getTime() - startTime) + "ms.");
            if(resp.success) {
                delete resp.success;
                resolve(resp);
            } else {
                console.error("Native error!", resp);
                reject(new NativeException(resp.error));
            }
        };

        try {
            nativePort.postMessage({
                id: reqId,
                msg: builtReq
            });
        } catch(e) {
            delete waitingNativeReqs[reqId];
            reject(e);
        }
    });
}

/*async function nativeListProfiles() {
    return await nativeRequest("ListProfiles");
}*/

async function nativeLaunchProfile(profileId, url) {
    return await nativeRequest("LaunchProfile", {profile_id: profileId, url});
}

async function nativeCreateProfile(profileName, profileAvatar, profileOptions) {
    let options = profileOptions;
    if(options == null)
        options = {};

    return await nativeRequest("CreateProfile", {
        name: profileName,
        avatar: profileAvatar,
        options
    });
}

async function nativeUpdateProfile(profileId, profileName, profileAvatar, profileDefault, profileOptions) {
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

async function nativeDeleteProfile(profileId) {
    return await nativeRequest("DeleteProfile", {
        profile_id: profileId
    });
}

async function nativeUpdateOptions(changes) {
    return await nativeRequest("UpdateOptions", {
        changes
    });
}

async function nativeCloseManager() {
    return await nativeRequest("CloseManager", {});
}
