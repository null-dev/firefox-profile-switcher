<style>
    .popup-wrapper {
        border: 1px solid grey;
        border-radius: 8px;
        overflow-y: auto;
        margin: 16px;
        max-height: calc(calc(100% - 32px) - 2px);
    }
</style>

<script lang="ts">
    import PopupInEditor from "~/entries/popup/main/PopupInEditor.svelte";
    import {defaultProfileOptions} from "~/lib/model/profiles";
    import type {PopupEditorState} from "./popup";

    export let state: PopupEditorState;
    export let onUpdateOrder: (newOrder: string[] | null) => void | null;
</script>

<div class="popup-wrapper">
    <PopupInEditor currentProfile={{
        id: "",
        name: "Example Profile",
        default: true,
        avatar: null,
        options: defaultProfileOptions()
    }} {state} {onUpdateOrder} />
</div>
