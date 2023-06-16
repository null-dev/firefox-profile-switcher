<script lang="ts">
    import settingsIcon from "~/assets/settings-gray.svg";
    import {resolveAsset} from "~/lib/util/assets";
    import type {Profile, ProfileList} from "~/lib/model/profiles";
    import {buildSearchEngine, PopupSelection} from "./search";
    import type {SearchEngine, SearchResult} from "./search";
    import {globalOptionsStore, loadAvatarIntoImageAction, REQUEST_TYPE_CLOSE_MANAGER} from "~/lib/common";
    import {nativeCloseManager, nativeLaunchProfile} from "~/lib/native";
    import browser from "webextension-polyfill";
    import PopupContentRenderer from "./PopupContentRenderer.svelte";

    export let profileList: ProfileList;

    // The profiles to display when not searching
    function getDefaultDisplayProfiles(profileList: Profile[], profileOrder: string[] | null): Profile[] {
        if(profileOrder == null) {
            return profileList;
        }

        const profilesById = {};
        for(const profile of profileList) {
            profilesById[profile.id] = profile;
        }

        const result = [];
        for(const profileId of profileOrder) {
            const profile = profilesById[profileId];
            if(profile != null) {
                result.push(profile);
            }
        }
        return result;
    }

    function getFilteredProfiles(searchQuery: string, engine: SearchEngine, currentProfileId: string, defaultDisplayProfiles: Profile[]): SearchResult[] {
        const searchResults: SearchResult[] = searchQuery.length > 0
            ? engine.search(searchQuery)
            : defaultDisplayProfiles.map(p => ({
                item: p,
                chunks: [{
                    range: p.name,
                    match: false
                }]
            }));

        return searchResults.filter(p => p.item.id != currentProfileId);
    }

    async function onEntryClick(profile) {
        try {
            await nativeLaunchProfile(profile.id)
            window.close();
        } catch(e) {
            console.error("Failed to launch profile!", e);
            alert(`ERROR: ${e.message}`);
        }
    }

    async function openManager() {
        nativeCloseManager(); // Close switchers in other profiles
        // Close switchers in our profile
        await browser.runtime.sendMessage({ type: REQUEST_TYPE_CLOSE_MANAGER });

        browser.windows.create({
            type: "detached_panel",
            url: "/src/entries/manager/index.html",
            width: 800,
            height: 600
        });
        window.close();
    }

    function onDocumentKeyDown(evt) {
        let key = evt.key;
        if(key.length === 1) {
            searchQuery += key;
        } else if(key === "Backspace") {
            searchQuery = searchQuery.slice(0, -1);
        } else if(key === "ArrowDown") {
            if(!focusFirstProfile()) {
                focusManager();
            }
        } else if(key === "ArrowUp") {
            focusManager();
        }
    }


    let searchQuery = "";
    let selection: PopupSelection | null = null;

    $: searchEngine = buildSearchEngine(profileList);
    $: defaultDisplayProfiles = getDefaultDisplayProfiles(profileList.profiles, $globalOptionsStore.popupProfileOrder);
    $: filteredProfiles = getFilteredProfiles(searchQuery, searchEngine, profileList.current_profile_id, defaultDisplayProfiles);

    /**
     * Returns false if there are no profiles
     */
    function focusFirstProfile(): boolean {
        const firstProfile = filteredProfiles[0];
        if(firstProfile != null) {
            selection = {kind: "profile", id: firstProfile.item.id};
            return true;
        }
        return false;
    }

    function focusManager() {
        selection = {kind: "manageButton"};
    }

    // Focus first profile when search query modified
    $: if(searchQuery.length > 0) {
        focusFirstProfile();
    }
</script>

<svelte:body on:keydown={onDocumentKeyDown}/>
<PopupContentRenderer
        {searchQuery}
        searchResults={filteredProfiles}
        bind:selection
        openProfile={onEntryClick}
        openManager={openManager} />
