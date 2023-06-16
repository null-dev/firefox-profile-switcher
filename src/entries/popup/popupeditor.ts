import type {SvelteComponent} from "svelte";

export interface EditingElementState {
    component: SvelteComponent | null,
}

const elementStates: WeakMap<HTMLElement, EditingElementState> = new WeakMap();
function getEditingState(element: HTMLElement): EditingElementState {
    let state = elementStates.get(element);
    if(state == null) {
        state = { component: null };
        elementStates.set(element, state);
    }
    return state;
}

export function renderComponent(element: HTMLElement, renderFunc: () => SvelteComponent) {
    const state = getEditingState(element);
    if(state.component != null) {
        state.component.$destroy();
    }
    element.replaceChildren();
    state.component = renderFunc();
}

interface DebounceState {
    canceled: boolean
}

const debounceStates: WeakMap<HTMLElement, DebounceState> = new WeakMap();
export function debounceTransform(element: HTMLElement, transform: () => void) {
    let state = debounceStates.get(element);
    if(state != null) {
        state.canceled = true;
    }
    const ourState = {
        canceled: false
    };
    debounceStates.set(element, ourState);
    // I did try using `tick()` here, but it's too slow
    setTimeout(() => {
        if(!ourState.canceled) transform();
    }, 0);
}