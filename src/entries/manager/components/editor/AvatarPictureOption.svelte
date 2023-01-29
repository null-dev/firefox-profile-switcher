<style>
    .avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 100%;
    }
    div {
        position: relative;
    }
    div.selected {
        border-color: var(--blue-50);
    }
    .delete-button {
        --delete-button-size: 24px;
        --delete-button-padding: 4px;

        position: absolute;
        top: 0;
        right: 0;
        height: var(--delete-button-size);
        width: var(--delete-button-size);
        background: red;
        border-radius: 100%;
    }
    img.delete-button {
        opacity: 0.7;
        transform: scale(0, 0);
        transition: transform 0.1s;
        padding: var(--delete-button-padding);
        object-fit: contain;
    }
    div:hover > img.delete-button {
        transform: scale(100%, 100%);
    }
    .delete-button:hover {
        opacity: 1;
    }
    div.delete-button {
        display: flex;
        overflow: hidden;
        justify-content: center;
        align-items: center;

        height: calc(var(--delete-button-size) + calc(2 * var(--delete-button-padding)));
        width: calc(var(--delete-button-size) + calc(2 * var(--delete-button-padding)));
    }
</style>

<script lang="ts">
    import {loadAvatarIntoImageAction, profileListStore} from "~/lib/common";
    import {scale} from "svelte/transition";
    import deleteIcon from "~/assets/delete-white.svg";
    import {resolveAsset} from "~/lib/utils";
    import Loader from "~/lib/components/loader/Loader.svelte";
    import {nativeDeleteAvatar} from "~/lib/native";
    import type {AvatarItem} from "./avatar";

    export let selected = false;
    export let avatar = null;

    let deleting = false;

    async function deleteAvatar() {
        if(avatar == null) return;

        deleting = true;
        try {
            // Check if the avatar is in use
            // We do this on the client side since we are treating the connector as essentially a dumb filestore
            const inUseProfile = $profileListStore?.profiles.find(it => it.avatar === avatar.path);
            if(inUseProfile != null) {
                alert(`You can't delete this avatar because it is in use by a profile: ${inUseProfile.name}`);
                return;
            }

            const confirmResult = confirm(`Are you sure you want to delete this avatar image?`);
            if(!confirmResult) return;

            const id = new URL(avatar.path).pathname;
            await nativeDeleteAvatar(id);
        } catch(e) {
            console.error("Failed to delete avatar image!", e);
            alert(`ERROR: ${e.message}`);
        } finally {
            deleting = false;
        }
    }

    function avatarDisplayName(avatar: AvatarItem): string {
        let name = avatar.name;
        if(avatar.nickname != null) {
            name += ` (aka ${avatar.nickname})`
        }
        return name;
    }

    $: displayName = avatar != null ? avatarDisplayName(avatar) : null
</script>

<div class:selected role="option" aria-selected={selected}>
    <img class="avatar"
         class:selected
         alt={displayName}
         title={displayName}
         draggable="false"
         use:loadAvatarIntoImageAction={avatar?.path}
         on:click transition:scale|local />
    {#if avatar.path.startsWith('custom:')}
        {#if deleting}
            <div class="delete-button">
                <Loader size="tiny" />
            </div>
        {:else}
            <img class="delete-button"
                 src={resolveAsset(deleteIcon)}
                 on:click={deleteAvatar}
                 alt="Delete avatar" />
        {/if}
    {/if}
</div>
