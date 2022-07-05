<style>
    /* Bottom bar */
    .bottom-bar {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        box-shadow: var(--shadow-30-reverse);
        transition: height var(--bottom-bar-transition-time);
        background: var(--bottom-bar-background);
        height: var(--bottom-bar-height);
    }
    .bottom-bar-wrapper {
        height: var(--bottom-bar-height);
        overflow-y: hidden;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        transition: height var(--bottom-bar-transition-time), opacity var(--bottom-bar-transition-time);
        opacity: 1;
    }
    .bottom-bar.expanded {
        height: 100%;
    }
    .bottom-bar.expanded > .bottom-bar-wrapper {
        height: 0;
        opacity: 0;
        pointer-events: none;
    }

    /* Bottom bar controls */
    .bottom-bar-controls {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0 16px;
    }
    .bottom-bar-controls > :global(*) {
        margin-right: 8px;
    }
    .bottom-bar-controls > :global(*:last-child) {
        margin-right: 0;
    }
    .bottom-bar-controls .control-icon {
        width: 18px;
        height: 18px;
        margin-bottom: -3px;
    }

    /* Bottom bar browser icon/name */
    .bottom-bar-browser {
        display: flex;
        flex-direction: row;
        height: 100%;
    }
    .bottom-bar-browser-logo {
        height: calc(100% - 20px);
        padding: 10px 8px 0 24px;
    }
    .bottom-bar-browser-name {
        transition: line-height var(--bottom-bar-transition-time);
        line-height: var(--bottom-bar-height);
        padding-left: 4px;
        font-size: 2em;
        font-weight: lighter;
        animation: show-browser-name 0.75s;
        animation-fill-mode: forwards;
        z-index: -1;
    }
    @keyframes show-browser-name {
        0% {
            transform: translateX(-15%);
            opacity: 0;
        }
        25% {
            transform: translateX(-15%);
            opacity: 0;
        }
        100% {
            transform: translateX(0);
            opacity: 1;
        }
    }
    .bottom-bar.expanded .bottom-bar-browser-name {
        line-height: 0px; /* Don't remove the px here, will break expand transition */
    }
</style>

<script lang="ts">
    import firefoxLogo from "~/assets/firefox.svg";
    import settingsIcon from "~/assets/settings-gray.svg";
    import Button from "~/lib/components/button/Button.svelte";
    import {ButtonType} from "~/lib/components/button/button";
    import {resolveAsset} from "~/lib/utils";
    import {CURRENT_OPERATION, EDIT_MODE_CONTEXT, OperationKind} from "../manager";
    import {getTypedContext} from "~/lib/typed-context";
    import ProfileEditor from "../editor/ProfileEditor.svelte";
    import {defaultProfileOptions} from "~/lib/model/profiles";
    import {globalOptionsStore, profileListStore} from "~/lib/common";
    import OptionsEditor from "../options/OptionsEditor.svelte";

    const editMode = getTypedContext(EDIT_MODE_CONTEXT);
    const currentOperation = getTypedContext(CURRENT_OPERATION);

    let lastOperation;
    $: if($currentOperation != null) {
        lastOperation = $currentOperation;
    }

    function startAddProfileOperation() {
        $currentOperation = {
            kind: OperationKind.EditProfile
        };
    }

    function startEditOptionsOperation() {
        const profileList = $profileListStore?.profiles;
        if(profileList == null) return;
        const currentProfileId = $profileListStore?.current_profile_id;
        if(currentProfileId == null) return;
        const currentProfile = profileList.find(it => it.id === currentProfileId);
        if(currentProfile == null) return;
        $currentOperation = {
            kind: OperationKind.EditOptions,
            initialProfileOptions: {
                ...defaultProfileOptions(),
                ...(currentProfile.options ?? {}),
            },
            initialGlobalOptions: $globalOptionsStore,
        };
    }

    // Unmount operation page when not used
    let operationIdle = true;
    let operationIdleTimer = null;
    function pokeOperationIdleTimer() {
        operationIdle = false;
        if(operationIdleTimer != null) {
            clearTimeout(operationIdleTimer);
        }
        operationIdleTimer = setTimeout(() => {
            operationIdle = true;
            operationIdleTimer = null;
        }, 500);
    }
    $: {
        pokeOperationIdleTimer();
        $currentOperation // Trigger when $currentOperation changes
    }
</script>

<div class="bottom-bar" class:expanded={$currentOperation != null}>
    <div class="bottom-bar-wrapper">
        <div class="bottom-bar-browser">
            <img class="bottom-bar-browser-logo" src={resolveAsset(firefoxLogo)} alt="Firefox logo"/>
            <div class="bottom-bar-browser-name">
                <b>Profile&nbsp;Switcher</b> for&nbsp;Firefox
            </div>
        </div>
        <div class="bottom-bar-controls">
            <Button on:click={startAddProfileOperation}>+ Add profile</Button>
            <Button on:click={() => $editMode = !$editMode}
                    type={$editMode ? ButtonType.Primary : ButtonType.Normal}>
                {$editMode ? "Exit edit mode" : "Edit profiles"}
            </Button>
            <Button on:click={startEditOptionsOperation}>
                <img class="control-icon invert-when-dark" src={resolveAsset(settingsIcon)} alt="Settings icon"/>
            </Button>
        </div>
    </div>
    {#if lastOperation != null && ($currentOperation != null || !operationIdle)}
        {#if lastOperation.kind === OperationKind.EditProfile}
            <ProfileEditor operation={lastOperation}/>
        {:else if lastOperation.kind === OperationKind.EditOptions}
            <OptionsEditor operation={lastOperation}/>
        {/if}
    {/if}
</div>
