<style>
    :global(body) {
        font-size: 10pt;
        overflow-y: auto;
        min-width: 300px;
        max-height: 500px;
        user-select: none;
    }
</style>

<script lang="ts">
    import PopupHeader from "../components/popupheader/PopupHeader.svelte";
    import {nativeConnectionStateStore, profileListStore} from "~/lib/common";
    import PopupContent from "../components/popupcontent/PopupContent.svelte";
    import Warning from "../components/warning/Warning.svelte";

    $: currentProfile = $profileListStore?.profiles
        .find(p => p.id === $profileListStore.current_profile_id);
</script>

{#if $nativeConnectionStateStore && currentProfile != null}
    <div class="popup-wrapper">
        <PopupHeader {currentProfile} />
        <PopupContent profileList={$profileListStore} />
    </div>
{:else}
    <Warning/>
{/if}