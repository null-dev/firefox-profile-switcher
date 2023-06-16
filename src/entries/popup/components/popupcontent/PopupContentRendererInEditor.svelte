<style>
    @import "../in-editor-blackout.css" scoped;
    @import "./popupcontent.css" scoped;
</style>

<script lang="ts">
    import {resolveAsset} from "~/lib/util/assets";
    import settingsIcon from "~/assets/settings-gray.svg";
    import {
        editorProfile,
        flipDurationMs,
        morphElement,
        profileIdFromEditorProfileId
    } from "../../../manager/components/profilelist/profilelist";
    import {dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, SHADOW_PLACEHOLDER_ITEM_ID, TRIGGERS} from 'svelte-dnd-action';
    import {flip} from 'svelte/animate';
    import PopupEntryInEditor from "./PopupEntryInEditor.svelte";
    import {debounceTransform, renderComponent} from "../../popupeditor";
    import type {PopupEditorState} from "~/entries/manager/components/popup/popup";

    export let onUpdateOrder: (newOrder: string[] | null) => void | null;
    export let state: PopupEditorState;
    $: profilesDisplay = (state.order?.map(o => state.profilesLookup[o])
        .filter(p => p != null) ?? state.profiles)
        .map(p => editorProfile(p, true));

    function updateWithDragEvent(e) {
        const {items, info} = e.detail;
        console.log(info.trigger, info.id);
        console.log(JSON.stringify(items.map(p => p.id)));
        // profilesDisplay = items.filter(p => p.real);
        let overriden = false;
        if(info.trigger === TRIGGERS.DRAGGED_LEFT_ALL) {
            // In this case:
            // - It is a drag from us -> them
            // - If the drag was from us -> them and then back to us, then an item has been transferred from them to us
            //   - This element is invalid, so we need to detect it and replace it with the correct item
            if(items.length !== profilesDisplay.length) {
                // Item count doesn't match, something was added, find it
                /*const idxOfShadow = items.findIndex(p => p[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
                console.log("IDXOFSHADOW:", idxOfShadow, JSON.stringify(items));
                debugger;
                if(idxOfShadow >= 0) {
                    const shadow = items[idxOfShadow];
                    const fixedEntry = editorProfile(state.profilesLookup[profileIdFromEditorProfileId(info.id)], true);
                    items.splice(idxOfShadow, 1, {
                        ...shadow,
                        ...fixedEntry
                    });
                }*/
                const fixedEntry = editorProfile(state.profilesLookup[profileIdFromEditorProfileId(info.id)], true);
                fixedEntry[SHADOW_ITEM_MARKER_PROPERTY_NAME] = true;
                profilesDisplay = [...profilesDisplay, fixedEntry];
                overriden = true;
            }
        }
        if(!overriden) profilesDisplay = items;
    }

    function finalizeDrag(e) {
        updateWithDragEvent(e);
        onUpdateOrder?.(profilesDisplay.map(x => x.profile.id));
    }

    let wrapper: HTMLElement | null = null;
    function transformDraggedElement(element, data, index, currentMouseX, currentMouseY) {
        console.log("> POPUP");
        debounceTransform(element, () => {
            console.log("+ POPUP", element.getBoundingClientRect());
            morphElement(element, () => {
                renderComponent(element, () => new PopupEntryInEditor({
                    target: element,
                    props: {
                        profile: data.profile,
                        fakeHover: true
                    }
                }));
                if (wrapper != null) {
                    element.style.width = wrapper.clientWidth + 'px';
                }
            }, currentMouseX, currentMouseY);
        });
    }

    let dragDisabled = false;

    function onPreDrop(element, data, info) {
        const idx = profilesDisplay.findIndex(p => p.real && p.profile.id === data.profile.id);
        console.log(JSON.stringify(profilesDisplay), data.profile.id, info.dropIdx, idx);
        // if(idx != null) {
        //     info.dropIdx = idx;
        // }
    }
</script>

<div class="section-header">
    Other profiles
</div>
<!-- TODO: scrollElement -->
<div use:dndzone={{
        items: profilesDisplay,
        flipDurationMs,
        dropTargetStyle: {},
        dropTargetClasses: [],
        dragDisabled,
        dropFromOthersDisabled: dragDisabled,
        keyboardDisabled: true,
        morphDisabled: true,
        transformDraggedElement,
        onPreDrop
     }}
     on:consider={updateWithDragEvent}
     on:finalize={finalizeDrag}
     bind:this={wrapper}
     class="profile-entries">
    {#each profilesDisplay as profile, idx (profile.id)}
        <div animate:flip={{duration:flipDurationMs}}>
            <PopupEntryInEditor profile={profile.profile} />
        </div>
    {/each}
</div>
<div class="profile-entry settings in-editor-blackout in-editor no-hover">
    <img class="profile-entry-pic invert-when-dark"
         src={resolveAsset(settingsIcon)}
         alt="Settings icon"
         draggable="false"
         aria-hidden="true"/>
    <div class="profile-entry-name">Manage profiles</div>
    <div class="profile-entry-float-clear"></div>
</div>
