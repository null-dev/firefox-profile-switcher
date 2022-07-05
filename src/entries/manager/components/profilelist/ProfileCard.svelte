<style>
    .profile-card-wrapper {
        margin: 15px 15px;
    }
    .profile-card {
        position: relative;
        width: 160px;
        height: 200px;
        transition: transform 150ms;
    }
    .profile-card:hover {
        transform: scale(1.02);
    }
    .profile-card-image {
        width: 100%;
        height: 160px;
        background-color: #eeeeee;
        object-fit: cover;
    }
    .profile-card-name {
        user-select: none;
        padding: 0 8px;
        line-height: 30px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .profile-card-default {
        position: absolute;
        top: 4px;
        left: 4px;
        /*text-transform: uppercase;*/
        background-color: var(--in-content-primary-button-background);
        color: var(--in-content-primary-button-text-color) !important;
        border: 1px solid transparent;
        border-radius: 2px;
        font-weight: 400;
        padding: 0 4px;
    }
</style>

<script lang="ts">
    import Card from "~/lib/components/card/Card.svelte";
    import type {Profile} from "~/lib/model/profiles";
    import {fade} from 'svelte/transition';
    import {getTypedContext} from "~/lib/typed-context";
    import {CURRENT_OPERATION, EDIT_MODE_CONTEXT, OperationKind} from "../manager";
    import {loadAvatarIntoImageAction} from "~/lib/common";
    import {nativeLaunchProfile} from "~/lib/native";

    export let profile: Profile;

    const editMode = getTypedContext(EDIT_MODE_CONTEXT);
    const currentOperation = getTypedContext(CURRENT_OPERATION);

    async function onProfileClick() {
        if($editMode) {
            // Open editor for profile and exit edit mode
            $currentOperation = {
                kind: OperationKind.EditProfile,
                existingProfile: profile,
            };
            $editMode = false;
        } else {
            try {
                await nativeLaunchProfile(profile.id)
                window.close();
            } catch(e) {
                console.error("Failed to launch profile!", e);
                alert(`ERROR: ${e.message}`);
            }
        }
    }

    function onProfileKeyDown(evt) {
        if(evt.key === "Enter")
            onProfileClick();
    }
</script>

<div class="profile-card-wrapper">
    <Card>
        <div class="profile-card" tabindex="0" on:click={onProfileClick} on:keydown={onProfileKeyDown}>
            <img class="profile-card-image"
                 use:loadAvatarIntoImageAction={profile.avatar}
                 alt="Profile avatar"
                 draggable="false" />
            <div class="profile-card-name">{profile.name}</div>
            {#if profile.default && $editMode}
                <div class="profile-card-default" transition:fade={{duration: 500}}>Default</div>
            {/if}
        </div>
    </Card>
</div>