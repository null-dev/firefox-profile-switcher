<style>
    .underline {
        text-decoration: underline;
    }
    .section-header {
        border-top: 1px solid var(--in-content-button-background);
        padding: 8px 16px;
        /*color: #4f4f4f;*/
        color: var(--in-content-deemphasized-text);
    }
    .profile-entry {
        padding: 6px 16px;
    }
    .profile-entry:hover, .profile-entry:focus {
        /*background-color: #e9e9e9;*/
        background-color: var(--button-hover-light);
    }
    .profile-entry-pic {
        float: left;
        width: 22px;
        height: 22px;
        border-radius: 22px;
        object-fit: cover;

        /* Hide alt text */
        font-size: 0;
    }
    .profile-entry-float-clear {
        clear: both;
    }
    .profile-entry-name {
        padding-top: 1px;
        margin-left: 34px;
    }
    .profile-entry.settings {
        margin-top: 4px;
        border-top: 1px solid var(--in-content-button-background);
        padding-top: 8px;
        padding-bottom: 8px;
    }
    .profile-entries {
        overflow-wrap: break-word;
    }
</style>

<script lang="ts">
    import settingsIcon from "~/assets/settings-gray.svg";
    import {resolveAsset} from "~/lib/utils";
    import type {ProfileList} from "~/lib/model/profiles";
    import {buildSearchEngine} from "./search";
    import type {SearchEngine, SearchResult} from "./search";
    import {loadAvatarIntoImageAction, REQUEST_TYPE_CLOSE_MANAGER} from "~/lib/common";
    import {nativeCloseManager, nativeLaunchProfile} from "~/lib/native";
    import browser from "webextension-polyfill";

    function getFilteredProfiles(searchQuery: string, engine: SearchEngine, profileList: ProfileList): SearchResult[] {
        const searchResults: SearchResult[] = searchQuery.length > 0
            ? engine.search(searchQuery)
            : profileList.profiles.map(p => ({
                item: p,
                chunks: [{
                    range: p.name,
                    match: false
                }]
            }));

        return searchResults.filter(p => p.item.id != profileList.current_profile_id);
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

    let profileEntriesWrapper: HTMLDivElement | null = null;

    function onManagerKeyDown(evt) {
        let stop = true;
        if(evt.key === "Enter") openManager();
        else if(evt.key === "ArrowUp") {
            profileEntriesWrapper?.lastElementChild?.focus();
        } else if(evt.key === "ArrowDown") {
            // Do nothing but stopPropagation
        } else stop = false;
        if(stop)
            evt.stopPropagation();
    }

    let manageButton: HTMLElement | null = null;

    function onEntryKeyDown(evt, profile) {
        let stop = true;
        if(evt.key === "Enter") onEntryClick(profile);
        else if(evt.key === "ArrowUp") evt.currentTarget.previousElementSibling?.focus();
        else if(evt.key === "ArrowDown") {
            const nextSibling = evt.currentTarget.nextElementSibling;
            if (nextSibling != null) {
                nextSibling.focus();
            } else {
                manageButton?.focus();
            }
        } else stop = false;
        if(stop)
            evt.stopPropagation();
    }

    function onDocumentKeyDown(evt) {
        let key = evt.key;
        if(key.length === 1) {
            searchQuery += key;
        } else if(key === "Backspace") {
            searchQuery = searchQuery.slice(0, -1);
        } else if(key === "ArrowDown") {
            const entry = profileEntriesWrapper?.firstElementChild;
            if(entry != null) {
                entry?.focus();
            } else {
                manageButton?.focus();
            }
        } else if(key === "ArrowUp") {
            manageButton?.focus();
        }
    }

    export let profileList: ProfileList;

    let searchQuery = "";

    $: searchEngine = buildSearchEngine(profileList);
    $: filteredProfiles = getFilteredProfiles(searchQuery, searchEngine, profileList);

    // Focus first profile in search
    $: if(searchQuery.length > 0) {
        profileEntriesWrapper?.firstElementChild?.focus();
    }
</script>

<svelte:body on:keydown={onDocumentKeyDown}/>
<div class="section-header">
    {#if searchQuery.length > 0}
        Search: {searchQuery}
    {:else}
        Other profiles
    {/if}
</div>
<div bind:this={profileEntriesWrapper} class="profile-entries">
    {#each filteredProfiles as searchResult (searchResult.item.id)}
        <div class="profile-entry"
             tabindex="0"
             on:click={() => onEntryClick(searchResult.item)}
             on:keydown={e => onEntryKeyDown(e, searchResult.item)}>
            <img class="profile-entry-pic"
                 use:loadAvatarIntoImageAction={searchResult.item.avatar}
                 alt="Profile avatar" />
            <div class="profile-entry-name">
                {#each searchResult.chunks as chunk}
                    {#if chunk.match}
                        <span class="underline">{chunk.range}</span>
                    {:else}
                        {chunk.range}
                    {/if}
                {/each}
            </div>
            <div class="profile-entry-float-clear"></div>
        </div>
    {/each}
</div>
<div bind:this={manageButton}
     class="profile-entry settings"
     tabindex="0"
     on:click={openManager}
     on:keydown={onManagerKeyDown}>
    <img class="profile-entry-pic invert-when-dark"
         src={resolveAsset(settingsIcon)}
         alt="Settings icon"
         draggable="false"
         aria-hidden="true"/>
    <div class="profile-entry-name">Manage profiles</div>
    <div class="profile-entry-float-clear"></div>
</div>
