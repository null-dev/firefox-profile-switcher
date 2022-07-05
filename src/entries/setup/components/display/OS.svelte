<script lang="ts">
    import {getTypedContext} from "~/lib/typed-context";
    import {SETUP_STATE_CONTEXT} from "../../main/state";

    export let os: string | string[];
    export let unsupported: boolean = false;

    $: osArray = Array.isArray(os) ? os : [os];

    const setupState = getTypedContext(SETUP_STATE_CONTEXT);
</script>

{#if ($setupState.advancedMode && !unsupported) || osArray.includes($setupState.currentOs)}
    <slot/>
{/if}
