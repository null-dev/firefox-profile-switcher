<style>
    @import "./popupcontent.css" scoped;
</style>

<script lang="ts">
    import settingsIcon from "~/assets/settings-gray.svg";
    import {resolveAsset} from "~/lib/util/assets";
    import {loadAvatarIntoImageAction} from "~/lib/common";
    import type {PopupSelection, SearchResult} from "./search";
    import type {Profile} from "~/lib/model/profiles";
    import {getTypedContext} from "~/lib/util/typed-context";
    import {POPUP_IN_EDITOR} from "../popup";

    export let searchQuery: String | null = null;
    export let searchResults: SearchResult[] = [];
    export let selection: PopupSelection | null = null;
    export let openProfile: ((profile: Profile) => void) | undefined;

    /** Manager button will be disabled if parameter is undefined **/
    export let openManager: (() => void) | undefined;

    let manageButton = null;

    // Propagate selection -> browser selection
    let lastSelectedElement: HTMLElement | null = null;
    $: {
        if(selection != null) {
            const selectionElement = selectionToElement(selection);
            selectionElement?.focus();
            lastSelectedElement = selectionElement;
        } else {
            lastSelectedElement?.blur();
            lastSelectedElement = null;
        }
    }

    function onEntryKeyDown(evt, idx, openFunc) {
        let stop = true;
        if(evt.key === "Enter") openFunc();
        else if(evt.key === "ArrowUp") selectIdx(idx - 1);
        else if(evt.key === "ArrowDown") selectIdx(idx + 1)
        else stop = false;
        if(stop) evt.stopPropagation();
    }
    function onProfileKeyDown(evt, idx, profile) {
        onEntryKeyDown(evt, idx, () => openProfile?.(profile));
    }
    function onManagerKeyDown(evt) {
        onEntryKeyDown(evt, searchResults.length, () => openManager?.());
    }

    /**
     * Select an entry by index. Then number of available entries is the number of search results + 1.
     * The extra entry at the end is the manager.
     * Selecting an invalid index does nothing.
     **/
    function selectIdx(idx) {
        if(idx === searchResults.length) {
            selection = {kind: "manageButton"};
        } else {
            let profileId = searchResults[idx]?.item?.id;
            if(profileId != null) {
                selection = {kind: "profile", id: profileId};
            }
        }
    }

    let profileElementRefs = {};
    // Whenever searchResults changes, remove unused ids from ref map
    $: trimUnusedProfileElements(searchResults);
    function trimUnusedProfileElements(searchResults) {
        const unusedIds = new Set(Object.keys(profileElementRefs));
        for(const result of searchResults) {
            unusedIds.delete(result.item.id);
        }
        for(const unusedId of unusedIds) {
            delete profileElementRefs[unusedId];
        }
    }
    function selectionToElement(selection: PopupSelection): HTMLElement | null {
        if(selection.kind === "manageButton") {
            return manageButton;
        } else {
            return profileElementRefs[selection.id];
        }
    }
</script>

<!-- TODO Maybe hide this if no other profiles -->
<div class="section-header">
    {#if searchQuery != null && searchQuery.length > 0}
        Search: {searchQuery}
    {:else}
        Other profiles
    {/if}
</div>
<div class="profile-entries">
    {#each searchResults as searchResult, idx (searchResult.item.id)}
        <div class="profile-entry"
             tabindex="0"
             on:click={() => openProfile?.(searchResult.item)}
             on:keydown={e => onProfileKeyDown(e, idx, searchResult.item)}
             bind:this={profileElementRefs[searchResult.item.id]}>
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
     class="profile-entry settings in-editor-blackout"
     tabindex="0"
     class:disabled={openManager == null}
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
