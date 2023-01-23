<style>
    .profile-picture-wrapper {
        width: 100%;
        text-align: center;
        margin: 16px 0;
    }
    .profile-picture {
        width: 64px;
        height: 64px;
        border-radius: 64px;
        margin-bottom: 12px;
        object-fit: cover;
    }
    .update-available-button-wrapper {
        position: absolute;
        top: 6px;
        right: 6px;
        cursor: pointer;
        text-align: center;
    }
    .profile-name {
        font-size: 14pt;
        max-width: 100%;
        width: 100%;
        text-align: center;
        padding: 0 16px;
        overflow-wrap: break-word;
        box-sizing: border-box;
    }
</style>

<script lang="ts">
    import {loadAvatarIntoImageAction, nativeConnectorVersionStore, RECOMMENDED_CONNECTOR_VERSION} from "~/lib/common";
    import type {Profile} from "~/lib/model/profiles";
    import Button from "~/lib/components/button/Button.svelte";
    import {ButtonType} from "~/lib/components/button/button";
    import browser from "webextension-polyfill";
    import compareVersions from "compare-versions";

    export let currentProfile: Profile | null = null;

    function shouldShowUpdateButton(version: string | null): boolean {
        return version != null && compareVersions(RECOMMENDED_CONNECTOR_VERSION, version) >= 1;
    }

    function openUpdatePage() {
        browser.tabs.create({
            url: "/src/entries/update/index.html"
        });
        window.close();
    }
</script>

<div class="profile-picture-wrapper">
    {#if shouldShowUpdateButton($nativeConnectorVersionStore)}
        <div class="update-available-button-wrapper">
            <Button type={ButtonType.Primary} on:click={openUpdatePage}>
                Update<br/>available!
            </Button>
        </div>
    {/if}
    <img class="profile-picture"
         use:loadAvatarIntoImageAction={currentProfile?.avatar}
         alt="Profile avatar"
         draggable="false"/>
    <div class="profile-name">{currentProfile?.name ?? "Unknown"}</div>
</div>
