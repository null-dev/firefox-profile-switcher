const currentProfileNameElement = document.getElementById("profile_current_name");
const currentProfileImgElement = document.getElementById("profile_current_img");
const manageButton = document.getElementById("manage_button");
const profilesHeader = document.getElementById("profiles_header");

function chunkFuseMatches(matches) {
    return matches.map(result => {
        let itemName = result.item.name;
        let match = result.matches[0];
        let chunks = [];
        let lastChunkEnd = 0;
        for(const chunk of match.indices) {
            if(lastChunkEnd < chunk[0]) {
                chunks.push({
                    range: itemName.substring(lastChunkEnd, chunk[0]),
                    highlight: false
                });
            }
            lastChunkEnd = chunk[1] + 1;
            chunks.push({
                range: itemName.substring(chunk[0], chunk[1] + 1),
                highlight: true
            });
        }
        let lastIndex = itemName.length - 1;
        let lastMatchIndex = match.indices[match.indices.length - 1][1];
        if(lastMatchIndex !== lastIndex) {
            chunks.push({
                range: itemName.substring(lastMatchIndex + 1, lastIndex + 1),
                highlight:false
            });
        }
        return {...result.item, matchChunks: chunks};
    });
}

let currentProfileList = null;
let currentProfilesFuse = null;
let profileListCommitId = 0;
let currentSearchQuery = "";
async function updateProfileList() {
    let profiles = currentProfileList;
    if(profiles == null) return;

    const ourCommitId = ++profileListCommitId;

    const profileEntriesList = document.getElementById("profile_entries");
    const newProfileEntriesList = profileEntriesList.cloneNode(false);
    let currentProfile = profiles.profiles.find(p => p.id === profiles.current_profile_id);

    let filteredProfiles;
    let searchQuery = currentSearchQuery;
    if(searchQuery.length > 0) {
        let searchResult = currentProfilesFuse.search(searchQuery);
        filteredProfiles = chunkFuseMatches(searchResult);
    } else {
        filteredProfiles = profiles.profiles;
    }

    filteredProfiles = filteredProfiles.filter(p => p.id != profiles.current_profile_id);
    for(const [index, profile] of filteredProfiles.entries()) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("profile-entry");
        wrapper.tabIndex = 0;

        const entryPic = document.createElement("img");
        entryPic.classList.add("profile-entry-pic");
        entryPic.src = await transformAvatarUrl(profile.avatar); // TODO Maybe we want to cache this

        const entryName = document.createElement("div");
        entryName.classList.add("profile-entry-name");
        if(profile.matchChunks != null) {
            for(const chunk of profile.matchChunks) {
                const s = document.createElement("span");
                s.textContent = chunk.range;
                if (chunk.highlight) s.classList.add("underline");
                entryName.appendChild(s);
            }
        } else entryName.textContent = profile.name;

        const entryFloat = document.createElement("div");
        entryFloat.classList.add("profile-entry-float-clear");

        wrapper.appendChild(entryPic);
        wrapper.appendChild(entryName);
        wrapper.appendChild(entryFloat);

        const onClick = async () => {
            await nativeLaunchProfile(profile.id);
            window.close();
        };

        wrapper.addEventListener('click', onClick);
        wrapper.addEventListener('keydown', evt => {
            if(evt.key === "Enter") onClick();
            else if(evt.key === "ArrowUp" && index > 0) newProfileEntriesList.children[index-1].focus();
            else if(evt.key === "ArrowDown") {
                if (index < filteredProfiles.length - 1) {
                    newProfileEntriesList.children[index+1].focus();
                } else {
                    manageButton.focus();
                }
            }
        });

        newProfileEntriesList.appendChild(wrapper);
    }
    let currentProfileImg = null;
    if(currentProfile != null)
        currentProfileImg = await transformAvatarUrl(currentProfile.avatar); // TODO Maybe we want to cache this
    // Commit changes only if another we are the only ones touching the profile list
    if(ourCommitId === profileListCommitId) {
        profileEntriesList.parentNode.replaceChild(newProfileEntriesList, profileEntriesList);
        if(currentProfile != null) {
            currentProfileNameElement.textContent = currentProfile.name;
            if(currentProfileImg != null)
                currentProfileImgElement.src = currentProfileImg;
        }
        // Focus first element during search
        if(searchQuery.length > 0) {
            const firstProfile = newProfileEntriesList.firstElementChild;
            if(firstProfile != null) firstProfile.focus();
            profilesHeader.textContent = "Search: " + searchQuery;
        } else {
            profilesHeader.textContent = "Other profiles";
        }
    }
}

async function setupProfileList() {
    subscribeToProfileList(async profiles => {
        currentProfileList = profiles;
        currentProfilesFuse = new Fuse(profiles.profiles, {
            keys: ['name'],
            includeMatches: true
        });
        updateProfileList();
    });
}

setupProfileList();

document.addEventListener("keydown", function(event) {
    let key = event.key;
    let update = false;
    if(key.length === 1) {
        currentSearchQuery += key;
        update = true;
    } else if(key === "Backspace") {
        currentSearchQuery = currentSearchQuery.slice(0, -1);
        update = true;
    } else if(key === "ArrowDown") {
        let activeElement = document.activeElement;
        if(activeElement == null || !activeElement.classList.contains('profile-entry')) {
            let firstProfile = document.querySelector(".profile-entry");
            if(firstProfile != null)
                firstProfile.focus();
        }
    } else if(key === "ArrowUp") {
        let activeElement = document.activeElement;
        if(activeElement == null || !activeElement.classList.contains('profile-entry')) {
            manageButton.focus();
        }
    }
    if(update) {
        updateProfileList();
    }
});

async function openManager() {
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
}
manageButton.addEventListener('click', openManager);
manageButton.addEventListener('keydown', evt => {
    if(evt.key === "Enter") openManager();
    else if(evt.key === "ArrowUp") {
        const lastProfile = document.querySelector("#profile_entries > *:last-child");
        if(lastProfile != null) lastProfile.focus();
    }
});

document.getElementById('complete_setup_button').addEventListener('click', () => {
    browser.tabs.create({
        url: "/js/setup/setup.html"
    });
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

const updateWarning = document.getElementById("update_available_button");
updateWarning.addEventListener('click', () => {
    browser.tabs.create({
        url: "/js/update/update.html"
    });
    window.close();
});
subscribeToNativeConnectorVersion(version => {
    if(version != null && compareVersions(RECOMMENDED_CONNECTOR_VERSION, version) >= 1) {
        updateWarning.style.display = 'block';
    } else {
        updateWarning.style.display = 'none';
    }
});
