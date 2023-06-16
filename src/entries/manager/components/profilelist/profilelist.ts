import type {Profile} from "~/lib/model/profiles";

export const flipDurationMs = 200;

export interface EditorProfile {
    id: string,
    real: boolean,
    profile: Profile,
}

export function editorProfile(profile: Profile, real: boolean): EditorProfile {
    return {
        id: profile.id + (real ? '+' : '-'),
        real,
        profile
    };
}

export function profileIdFromEditorProfileId(editorProfileId: string): string {
    return editorProfileId.substring(0, editorProfileId.length - 1);
}

export function morphElement(element, transform, currentMouseX, currentMouseY) {
    const oldBounds = element.getBoundingClientRect();
    element.style.removeProperty("height");
    element.style.removeProperty("width");
    transform();
    const newBounds = element.getBoundingClientRect();
    const widthChange = newBounds.width - oldBounds.width;
    const heightChange = newBounds.height - oldBounds.height;
    if (widthChange || heightChange) {
        const relativeDistanceOfMousePointerFromDraggedSides = {
            left: (currentMouseX - oldBounds.left) / oldBounds.width,
            top: (currentMouseY - oldBounds.top) / oldBounds.height
        };
        element.style.height = `${newBounds.height}px`;
        element.style.width = `${newBounds.width}px`;
        element.style.left = `${parseFloat(element.style.left) - relativeDistanceOfMousePointerFromDraggedSides.left * widthChange}px`;
        element.style.top = `${parseFloat(element.style.top) - relativeDistanceOfMousePointerFromDraggedSides.top * heightChange}px`;
    }
}