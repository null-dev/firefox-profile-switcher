<style>
    .profile-card-wrapper {
        user-select: none;
        margin: 15px 15px;
        transition: transform 150ms;
    }
    .profile-card-wrapper:hover {
        transform: scale(1.02);
    }
    .profile-card {
        position: relative;
        width: 160px;
        height: 200px;
    }
    .profile-card-image {
        width: 100%;
        height: 100%;
        background-color: #eeeeee;
        object-fit: cover;
    }
    .profile-card-image-wrapper {
        position: relative;
        width: 100%;
        height: 160px;
    }
    .profile-card-name {
        padding: 4px 8px 0 8px;
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
        transition: transform 0.2s, top 0.2s, left 0.2s;
    }
    .profile-card-wrapper.editHover .profile-card-default {
        top: 0;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .profile-card-actions {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        background: rgba(0,0,0,0.6);
        --border: 1px solid rgba(255, 255, 255, 0.2);
    }
</style>

<script lang="ts">
    import Card from "~/lib/components/card/Card.svelte";
    import type {Profile} from "~/lib/model/profiles";
    import {fade} from 'svelte/transition';
    import {getTypedContext} from "~/lib/util/typed-context";
    import {confirmAndDeleteProfile, CURRENT_OPERATION, EDIT_MODE_CONTEXT, OperationKind} from "../manager";
    import {globalOptionsStore, loadAvatarIntoImageAction} from "~/lib/common";
    import {nativeLaunchProfile} from "~/lib/native";
    import editIcon from "~/assets/edit-white.svg";
    import pinIcon from "~/assets/playlist-add-white.svg";
    import deleteIcon from "~/assets/delete-white.svg";
    import cloneIcon from "~/assets/copy-white.svg";
    import EditButton from "../editor/EditButton.svelte";
    import Hoverable from "~/lib/components/util/Hoverable.svelte";
    import Dimmer from "~/lib/components/loader/Dimmer.svelte";

    export let profile: Profile;

    // This is required to maintain the hover state while the user drags the card
    // Without this, there will be a flicker when the user drops the card
    export let fakeHovering = false;
    export let neverHover = false;
    export let placeholder: boolean = false;
    export let editMode: boolean = false;
    export let openEditor: () => void | null = null;

    async function onProfileClick() {
        if(!editMode) {
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

    let deleting = false;
    let deleted = false;
    async function deleteProfile() {
        deleting = true;
        try {
            if(await confirmAndDeleteProfile(profile)) {
                // Permanently mark card as deleted
                deleted = true;
            } else {
                return;
            }
        } catch(e) {
            console.error("Failed to delete profile!", e);
            alert(`ERROR: ${e.message}`);
        } finally {
            deleting = false;
        }
    }

    $: active = deleting || deleted;
</script>

<Hoverable let:hovering={hovering}>
    {@const editHover = !neverHover && editMode && (hovering || fakeHovering || active || $globalOptionsStore.editModeAlwaysShowOptions)}
    <div class="profile-card-wrapper" class:editHover>
        <Card --this-card-shadow={placeholder ? 'initial' : 'var(--card-shadow)'} --this-card-border={placeholder ? '2px dashed grey' : 'initial'}>
            <div class="profile-card" tabindex="0" on:click={onProfileClick} on:keydown={onProfileKeyDown}>
                <div class="profile-card-image-wrapper">
                    <img class="profile-card-image"
                         use:loadAvatarIntoImageAction={profile.avatar}
                         alt="Profile avatar"
                         draggable="false" />
                    {#if editHover}
                        <div class="profile-card-actions" transition:fade|local={{duration: 200}}>
                            <EditButton src={pinIcon} label="Pin" />
                            <EditButton src={editIcon} label="Edit" on:click={openEditor} />
                            <EditButton src={cloneIcon} label="Clone" />
                            <EditButton src={deleteIcon}
                                        label="Delete"
                                        danger
                                        loading={deleting || deleted}
                                        on:click={deleteProfile}/>
                        </div>
                    {/if}
                </div>
                <div class="profile-card-name">{profile.name}</div>
                {#if profile.default && editMode}
                    <div class="profile-card-default"
                         transition:fade|local={{duration: 500}}
                         aria-label="Default profile">
                        Default
                    </div>
                {/if}
            </div>
        </Card>
    </div>
</Hoverable>
