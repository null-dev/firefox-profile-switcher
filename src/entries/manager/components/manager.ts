import {newContextKey} from "~/lib/typed-context";
import type {Writable} from "svelte/store";
import type {GlobalOptions, Profile, ProfileOptions} from "~/lib/model/profiles";

export const EDIT_MODE_CONTEXT = newContextKey<Writable<boolean>>("edit-mode");

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

export const CURRENT_OPERATION = newContextKey<Writable<ManagerOperation | null>>("current-operation");