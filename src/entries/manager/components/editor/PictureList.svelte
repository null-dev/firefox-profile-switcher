<style>
    .picture-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
    }
    .picture-list > :global(*) {
        width: 120px;
        height: 120px;
        margin: 12px;
        border-radius: 100%;
        border: 2px solid transparent;
        padding: 2px;
        cursor: pointer;
        transition: border-color 150ms;
    }

    .add-button {
        background: linear-gradient(22deg, rgba(14,14,14,1) 0%, rgba(61,61,61,1) 75%, rgba(97,97,97,1) 100%);
        background-origin: border-box;
        background-clip: content-box;
        opacity: 0.6;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        transition: 0.25s opacity;
    }
    .add-button:hover {
        opacity: 1;
    }
</style>

<script lang="ts">
    import addIcon from "~/assets/add-white.svg";
    import {resolveAsset} from "~/lib/utils";
    import resAvatarList from "~/assets/avatarlist/avatarlist.json";
    import {customAvatarsStore} from "~/lib/common";
    import AvatarPictureOption from "./AvatarPictureOption.svelte";
    import {nativeAddAvatars} from "~/lib/native";

    export let id;
    export let selectedAvatar: string | null = null;

    const AVATAR_PATH_PREFIX = "/img/avatars";
    function buildAvatarList(avatarList: string[], customAvatarList: string[]): string[] {
        let result = [];
        for(const customAvatarId of customAvatarList ?? []) {
            result.push("custom:" + customAvatarId);
        }
        for(const resAvatarPath of avatarList) {
            result.push("res:" + AVATAR_PATH_PREFIX + "/" + resAvatarPath);
        }
        return result;
    }
    let avatarList = null;
    $: if($customAvatarsStore != null)
        avatarList = buildAvatarList(resAvatarList, $customAvatarsStore);

    async function addAvatar() {
        try {
            await nativeAddAvatars();
        } catch(e) {
            alert("ERROR: " + e.message);
        }
    }

    // Use selected avatar or fallback to first non-custom avatar
    $: if(avatarList != null && selectedAvatar == null)
        selectedAvatar = avatarList.find((a: string) => a.startsWith('res:'));
</script>

{#if avatarList != null}
    <div {id} class="picture-list">
        <div class="add-button"
             on:click={addAvatar}>
            <div>
                <img src={resolveAsset(addIcon)} alt="Add icon" aria-hidden="true" />
                <div>Add picture</div>
            </div>
        </div>
        {#each avatarList as avatar (avatar)}
            <AvatarPictureOption src={avatar}
                                 selected={avatar === selectedAvatar}
                                 on:click={() => selectedAvatar = avatar} />
        {/each}
    </div>
{/if}