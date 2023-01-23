import {newContextKey} from "~/lib/typed-context";
import type {Writable} from "svelte/store";
import type {GlobalOptions, Profile, ProfileOptions} from "~/lib/model/profiles";
import {nativeDeleteProfile} from "~/lib/native";

export enum OperationKind {
    EditProfile,
    EditOptions,
}

export interface EditProfileOperation {
    kind: OperationKind.EditProfile;
    existingProfile: Profile | null;
}

export interface EditOptionsOperation {
    kind: OperationKind.EditOptions;
    initialProfileOptions: ProfileOptions,
    initialGlobalOptions: GlobalOptions,
}

export type ManagerOperation = EditProfileOperation | EditOptionsOperation

export const EDIT_MODE_CONTEXT = newContextKey<Writable<boolean>>("edit-mode");
export const CURRENT_OPERATION = newContextKey<Writable<ManagerOperation | null>>("current-operation");
export const NEW_PROFILE_EVENT = newContextKey<Writable<string | null>>("new-profile-event");

export async function confirmAndDeleteProfile(profile: Profile): Promise<boolean> {
    const confirmResult = confirm(`Are you sure you wish to delete the profile: ${profile.name}?`);
    if(!confirmResult) return false;

    await nativeDeleteProfile(profile.id);
    return true;
}
