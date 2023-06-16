<style>
    .popup-wrapper {
        user-select: none;
    }
</style>
<script lang="ts">
import PopupHeader from "../components/popupheader/PopupHeader.svelte";
import type {Profile} from "~/lib/model/profiles";
import {setTypedContext} from "~/lib/util/typed-context";
import {POPUP_IN_EDITOR} from "../components/popup";
import PopupContentRendererInEditor from "../components/popupcontent/PopupContentRendererInEditor.svelte";
import type {PopupEditorState} from "../../manager/components/popup/popup";

export let currentProfile: Profile | null = null;
export let state: PopupEditorState;
export let onUpdateOrder: (newOrder: string[] | null) => void | null;

setTypedContext(POPUP_IN_EDITOR, true);
</script>

<div class="popup-wrapper">
    <PopupHeader {currentProfile} inEditor />
    <PopupContentRendererInEditor {state} {onUpdateOrder} />
</div>