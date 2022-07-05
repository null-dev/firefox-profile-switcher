<script lang="ts">
    import {getTypedContext} from "~/lib/typed-context";
    import {SETUP_STATE_CONTEXT} from "../../main/state";

    export let arch: string | string[] | null = null;
    export let unsupported: boolean = false;

    $: archArray = arch != null ? (Array.isArray(arch) ? arch : [arch]) : [];

    const setupState = getTypedContext(SETUP_STATE_CONTEXT);
</script>

{#if ($setupState.advancedMode && !unsupported) || archArray.includes($setupState.currentArch)}
    <slot/>
{/if}