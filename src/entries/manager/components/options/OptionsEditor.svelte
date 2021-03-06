<style>
    .setting-indent-1 {
        padding-left: 20px;
    }
    .options-editor-content > div:not(:first-child):not(.setting-indent-1) {
        border-top: 1px solid #d1d1d1;
    }
    .options-editor-content > div > p {
        margin-top: 0;
    }
</style>

<script lang="ts">
    import ManagerPage from "../../main/ManagerPage.svelte";
    import Button from "~/lib/components/button/Button.svelte";
    import {ButtonType} from "~/lib/components/button/button";
    import Input from "~/lib/components/input/Input.svelte";
    import {getUniqueElementId} from "~/lib/utils";
    import {CURRENT_OPERATION, EditOptionsOperation} from "../manager";
    import type {GlobalOptions, ProfileOptions} from "~/lib/model/profiles";
    import {getTypedContext} from "~/lib/typed-context";
    import InputLabel from "~/lib/components/input/InputLabel.svelte";
    import {profileListStore} from "~/lib/common";
    import {nativeUpdateOptions, nativeUpdateProfile} from "~/lib/native";

    export let operation: EditOptionsOperation;

    const currentOperation = getTypedContext(CURRENT_OPERATION);
    function endOperation() {
        $currentOperation = null;
    }

    const darkModeInputId = getUniqueElementId();
    const globalDarkModeInputId = getUniqueElementId();
    const windowFocusWorkaroundInputId = getUniqueElementId();

    let darkModeChecked = false;
    let darkModeAllChecked = false;
    let windowFocusWorkAroundChecked = false;
    deserializeSettings(operation.initialProfileOptions, operation.initialGlobalOptions)

    function deserializeSettings(profile: ProfileOptions, global: GlobalOptions) {
        darkModeChecked = global.darkMode ?? profile.darkMode;
        darkModeAllChecked = global.darkMode != null;
        windowFocusWorkAroundChecked = global.windowFocusWorkaround;
    }

    let saving = false;
    async function save() {
        saving = true;

        try {
            const profileOptions: ProfileOptions = {
                darkMode: darkModeChecked
            };
            const globalOptions: GlobalOptions = {
                darkMode: darkModeAllChecked ? darkModeChecked : null,
                windowFocusWorkaround: windowFocusWorkAroundChecked
            };

            const profileList = $profileListStore?.profiles;
            if(profileList == null) return;
            const currentProfileId = $profileListStore?.current_profile_id;
            if(currentProfileId == null) return;
            const currentProfile = profileList.find(it => it.id === currentProfileId);
            if(currentProfile == null) return;

            await nativeUpdateProfile(currentProfile.id, currentProfile.name, currentProfile.avatar, currentProfile.default, {
                ...(currentProfile.options ?? {}),
                ...profileOptions
            });
            await nativeUpdateOptions(globalOptions);

            endOperation();
        } catch(e) {
            console.error("Failed to save profile!", e);
            alert(`ERROR: ${e.message}`);
        } finally {
            saving = false;
        }
    }
</script>

<ManagerPage>
    <svelte:fragment slot="header">Settings</svelte:fragment>
    <div class="options-editor-content" slot="content">
        <div>
            <!--suppress XmlInvalidId -->
            <InputLabel forId={darkModeInputId}>Dark mode:</InputLabel>
            <Input id={darkModeInputId} type="checkbox" bind:checked={darkModeChecked} />
        </div>
        <div class="setting-indent-1">
            <!--suppress XmlInvalidId -->
            <InputLabel noPaddingTop forId={globalDarkModeInputId}>Apply in all profiles:</InputLabel>
            <Input id={globalDarkModeInputId} type="checkbox" bind:checked={darkModeAllChecked} />
        </div>
        <div>
            <!--suppress XmlInvalidId -->
            <InputLabel forId={windowFocusWorkaroundInputId}>Window focus workaround:</InputLabel>
            <Input id={windowFocusWorkaroundInputId} type="checkbox" bind:checked={windowFocusWorkAroundChecked} />
            <p>Enable this if you aren't able to switch between open profiles.</p>
        </div>
    </div>
    <svelte:fragment slot="controls-right">
        <Button on:click={endOperation}>Cancel</Button>
        <Button type={ButtonType.Primary} loading={saving} on:click={save}>Save</Button>
    </svelte:fragment>
</ManagerPage>
