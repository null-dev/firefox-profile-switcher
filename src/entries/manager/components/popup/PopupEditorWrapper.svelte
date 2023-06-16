<style>
    .sidebar-page-wrapper {
        display: flex;
        overflow-x: hidden;
    }
    .main-content {
        flex-grow: 1;
    }
    .main-content.animating {
        flex-grow: 0;
        flex-shrink: 0;
    }
    .sidebar-content {
        flex-grow: 0;
        flex-shrink: 0;
        height: calc(100vh - var(--bottom-bar-height));
    }
</style>
<script lang="ts">
    import type {Windows} from "webextension-polyfill";
    import browser from "webextension-polyfill";
    import anime from 'animejs/lib/anime.es.js';
    import {createAsyncUpdater} from "~/lib/util/anim";
    import {disableAnimationsStore, globalOptionsStore, profileListStore} from "~/lib/common";
    import PopupEditor from "../popup/PopupEditor.svelte";
    import type {PopupEditorState} from "./popup";
    import {writable} from "svelte/store";
    import type {GlobalOptions} from "~/lib/model/profiles";
    import {nativeUpdateOptions} from "~/lib/native";
    import {areArraysEqual} from "~/lib/util/compare.js";

    const EXPAND_WIDTH: number = 320;
    const EXPAND_ANIM_DURATION: number = 500;

    let expandAnim = null;

    let mainContentWrapperElement = null;
    let mainContentWrapperStyle = "";

    function resize(expand: boolean) {
        if(expandAnim != null) {
            expandAnim.reverse();
        } else {
            // TODO Test with vertical windows taskbar
            // TODO Broken when maximized by double-clicking title bar in test machine
            const availableWidth = window.screen.availWidth - window.outerWidth;
            const availableWidthOnRight = availableWidth - window.screenX;

            function shouldExpand(availableWidth: number): boolean {
                return availableWidth >= EXPAND_WIDTH;
            }
            function shouldCollapse(availableWidth: number): boolean {
                // Only if not maximized
                return availableWidth > 0;
            }

            const initialState: Windows.UpdateUpdateInfoType = {
                width: window.outerWidth
            };
            const targetState: Windows.UpdateUpdateInfoType = {
                width: initialState.width + (expand ? EXPAND_WIDTH : -EXPAND_WIDTH)
            };
            if(expand) {
                const missingSpaceOnRight = EXPAND_WIDTH - availableWidthOnRight;
                if(missingSpaceOnRight > 0) {
                    initialState.left = window.screenX;
                    targetState.left = initialState.left - missingSpaceOnRight;
                }
            }

            const animState: Windows.UpdateUpdateInfoType = {...initialState};
            let asyncUpdater = createAsyncUpdater({
                async onUpdate() {
                    await browser.windows.update(browser.windows.WINDOW_ID_CURRENT, animState);
                }
            });
            const mainContentWidth = mainContentWrapperElement?.offsetWidth;
            if(mainContentWidth != null) {
                mainContentWrapperStyle = `width:${mainContentWidth}px`;
            }
            expandAnim = anime({
                targets: animState,
                ...targetState,
                round: 1,
                easing: 'easeInOutCubic',
                duration: $disableAnimationsStore ? 0 : EXPAND_ANIM_DURATION,
                update: function() {
                    asyncUpdater.update();
                },
                complete: function() {
                    // Required as update() isn't called for 0-duration animations
                    asyncUpdater.update();
                    expandAnim = null;
                    mainContentWrapperStyle = "";
                }
            });
        }
    }

    let editorState: PopupEditorState | null = null;
    let lastValidEditorState: PopupEditorState | null = null;
    let updatedOrder: string[] | null = null;
    $: orderChanged = !isOrderEqual(updatedOrder, $globalOptionsStore.popupProfileOrder);

    function updateOrder(order: string[] | null) {
        updatedOrder = order;
    }

    function isOrderEqual(cur: string[] | null, old: string[] | null): boolean {
        if(cur == null && old == null) {
            return true;
        } else if(cur == null || old == null) {
            return false;
        } else {
            return areArraysEqual(cur, old);
        }
    }

    function open() {
        const profiles = $profileListStore?.profiles ?? [];
        const profilesLookup = {};
        for(const profile of profiles) {
            profilesLookup[profile.id] = profile;
        }
        const order = $globalOptionsStore.popupProfileOrder;
        editorState = {
            profiles,
            profilesLookup,
            order
        };
        lastValidEditorState = editorState;
        updatedOrder = order;
        resize(true);
        // TODO Disable closing manager while editor open and profiles edited
    }

    async function close(save: boolean) {
        console.log(save, orderChanged, updatedOrder, $globalOptionsStore.popupProfileOrder);
        debugger;
        if(save && orderChanged) {
            // TODO Loading animation
            const newGlobalOptions: GlobalOptions = {...($globalOptionsStore)};
            newGlobalOptions.popupProfileOrder = updatedOrder;
            await nativeUpdateOptions(newGlobalOptions);
        }
        // TODO Save
        editorState = null;
        resize(false);
    }
</script>

<div class="sidebar-page-wrapper">
    <div class="main-content" bind:this={mainContentWrapperElement} class:animating={expandAnim != null} style={mainContentWrapperStyle}>
        <slot {open} {close} {editorState} />
    </div>
    {#if lastValidEditorState != null && (expandAnim != null || editorState != null)}
        <div class="sidebar-content" style="width:{EXPAND_WIDTH}px;">
            <PopupEditor state={lastValidEditorState} onUpdateOrder={updateOrder} />
        </div>
    {/if}
</div>
