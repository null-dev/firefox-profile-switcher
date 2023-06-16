<script lang="ts">
    import type {EditProfileOperation} from "../manager";
    import ManagerPage from "../../main/ManagerPage.svelte";
    import Button from "~/lib/components/button/Button.svelte";
    import {ButtonType} from "~/lib/components/button/button";
    import {getTypedContext} from "~/lib/util/typed-context";
    import {confirmAndDeleteProfile, CURRENT_OPERATION, NEW_PROFILE_EVENT} from "../manager";
    import Input from "~/lib/components/input/Input.svelte";
    import PictureList from "./PictureList.svelte";
    import {nativeCreateProfile, nativeDeleteProfile, nativeUpdateProfile} from "~/lib/native";
    import {success} from "~/lib/util/toast";
    import InputLabel from "~/lib/components/input/InputLabel.svelte";
    import {getUniqueElementId} from "~/lib/util/dom";

    export let operation: EditProfileOperation;

    const nameElementId = getUniqueElementId();
    const pictureElementId = getUniqueElementId();

    const newProfileEvent = getTypedContext(NEW_PROFILE_EVENT);

    const currentOperation = getTypedContext(CURRENT_OPERATION);
    function endOperation() {
        $currentOperation = null;
    }

    let selectedAvatar = null;
    let profileName = "";
    let isDefault = false;
    if(operation.existingProfile != null) {
        selectedAvatar = operation.existingProfile.avatar;
        profileName = operation.existingProfile.name;
        isDefault = operation.existingProfile.default;
    }

    let saving = false;
    async function save() {
        saving = true;
        try {
            if (operation.existingProfile != null) {
                // Save
                await nativeUpdateProfile(
                    operation.existingProfile.id,
                    profileName,
                    selectedAvatar,
                    isDefault,
                    operation.existingProfile.options,
                );
            } else {
                // Add
                let profile = (await nativeCreateProfile(profileName, selectedAvatar)).profile;
                $newProfileEvent = profile.id;
            }
            endOperation();
        } catch(e) {
            console.error("Failed to save changes!", e);
            alert(`ERROR: ${e.message}`);
        } finally {
            saving = false;
        }
    }

    let settingDefault = false;
    async function setDefault() {
        settingDefault = true;
        try {
            await nativeUpdateProfile(
                operation.existingProfile.id,
                operation.existingProfile.name,
                operation.existingProfile.avatar,
                true,
                operation.existingProfile.options,
            );
            isDefault = true;
            success('Default profile changed.');
        } catch(e) {
            console.error("Failed to set default profile!", e);
            alert(`ERROR: ${e.message}`);
        } finally {
            settingDefault = false;
        }
    }

    let deleting = false;
    async function deleteProfile() {
        deleting = true;
        try {
            if(!await confirmAndDeleteProfile(operation.existingProfile))
                return;

            endOperation();
        } catch(e) {
            console.error("Failed to delete profile!", e);
            alert(`ERROR: ${e.message}`);
        } finally {
            deleting = false;
        }
    }

    $: isProfileValid = profileName.length > 0;
</script>

<style>
</style>

<ManagerPage>
    <svelte:fragment slot="header">
        {#if operation.existingProfile != null}
            <span>Edit profile:</span> <b>{operation.existingProfile.name}</b>
        {:else}
            Add profile
        {/if}
    </svelte:fragment>
    <div slot="content">
        <div><!--suppress XmlInvalidId -->
            <InputLabel forId={nameElementId}>Name:</InputLabel>
        </div>
        <Input id={nameElementId}
               type="text"
               placeholder="Enter a name for this profile."
               style="margin-left:0;width:300px"
               bind:value={profileName} />
        <div><!--suppress XmlInvalidId -->
            <InputLabel forId={pictureElementId}>Picture:</InputLabel>
        </div>
        <PictureList id={pictureElementId} bind:selectedAvatar />
    </div>
    <svelte:fragment slot="controls-left">
        {#if operation.existingProfile != null}
            <Button type={ButtonType.Danger}
                    loading={deleting}
                    on:click={deleteProfile}>Delete</Button>
            {#if !isDefault}
                <Button on:click={setDefault}>Set as default profile</Button>
            {/if}
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="controls-right">
        <Button on:click={endOperation}>Cancel</Button>
        <Button type={ButtonType.Primary} on:click={save} loading={saving} disabled={!isProfileValid}>
            {#if operation.existingProfile != null}
                Save
            {:else}
                Add
            {/if}
        </Button>
    </svelte:fragment>
</ManagerPage>
