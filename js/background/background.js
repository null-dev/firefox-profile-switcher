async function handleEvent(event) {
    console.log("Incoming native event!", event);

    if(event.event === "ProfileList") {
        // Sort profiles
        event.profiles.sort((a, b) => a.name.localeCompare(b.name));

        browser.storage.local.set({[STORAGE_CACHE_PROFILE_LIST_KEY]: event});

        // Update browser action icon
        if(event.current_profile_id != null) {
            const currentProfile = event.profiles.find(it => it.id === event.current_profile_id);
            if(currentProfile != null) {
                const avatarUrl = await transformAvatarUrl(currentProfile.avatar);
                const {canvas, context} = await fetchAndRoundAvatarAsCanvas(avatarUrl);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                browser.browserAction.setIcon({imageData});
            }
        }
    } else if(event.event === "FocusWindow") {
        const curWindow = await browser.windows.getLastFocused({populate:false});
        if(curWindow != null)
            browser.windows.update(curWindow.id, {focused:true});
    } else if(event.event === "CloseManager") {
        browser.runtime.sendMessage({
            type: REQUEST_TYPE_CLOSE_MANAGER
        });
    }
}

initNative(handleEvent);
