<style>
    @import "./profilelist.css" scoped;

    .fake {
        opacity: 0.6;
        pointer-events: none;
    }
</style>

<script lang="ts">
import {dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, TRIGGERS} from 'svelte-dnd-action';
import {flip} from 'svelte/animate';
import ProfileCard from "./ProfileCard.svelte";
import {editorProfile, flipDurationMs, morphElement, profileIdFromEditorProfileId} from "./profilelist";
import {debounceTransform, renderComponent} from "../../../popup/popupeditor";
import type {PopupEditorState} from "~/entries/manager/components/popup/popup";

export let state: PopupEditorState;
export let scrollElement;

$: orderLookup = state.order != null ? new Set(state.order) : null;
$: displayProfiles = state.profiles.map(p => editorProfile(p, shouldDisplayProfile(p.id, orderLookup)));

function shouldDisplayProfile(profileId: string, profilesInPopup: Set<string> | null) {
    if(profilesInPopup == null) {
        // In default mode all profiles are in popup, so we should never display any profiles
        return false;
    }

    // Only display profiles that are not in the popup
    return !profilesInPopup.has(profileId)
}

const DRAG_STOPPED_US_TRIGGERS = [
    TRIGGERS.DROPPED_INTO_ZONE,
    TRIGGERS.DROPPED_OUTSIDE_OF_ANY,
];
let placeholder = null;
function updateWithDragEvent(e) {
    const {items, info} = e.detail;
    if(info.trigger === TRIGGERS.DRAG_STARTED) {
        // On drag start: Replace placeholder entry and add grayed out entry in its place
        const placeholderIndex = items.findIndex(p => p[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
        placeholder = items[placeholderIndex];
        items[placeholderIndex] = editorProfile(placeholder.profile, false);
        displayProfiles = items;
    } else {
        if(placeholder != null) {
            // Current drag is from US -> THEM
            if (DRAG_STOPPED_US_TRIGGERS.includes(info.trigger)) {
                // If item was not dropped into popup: Un-gray the grayed out entry.
                const placeholderIndex = items.findIndex(p => p.profile.id == placeholder.profile.id);
                items[placeholderIndex] = editorProfile(placeholder.profile, true);
                displayProfiles = items;
                placeholder = null;
            } else {
                if(info.trigger === TRIGGERS.DROPPED_INTO_ANOTHER) {
                    placeholder = null;
                }
                displayProfiles = [...displayProfiles];
            }
        } else {
            // Current drag is from THEM -> US
            const profileId = profileIdFromEditorProfileId(info.id);
            if (DRAG_STOPPED_US_TRIGGERS.includes(info.trigger)) {
                // If item was not dropped into popup: Un-gray the grayed out entry.
                // Remove all non-grayed out entries with the same profile ID
                const filteredItems = items.filter(p => p.id !== info.id);
                // Un-gray the grayed out entry
                const grayEntryIdx = filteredItems.findIndex(p => p.profile.id === profileId);
                filteredItems[grayEntryIdx] = editorProfile(filteredItems[grayEntryIdx].profile, true);
                displayProfiles = filteredItems;
            } else {
                displayProfiles = [...displayProfiles];
            }
        }
    }
}

function saveDragResult(e) {
    updateWithDragEvent(e);
}

function maybeDragItem(e, profile) {
    // Do not allow dragging grayed out entries
    if(!profile.real) {
        e.stopImmediatePropagation();
    }
}
function transformDraggedElement(element, data, index, currentMouseX, currentMouseY) {
    console.log("> PROFILELIST");
    debounceTransform(element, () => {
        console.log("+ PROFILELIST");
        morphElement(element, () => {
            renderComponent(element, () => new ProfileCard({
                target: element,
                props: {
                    profile: data.profile,
                    neverHover: true,
                }
            }));
        }, currentMouseX, currentMouseY);
    });
}

// Fix animation when releasing element dragged from popup
function onPreDrop(element, data, dropInfo) {
    const idx = displayProfiles.findIndex(p => p.profile.id === data.profile.id);
    if(idx !== -1) {
        dropInfo.dropIdx = idx;
    }
}

let dragDisabled = false;
</script>

<div use:dndzone={{
        items: displayProfiles,
        flipDurationMs,
        dropTargetStyle: {},
        dropTargetClasses: [],
        dragDisabled,
        dropFromOthersDisabled: dragDisabled,
        transformDraggedElement,
        morphDisabled: true,
        scrollElement,
        keyboardDisabled: true,
        alwaysTransformElement: true,
        onPreDrop
     }}
     on:consider={updateWithDragEvent}
     on:finalize={saveDragResult}
     class="profile-list">
    {#each displayProfiles as profile (profile.id)}
        <div on:mousedown={e => maybeDragItem(e, profile)}
             on:touchstart={e => maybeDragItem(e, profile)}
             animate:flip={{duration:flipDurationMs}}
             class:fake={!profile.real}>
            <ProfileCard profile={profile.profile} neverHover placeholder={!profile.real} />
        </div>
    {/each}
</div>
<!--on:consider={updateWithDragEvent}-->
<!--on:finalize={saveDragResult}-->
