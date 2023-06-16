import type {Profile} from "~/lib/model/profiles";

export interface PopupEditorState {
    profiles: Profile[]
    profilesLookup: Record<string, Profile>
    order: string[] | null
}