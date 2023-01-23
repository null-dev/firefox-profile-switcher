<!-- Inspired by Semantic/Fomantic UI -->
<style>
    .loader:before, .loader:after {
        position: absolute;
        content: '';
        top: 0;
        left: 0;
        border-radius: 500rem;
        border: .2em solid currentColor;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }

    .loader:before {
        border-color: rgba(255,255,255,.15);
    }

    .loader:after {
        animation: loader .6s infinite linear;
        border-left-color: transparent;
        border-right-color: transparent;
        border-top-color: transparent;
    }

    .loader {
        display: block;
        position: relative;
        width: var(--loader-size);
        height: var(--loader-size);
    }

    .mini {
        --loader-size: 1rem;
    }
    .tiny {
        --loader-size: 1.2rem;
    }
    .small {
        --loader-size: 1.5rem;
    }
    .medium {
        --loader-size: 2rem;
    }
    .max {
        --loader-size: 100%;
    }

    @keyframes loader {
        100% {
            transform: rotate(360deg);
        }
    }

    .loader-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .loader-text {
        padding-top: calc(var(--loader-size) / 5);
        font-size: calc(var(--loader-size) / 2);
        opacity: 0.7;
        user-select: none;
    }
</style>

<script lang="ts">
    export let size: "mini" | "tiny" | "small" | "medium" | "max" = "medium";
    export let text: string | null = null;
</script>


{#if text != null && text !== ""}
    <div class="loader-wrapper {size}">
        <span class="loader">
        </span>
        <div class="loader-text">{text}</div>
    </div>
{:else}
    <span class="loader {size}">
    </span>
{/if}
