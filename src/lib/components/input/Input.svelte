<style>
    input:is([type="email"], [type="tel"], [type="text"], [type="password"], [type="url"], [type="number"]),
    textarea {
        appearance: none;
        border: 1px solid var(--in-content-box-border-color);
        border-radius: 2px;
        color: inherit;
        background-color: var(--in-content-box-background);

        font-family: inherit;
        font-size: inherit;
        padding: 5px 8px;
        margin: 2px 4px;
    }

    input:is([type="email"], [type="tel"], [type="text"], [type="password"], [type="url"], [type="number"]):enabled:not(:focus):hover,
    textarea:enabled:not(:focus):hover {
        border-color: var(--in-content-border-hover);
    }

    input:is([type="email"], [type="tel"], [type="text"], [type="password"], [type="url"], [type="number"]):focus,
    textarea:focus {
        border-color: var(--in-content-border-active);
        box-shadow: 0 0 0 1px var(--in-content-border-active),
        0 0 0 4px var(--in-content-border-active-shadow);
        outline: none;
    }
    input:is([type="email"], [type="tel"], [type="text"], [type="password"], [type="url"], [type="number"]):disabled,
    textarea:disabled {
        opacity: 0.4;
    }
</style>

<script>
    export let type;
    export let value = "";
    export let checked = false;
</script>

{#if type === "textarea"}
    <textarea bind:value {...$$restProps}></textarea>
{:else if type === "text"}
    <input type="text" bind:value {...$$restProps} />
{:else if type === "checkbox"}
    <input type="checkbox" bind:checked {...$$restProps} />
{/if}