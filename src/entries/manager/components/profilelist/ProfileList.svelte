<style>
    @import "./profilelist.css" scoped;
</style>

<script lang="ts">
import ProfileCard from "./ProfileCard.svelte";
import {profileListStore} from "~/lib/common";
import {scale, slide, fade} from "svelte/transition";
import {dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, TRIGGERS} from 'svelte-dnd-action';
import {flip} from 'svelte/animate';
import {getTypedContext} from "~/lib/util/typed-context";
import {CURRENT_OPERATION, EDIT_MODE_CONTEXT, NEW_PROFILE_EVENT, OperationKind} from "../manager";
import Dimmer from "~/lib/components/loader/Dimmer.svelte";
import type {Profile, ProfileOrder} from "~/lib/model/profiles";
import {nativeUpdateProfileOrder} from "~/lib/native";
import {flipDurationMs} from "./profilelist";
import {DragManager} from "~/lib/util/drag";

export let scrollElement;

const editMode = getTypedContext(EDIT_MODE_CONTEXT);
const newProfileEvent = getTypedContext(NEW_PROFILE_EVENT);
const currentOperation = getTypedContext(CURRENT_OPERATION);

$: profiles = $profileListStore?.profiles ?? [];
$: profilesDisplay = [...profiles];
$: existingProfileOrder = calcProfileOrder(profiles);

function calcProfileOrder(profiles: Profile[]): ProfileOrder {
    return profiles.map(x => x.id)
}
function areProfileOrdersEqual(a: ProfileOrder, b: ProfileOrder): boolean {
    return a.length === b.length && a.every((id, idx) => id === b[idx])
}

let dragManager = new DragManager();
const draggingIdStore = dragManager.draggingIdStore();
function updateWithDragEvent(e) {
    const {items, info} = e.detail;
    dragManager.onConsider(info);

    if($editMode) {
        profilesDisplay = items;
    }
}

async function saveDragResult(e) {
    try {
        updateWithDragEvent(e);
        const newProfileOrder = calcProfileOrder(profilesDisplay);
        if(!areProfileOrdersEqual(newProfileOrder, existingProfileOrder)) {
            await nativeUpdateProfileOrder(newProfileOrder);
        }
    } catch(e) {
        console.error("Failed to save profile order!", e);
        alert(`ERROR: ${e.message}`);
        // Undo edits to profile order
        profilesDisplay = [...profiles];
    }
}

// Display "saving" dimmer if user is not dragging and profile order does not match backend profile order state
$: saving = $draggingIdStore == null && !areProfileOrdersEqual(calcProfileOrder(profilesDisplay), existingProfileOrder);
$: dragDisabled = !$editMode || saving;

// Only display dimmer if saving for more than 200ms. Otherwise, it looks like flickering.
const DIMMER_DELAY = 200;
let showSavingDimmer = false;
let prevSaving = false;
let showDimmerTask = null;
$: if(saving !== prevSaving) {
    prevSaving = saving;
    if(showDimmerTask != null) {
        clearTimeout(showDimmerTask);
        showDimmerTask = null;
    }
    if(saving) {
        showDimmerTask = setTimeout(() => {
            showDimmerTask = null;
            showSavingDimmer = true;
        }, DIMMER_DELAY);
    } else {
        showSavingDimmer = false;
    }
}

function scrollTo(node: HTMLElement, scrollTo: boolean) {
    function doScrollTo(scrollTo: boolean) {
        if(scrollTo) {
            node.scrollIntoView({
                behavior: "smooth"
            });
            $newProfileEvent = null;
        }
    }
    doScrollTo(scrollTo);

    return {
        update(scrollTo) {
            doScrollTo(scrollTo);
        }
    }
}

function openEditor(profile) {
    $currentOperation = {
        kind: OperationKind.EditProfile,
        existingProfile: profile,
    };
}
</script>

<div use:dndzone={{
        items: profilesDisplay,
        flipDurationMs,
        dropTargetStyle: {},
        dropTargetClasses: [],
        dragDisabled,
        dropFromOthersDisabled: dragDisabled,
        scrollElement,
        keyboardDisabled: true,
     }}
     on:consider={updateWithDragEvent}
     on:finalize={saveDragResult}
     class="profile-list">
    {#each profilesDisplay as profile (profile.id)}
        <!--            <div transition:slide|local={{delay: 250}}>-->
        <!--            <div animate:flip={{duration:flipDurationMs}} transition:scale|local={{delay: 250}}>-->
        <!-- TODO: Bring back transition using custom code: https://svelte.dev/repl/3f1e68203ef140969a8240eba3475a8d?version=3.55.1 -->
        <div animate:flip={{duration:flipDurationMs}} use:scrollTo={profile.id === $newProfileEvent}>
            <ProfileCard {profile}
                         fakeHovering={profile.id === $draggingIdStore}
                         editMode={$editMode}
                         openEditor={() => openEditor(profile)}/>
        </div>
    {/each}
</div>

<!-- Animating the dimmer seems to have extremely bad perf (i tried both transitions and CSS animations) -->
<!--<div class="dimmer-wrapper" class:dimmer-wrapper-active={saving}>
    <Dimmer loading="true" fixed="true"/>
</div>-->
{#if showSavingDimmer}
    <Dimmer loading="true" fixed="true" loadingText="Saving"/>
{/if}
