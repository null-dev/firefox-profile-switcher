<style>
    .profile-list {
        display: flex;
        flex-direction: row;
        padding: 12px;
        flex-wrap: wrap;
        justify-content: center;
    }
    /*.dimmer-wrapper {
        visibility: hidden;
        opacity: 0;
        transition: visibility 0.25s, opacity 0.25s;
    }
    .dimmer-wrapper-active {
        visibility: visible;
        opacity: 1;
    }*/
</style>

<script lang="ts">
import ProfileCard from "./ProfileCard.svelte";
import {profileListStore} from "~/lib/common";
import {scale, slide, fade} from "svelte/transition";
import {dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, TRIGGERS} from 'svelte-dnd-action';
import {flip} from 'svelte/animate';
import {getTypedContext} from "~/lib/typed-context";
import {EDIT_MODE_CONTEXT, NEW_PROFILE_EVENT} from "../manager";
import Dimmer from "~/lib/components/loader/Dimmer.svelte";
import type {Profile, ProfileOrder} from "~/lib/model/profiles";
import {nativeUpdateProfileOrder} from "~/lib/native";

const editMode = getTypedContext(EDIT_MODE_CONTEXT);
const newProfileEvent = getTypedContext(NEW_PROFILE_EVENT);

$: profiles = $profileListStore?.profiles ?? [];
$: profilesDisplay = [...profiles];
$: existingProfileOrder = calcProfileOrder(profiles);

function calcProfileOrder(profiles: Profile[]): ProfileOrder {
    return profiles.map(x => x.id)
}
function areProfileOrdersEqual(a: ProfileOrder, b: ProfileOrder): boolean {
    return a.length === b.length && a.every((id, idx) => id === b[idx])
}

const flipDurationMs = 200;

let lastDraggedId = null;
const DRAG_STOPPED_TRIGGERS = [
    TRIGGERS.DRAG_STOPPED,
    TRIGGERS.DROPPED_INTO_ANOTHER,
    TRIGGERS.DROPPED_INTO_ZONE,
    TRIGGERS.DROPPED_OUTSIDE_OF_ANY,
];
function updateWithDragEvent(e) {
    const {items, info} = e.detail;
    if(info.trigger === TRIGGERS.DRAG_STARTED) {
        lastDraggedId = info.id;
    } else if(DRAG_STOPPED_TRIGGERS.includes(info.trigger)) {
        lastDraggedId = null;
    }

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
$: saving = lastDraggedId == null && !areProfileOrdersEqual(calcProfileOrder(profilesDisplay), existingProfileOrder);
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
</script>

<div use:dndzone={{
        items: profilesDisplay,
        flipDurationMs,
        dropTargetStyle: {},
        dropTargetClasses: [],
        dragDisabled,
        dropFromOthersDisabled: dragDisabled,
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
                         fakeHovering={profile.id === lastDraggedId} />
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
