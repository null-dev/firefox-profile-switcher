<style>
    .button {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        font-size: 10pt;
        appearance: none;
        min-height: 32px;
        color: inherit !important;
        border: 1px solid transparent;
        border-radius: 2px;
        background-color: var(--in-content-button-background);
        font-weight: 400;
        padding: 0 8px;
        text-decoration: none;
        user-select: none;

        position: relative;
    }

    .button:hover:not(.disabled) {
        background-color: var(--in-content-button-background-hover);
    }

    .button:active:not(.disabled) {
        background-color: var(--in-content-button-background-active);
    }
    .button.disabled {
        opacity: 0.4;
    }
    .button.primary {
        background-color: var(--in-content-primary-button-background);
        color: var(--in-content-primary-button-text-color) !important;
    }

    .button.primary:hover:not(.disabled) {
        background-color: var(--in-content-primary-button-background-hover);
    }

    .button.primary:hover:active:not(.disabled) {
        background-color: var(--in-content-primary-button-background-active);
    }
    .button.danger {
        background-color: var(--red-60);
        color: white !important;
    }

    .button.danger:hover:not(.disabled) {
        background-color: var(--red-70);
    }

    .button.danger:hover:active:not(.disabled) {
        background-color: var(--red-80);
    }

    .content-wrapper {
        display: contents;
    }
    .hidden {
        visibility: hidden;
    }
    .loader-wrapper {
        display: block;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
</style>

<script lang="ts">
    import {ButtonType} from "./button";
    import Loader from "~/lib/components/loader/Loader.svelte";

    export let type: ButtonType = ButtonType.Normal;
    export let href: string | null = null;
    export let disabled: Boolean = false;
    export let loading: Boolean = false;
</script>

<!-- We can't use svelte:element as it seems to bug out on changes (exhibited on setup page) -->
{#if href != null}
    <a class="button"
       {href}
       class:primary={type === ButtonType.Primary}
       class:danger={type === ButtonType.Danger}
       class:disabled={disabled || loading}
       class:loading
       on:click>
        {#if loading}
        <span class="loader-wrapper">
            <Loader size="tiny"/>
        </span>
        {/if}
        <span class="content-wrapper" class:hidden={loading}>
            <slot/>
        </span>
    </a>
{:else}
    <button class="button"
            class:primary={type === ButtonType.Primary}
            class:danger={type === ButtonType.Danger}
            class:disabled={disabled || loading}
            class:loading
            disabled={disabled || loading}
            on:click>
        {#if loading}
        <span class="loader-wrapper">
            <Loader size="tiny"/>
        </span>
        {/if}
        <span class="content-wrapper" class:hidden={loading}>
            <slot/>
        </span>
    </button>
{/if}
