const currentProfileNameElement = document.getElementById("profile_current_name");
const currentProfileImgElement = document.getElementById("profile_current_img");

let profileListCommitId = 0;
async function setupProfileList() {
    subscribeToProfileList(async profiles => {
        if(profiles == null) return;

        const ourCommitId = ++profileListCommitId;

        const profileEntriesList = document.getElementById("profile_entries");
        const newProfileEntriesList = profileEntriesList.cloneNode(false);
        let currentProfile = null;
        for(const profile of profiles.profiles) {
            if(profile.id === profiles.current_profile_id) {
                currentProfile = profile;
            } else {
                const wrapper = document.createElement("div");
                wrapper.classList.add("profile-entry");

                const entryPic = document.createElement("img");
                entryPic.classList.add("profile-entry-pic");
                entryPic.src = await transformAvatarUrl(profile.avatar);

                const entryName = document.createElement("div");
                entryName.classList.add("profile-entry-name");
                entryName.textContent = profile.name;

                const entryFloat = document.createElement("div");
                entryFloat.classList.add("profile-entry-float-clear");

                wrapper.appendChild(entryPic);
                wrapper.appendChild(entryName);
                wrapper.appendChild(entryFloat);

                wrapper.addEventListener('click', async () => {
                    await nativeLaunchProfile(profile.id)
                    window.close();
                });

                newProfileEntriesList.appendChild(wrapper);
            }
        }
        let currentProfileImg = null;
        if(currentProfile != null)
            currentProfileImg = await transformAvatarUrl(currentProfile.avatar);
        // Commit changes only if another we are the only ones touching the profile list
        if(ourCommitId === profileListCommitId) {
            profileEntriesList.parentNode.replaceChild(newProfileEntriesList, profileEntriesList);
            if(currentProfile != null) {
                currentProfileNameElement.textContent = currentProfile.name;
                if(currentProfileImg != null)
                    currentProfileImgElement.src = currentProfileImg;
            }
        }
    });
}

setupProfileList();

document.getElementById("manage_button").addEventListener('click', async () => {
    // Close other switchers
    nativeCloseManager(); 
    await browser.runtime.sendMessage({ type: REQUEST_TYPE_CLOSE_MANAGER });

    browser.windows.create({
        type: "detached_panel",
        url: "/js/manager/index.html",
        width: 800,
        height: 600
    });
    window.close();
});

document.getElementById('complete_setup_button').addEventListener('click', () => {
    window.open('https://github.com/null-dev/firefox-profile-switcher-connector/wiki/Download-connector-software', '_blank');
    window.close();
});

const popupContent = document.getElementById("popup_content");
const warningContent = document.getElementById("warning_content");
subscribeToNativeConnectionState(state => {
    if(state) {
        popupContent.style.display = 'initial';
        warningContent.style.display = 'none';
    } else {
        popupContent.style.display = 'none';
        warningContent.style.display = 'initial';
    }
});
