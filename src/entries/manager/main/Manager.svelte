<style>
    .main-wrapper {
        --bottom-bar-height: 60px;
        --bottom-bar-transition-time: 0.5s;
        --bottom-bar-background: var(--in-content-box-background);

        font-size: 10pt;
    }

    /* Profile list */
    .profile-list-wrapper {
        height: calc(100vh - var(--bottom-bar-height));
        overflow-y: auto;
    }

    /* Profile list edit header */
    .profile-list-edit-header {
        text-align: center;
        margin: 0;
        pointer-events: none;
        line-height: 0;
        transition: line-height 0.5s, opacity 0.5s, margin 0.5s;
        opacity: 0;
    }
    .profile-list-wrapper.editing .profile-list-edit-header {
        line-height: 1;
        opacity: 1;
        margin-top: 1em;
    }
</style>

<script lang="ts">
    import BottomBar from "../components/bottombar/BottomBar.svelte";
    import ProfileList from "../components/profilelist/ProfileList.svelte";
    import {CURRENT_OPERATION, EDIT_MODE_CONTEXT, NEW_PROFILE_EVENT} from "../components/manager";
    import {writable} from "svelte/store";
    import {setTypedContext} from "~/lib/util/typed-context";
    import PopupEditorWrapper from "../components/popup/PopupEditorWrapper.svelte";
    import ProfileListInPopupEditor from "../components/profilelist/ProfileListInPopupEditor.svelte";
    import {slide} from 'svelte/transition';

    const editMode = writable(false);
    setTypedContext(EDIT_MODE_CONTEXT, editMode);

    const currentPage = writable(null);
    setTypedContext(CURRENT_OPERATION, currentPage);

    const newProfileEvent = writable(null);
    setTypedContext(NEW_PROFILE_EVENT, newProfileEvent);

    let profileListWrapperElement = null;
</script>


<div class="main-wrapper">
    <PopupEditorWrapper let:open={openPopupEditor} let:close={closePopupEditor} let:editorState={popupEditorState}>
        <div class="profile-list-wrapper" class:editing={$editMode} bind:this={profileListWrapperElement} aria-hidden={$currentPage != null}>
            <!-- TODO Fix this transition -->
            {#if popupEditorState != null}
                <h1 class="profile-list-edit-header" transition:slide|local>Drag profiles to/from the popup:</h1>
            {:else}
                <h1 class="profile-list-edit-header" transition:slide|local>Hover over a profile for options:</h1>
            {/if}
            {#if popupEditorState != null}
                <ProfileListInPopupEditor scrollElement={profileListWrapperElement} state={popupEditorState}/>
            {:else}
                <ProfileList scrollElement={profileListWrapperElement}/>
            {/if}
        </div>
        <BottomBar {openPopupEditor} {closePopupEditor} popupEditorActive={popupEditorState != null} />
    </PopupEditorWrapper>
</div>
