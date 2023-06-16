import {readable} from "svelte/store";
import type {Readable} from "svelte/store";

export interface AsyncAnimUpdater {
    update();
}
export interface AsyncAnimUpdaterArgs {
    onUpdate(): Promise<void>;
}
/**
 * Create an async animation updater. The async animation updater can animate properties that must be updated asynchronously.
 */
export function createAsyncUpdater(args: AsyncAnimUpdaterArgs): AsyncAnimUpdater {
    let running = false;
    let updateQueued = false;

    const updateLoop = async () => {
        while (updateQueued) {
            updateQueued = false;
            await args.onUpdate();
        }
    };

    const update = () => {
        updateQueued = true;

        if(!running) {
            running = true;
            updateLoop().finally(() => running = false);
        }
    };

    return { update };
}

// From: https://geoffrich.net/posts/svelte-prefers-reduced-motion-store/
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const getInitialMotionPreference = () =>
    window.matchMedia(reducedMotionQuery).matches;
export const reducedMotionStore: Readable<boolean> = readable(getInitialMotionPreference(), set => {
    const updateMotionPreference = event => {
        set(event.matches);
    };

    const mediaQueryList = window.matchMedia(reducedMotionQuery);
    mediaQueryList.addEventListener('change', updateMotionPreference);

    return () => {
        mediaQueryList.removeEventListener('change', updateMotionPreference);
    };
});
