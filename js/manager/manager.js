browser.runtime.onMessage.addListener((req, sender) => {
    if(sender.id === browser.runtime.id && req.type === REQUEST_TYPE_CLOSE_MANAGER) {
        window.close();
    }
});

let globalOptions = null;

let profiles = null;
let editMode = false;

let editingProfile = null;
let editingOriginalProfile = null;

let settingsOpen = false;

let profileListCommitId = 0;
async function updateProfileList() {
    if(profiles == null) return;

    const ourCommitId = ++profileListCommitId;

    const profileEntriesList = document.getElementById("profile_entries");
    const newProfileEntriesList = profileEntriesList.cloneNode(false);
    let currentProfile = null;
    for(const profile of profiles.profiles) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("card");
        wrapper.classList.add("profile-card");

        const entryPic = document.createElement("img");
        entryPic.classList.add("profile-card-image");
        entryPic.src = await transformAvatarUrl(profile.avatar);
        entryPic.draggable = false;

        const entryName = document.createElement("div");
        entryName.classList.add("profile-card-name");
        entryName.textContent = profile.name;

        wrapper.appendChild(entryPic);
        wrapper.appendChild(entryName);

        if(profile.default) {
            const entryDefault = document.createElement("div");
            entryDefault.classList.add("profile-card-default");
            entryDefault.textContent = "Default";
            wrapper.appendChild(entryDefault);
        }

        wrapper.addEventListener('click', async () => {
            if(editMode) {
                editMode = false;
                editingProfile = {...profile};
                editingOriginalProfile = {...profile};
                updateEditMode();
                updateEditPage();
            } else {
                await nativeLaunchProfile(profile.id)
                window.close();
            }
        });

        newProfileEntriesList.appendChild(wrapper);
    }

    // Commit changes only if another we are the only ones touching the profile list
    if(ourCommitId === profileListCommitId) {
        profileEntriesList.parentNode.replaceChild(newProfileEntriesList, profileEntriesList);
    }
}

const profileListWrapper = document.getElementById("profile_list_wrapper");
const profileEditToggle = document.getElementById("edit_mode_toggle_button");
function updateEditMode() {
    if(editMode) {
        profileListWrapper.classList.add("editing");
        profileEditToggle.classList.add("primary");
        profileEditToggle.textContent = "Exit edit mode";
    } else {
        profileListWrapper.classList.remove("editing");
        profileEditToggle.classList.remove("primary");
        profileEditToggle.textContent = "Edit profiles";
    }
}

async function setupProfileList() {
    subscribeToProfileList(newProfileData => {
        if(newProfileData == null) return;
        profiles = newProfileData;

        updateProfileList();
        updateEditMode();
    });
}

setupProfileList();

subscribeToGlobalOptions(newOptions => {
    globalOptions = newOptions;
});

const bottomBar = document.getElementById("bottom_bar");
const editPageScroll = document.getElementById("edit_page_scroll");
const editProfileHeaderLeft = document.getElementById("edit_profile_header_left");
const editProfileHeaderRight = document.getElementById("edit_profile_header_right");
const editProfileNameInput = document.getElementById("edit_page_profile_name_input");
editProfileNameInput.addEventListener('input', () => {
    if(editingProfile != null)
        editingProfile.name = editProfileNameInput.value;
    updateEditProfileHeader();
    updateEditButtons();
});
async function updateEditProfileHeader() {
    if(editingProfile == null) return;

    if(editingProfile.id == null) {
        editProfileHeaderLeft.textContent = "Add profile";
        editProfileHeaderRight.textContent = "";
    } else {
        editProfileHeaderLeft.textContent = "Edit profile:";
        editProfileHeaderRight.textContent = editingProfile.name;
    }
}

const AVATAR_PATH_PREFIX = "/img/avatars";
let avatarListCache = null;
let selectedAvatarElement = null;
async function updateEditPage() {
    if(editingProfile != null) {
        editPageScroll.scrollTop = 0;
        bottomBar.classList.add("expanded");
        bottomBar.classList.remove("settings-mode");
        bottomBar.classList.add("edit-mode");

        if(editingProfile.id != null) {
            editProfileNameInput.value = editingProfile.name;
        } else {
            editProfileNameInput.value = "";
        }

        updateEditProfileHeader();
        updateEditButtons();

        const avatarList = await getAvatarList();
        if(editingProfile.avatar == null) {
            editingProfile.avatar = avatarList[0];
            editingOriginalProfile.avatar = avatarList[0];
        }
        await updatePictureList(avatarList);
    } else {
        bottomBar.classList.remove("expanded");
    }
}

document.getElementById("edit_mode_toggle_button").addEventListener('click', () => {
    editMode = !editMode;
    updateEditMode();
});
document.getElementById("edit_page_close_button").addEventListener('click', () => {
    editingProfile = null;
    editingOriginalProfile = null;
    updateEditPage();
});
document.getElementById("add_profile_button").addEventListener('click', () => {
    editingProfile = {};
    editingOriginalProfile = {};
    updateEditPage();
});
document.getElementById("settings_mode_toggle_button").addEventListener('click', () => {
    if(globalOptions == null) return;
    if(profiles == null) return;
    const currentProfile = profiles.profiles.find(it => it.id === profiles.current_profile_id);
    if(currentProfile == null) return;
    deserializeSettings(currentProfile.options != null ? currentProfile.options : {}, globalOptions);

    settingsOpen = true;
    updateSettingsPage();
});

const editPageMakeDefaultButton = document.getElementById("edit_page_make_default_button");
const editPageDeleteButton = document.getElementById("edit_page_delete_button");
const editPageSaveButton = document.getElementById("edit_page_save_button");

editPageDeleteButton.addEventListener('click', async () => {
    if(editingProfile != null && editingProfile.id != null) {
        const confirmResult = confirm("Are you sure you wish to delete the profile: " + editingProfile.name + "?");
        if(!confirmResult) return;

        const editingProfileSave = editingProfile;
        editingProfile = null; // Immediately zero out editing profile to prevent any additional clicks of the button to do anything
        try {
            // Update
            await nativeDeleteProfile(editingProfileSave.id);

            // Done, bring user out of edit mode
            updateEditPage();
        } catch(e) {
            console.error(e);
            if(e.message != null) {
                alert("ERROR: " + e.message);
            } else {
                alert("An unknown error occured, please contact the developer!");
            }
            // Restore ability for user to click delete button
            editingProfile = editingProfileSave;
        }
    }
});
editPageSaveButton.addEventListener('click', async () => {
    if(editingProfile != null) {
        const editingProfileSave = editingProfile;
        editingProfile = null; // Immediately zero out editing profile to prevent any additional clicks of the button to do anything
        try {
            if(editingProfileSave.id == null) {
                // Create
                await nativeCreateProfile(editingProfileSave.name, editingProfileSave.avatar, {});
            } else {
                // Update
                await nativeUpdateProfile(editingProfileSave.id, editingProfileSave.name, editingProfileSave.avatar, editingProfileSave.default, editingProfileSave.options);
            }

            // Saved, bring user out of edit mode
            updateEditPage();
        } catch(e) {
            console.error(e);
            if(e.message != null) {
                alert("ERROR: " + e.message);
            } else {
                alert("An unknown error occured, please contact the developer!");
            }
            // Restore ability for user to save
            editingProfile = editingProfileSave;
        }
    }
});
editPageMakeDefaultButton.addEventListener('click', async () => {
    if(editingProfile != null && editingOriginalProfile != null) {
        try {
            // Update
            await nativeUpdateProfile(editingOriginalProfile.id, editingOriginalProfile.name, editingOriginalProfile.avatar, true, editingProfileSave.options);

            // Saved
            editingProfile.default = true;
            updateEditButtons();
            alert("Successfully changed default profile!");
        } catch(e) {
            console.error(e);
            if(e.message != null) {
                alert("ERROR: " + e.message);
            } else {
                alert("An unknown error occured, please contact the developer!");
            }
        }
    }
});

async function getAvatarList() {
    if(avatarListCache != null) return avatarListCache;

    const avatarListResponse = await fetch(AVATAR_PATH_PREFIX + "/avatarlist.txt");
    const avatarListText = await avatarListResponse.text();
    let result = [];
    for(const line of avatarListText.split("\n")) {
        const trimmedLine = line.trim();
        if(trimmedLine.length > 0) {
            const path = "res:" + AVATAR_PATH_PREFIX + "/" + trimmedLine;
            result.push(path);
        }
    }
    avatarListCache = result;

    return result;
}

async function updatePictureList(avatarList) {
    const pictureListElement = document.getElementById("edit_page_picture_list");
    const newPictureListElement = pictureListElement.cloneNode(false);

    let curImgElements = [];
    selectedAvatarElement = null;
    for(const avatar of avatarList) {
        const imgElement = document.createElement("img");
        imgElement.src = await transformAvatarUrl(avatar);
        imgElement.addEventListener('click', () => {
            if(selectedAvatarElement != null)
                selectedAvatarElement.classList.remove('selected');
            imgElement.classList.add('selected');
            if(editingProfile != null)
                editingProfile.avatar = avatar;
            selectedAvatarElement = imgElement;
            updateEditButtons();
        });

        if(editingProfile != null && editingProfile.avatar === avatar) {
            selectedAvatarElement = imgElement;
            imgElement.classList.add('selected');
        }

        newPictureListElement.appendChild(imgElement);
        curImgElements.push(imgElement);
    }

    pictureListElement.parentNode.replaceChild(newPictureListElement, pictureListElement);
}

async function updateEditButtons() {
    if(editingProfile != null
        && editingProfile.id != null) {
        editPageDeleteButton.style.display = "initial";
        editPageSaveButton.textContent = "Save";
        if(editingProfile.default) {
            editPageMakeDefaultButton.style.display = "none";
        } else {
            editPageMakeDefaultButton.style.display = "initial";
        }
    } else {
        editPageDeleteButton.style.display = "none";
        editPageSaveButton.textContent = "Add";
        editPageMakeDefaultButton.style.display = "none";
    }

    if(editingProfile != null
        && editingProfile.name != null
        && editingProfile.avatar != null) {
        let trimmedName = editingProfile.name.trim();
        if(trimmedName.length > 0) {
            editPageSaveButton.disabled = false;
            return;
        }
    }

    editPageSaveButton.disabled = true;
}

const settingsPageCancelButton = document.getElementById("settings_page_cancel_button");
const settingsPageSaveButton = document.getElementById("settings_page_save_button");

const settingsPageDarkModeInput = document.getElementById("settings_page_dark_mode_input");
const settingsPageDarkModeAllInput = document.getElementById("settings_page_dark_mode_all_input");
const settingsPageWindowFocusWorkaroundInput = document.getElementById("settings_page_window_focus_workaround_input");

function serializeSettings() {
    const profile = {};
    const global = {};

    // Dark mode
    profile.darkMode = settingsPageDarkModeInput.checked;
    global.darkMode = settingsPageDarkModeAllInput.checked ? profile.darkMode : null;
    global.windowFocusWorkaround = settingsPageWindowFocusWorkaroundInput.checked;

    return { profile, global };
}

function deserializeSettings(profile, global) {
    settingsPageDarkModeInput.checked = global.darkMode != null ? global.darkMode : profile.darkMode;
    settingsPageDarkModeAllInput.checked = global.darkMode != null;
    settingsPageWindowFocusWorkaroundInput.checked = global.windowFocusWorkaround === true;
}

settingsPageCancelButton.addEventListener('click', () => {
    if(savingSettings) return;

    settingsOpen = false;
    updateSettingsPage();
});

let savingSettings = false;
settingsPageSaveButton.addEventListener('click', async () => {
    if(savingSettings) return;
    savingSettings = true;

    try {
        const { profile, global } = serializeSettings();
        const currentProfile = profiles.profiles.find(it => it.id === profiles.current_profile_id);

        await nativeUpdateProfile(currentProfile.id, currentProfile.name, currentProfile.avatar, currentProfile.default, {
            ...currentProfile.options,
            ...profile
        });
        await nativeUpdateOptions(global);

        settingsOpen = false;
        updateSettingsPage();
    } catch(e) {
        console.error(e);
        if(e.message != null) {
            alert("ERROR: " + e.message);
        } else {
            alert("An unknown error occured, please contact the developer!");
        }
    }

    savingSettings = false;
});

function updateSettingsPage() {
    if(settingsOpen) {
        bottomBar.classList.add("expanded");
        bottomBar.classList.remove("edit-mode");
        bottomBar.classList.add("settings-mode");
    } else {
        bottomBar.classList.remove("expanded");
    }
}
