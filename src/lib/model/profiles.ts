export interface Profile {
    // id property must exist because we use profile objects directly in dndzone (which requires an id property)
    id: string;
    name: string;
    default: boolean;
    avatar: string | null;
    options: ProfileOptions;
}

export interface ProfileOptions {
    darkMode: boolean;
}

export function defaultProfileOptions(): ProfileOptions {
    return {
        darkMode: true
    }
}

export interface GlobalOptions {
    darkMode: boolean | null;
    windowFocusWorkaround: boolean;
    editModeAlwaysShowOptions: boolean;
}

export function defaultGlobalOptions(): GlobalOptions {
    return {
        darkMode: null,
        windowFocusWorkaround: false,
        editModeAlwaysShowOptions: false,
    }
}

export interface ProfileList {
    current_profile_id: string;
    profiles: Profile[];
}

export type ProfileOrder = string[];
