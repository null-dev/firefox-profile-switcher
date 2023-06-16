import {TRIGGERS} from "svelte-dnd-action";
import type {DndEventInfo} from "svelte-dnd-action";
import type {Readable, Writable} from "svelte/store";
import {writable} from "svelte/store";

const DRAG_STOPPED_TRIGGERS = [
    TRIGGERS.DRAG_STOPPED,
    TRIGGERS.DROPPED_INTO_ANOTHER,
    TRIGGERS.DROPPED_INTO_ZONE,
    TRIGGERS.DROPPED_OUTSIDE_OF_ANY,
];

export class DragManager {
    private draggedIdStore: Writable<string | null> = writable(null);
    private draggedId: string | null;

    private updateDraggedId(newId: string | null) {
        this.draggedIdStore.set(newId);
        this.draggedId = newId;
    }

    public onConsider(info: DndEventInfo) {
        if(info.trigger === TRIGGERS.DRAG_STARTED) {
            this.updateDraggedId(info.id);
        } else if(DRAG_STOPPED_TRIGGERS.includes(info.trigger)) {
            this.updateDraggedId(null);
        }
    }

    public draggingIdStore(): Readable<string | null> {
        return this.draggedIdStore;
    }

    public draggingId(): string | null {
        return this.draggedId;
    }
}