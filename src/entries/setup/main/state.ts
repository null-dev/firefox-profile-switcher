import {newContextKey} from "~/lib/util/typed-context";
import type {Writable} from "svelte/store";

export const SETUP_STATE_CONTEXT = newContextKey<Writable<SetupState>>("setup-state");

export interface SetupState {
    advancedMode: boolean
    currentArch: string | null
    currentOs: string | null
}
