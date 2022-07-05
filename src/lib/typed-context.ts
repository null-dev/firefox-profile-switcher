import {getContext, hasContext, setContext} from "svelte";

const opaqueGuard: unique symbol = Symbol()

export type ContextKey<T> = {
    __internal: Symbol;
    // Guard against constructing this type externally
    __opaque: typeof opaqueGuard
}

export function newContextKey<T>(name: string): ContextKey<T> {
    return {
        __internal: Symbol(name),
        __opaque: opaqueGuard
    }
}

export function setTypedContext<T>(key: ContextKey<T>, context: T): T {
    return setContext(key.__internal, context);
}
export function getTypedContext<T>(key: ContextKey<T>): T {
    const context: T = getContext(key.__internal);
    if(context == null) {
        console.error("Failed to fetch context:", key);
        throw new Error("Failed to fetch context!");
    }
    return context;
}
export function hasTypedContext<T>(key: ContextKey<T>): boolean {
    return hasContext(key.__internal)
}
