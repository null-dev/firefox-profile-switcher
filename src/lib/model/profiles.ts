export interface Profile {
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
}

export function defaultGlobalOptions(): GlobalOptions {
    return {
        darkMode: null,
        windowFocusWorkaround: false
    }
}

export interface ProfileList {
    current_profile_id: string;
    profiles: Profile[];
}