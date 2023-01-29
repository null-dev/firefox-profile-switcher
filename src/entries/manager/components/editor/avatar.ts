export interface AvatarItem {
    path: string;
    name: string;
    nickname: string | null;
}

export const AVATAR_PATH_PREFIX = "/img/avatars";
export interface ResAvatarListItem {
    /** path */
    p: string;
    /** name */
    n: string;
    /** nickname */
    k: string | null;
}
