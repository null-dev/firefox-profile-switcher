<script lang="ts">
import Button from "~/lib/components/button/Button.svelte";
import {ButtonType} from "~/lib/components/button/button";
import {SETUP_STATE_CONTEXT} from "../../main/state";
import {getTypedContext} from "~/lib/typed-context";
import Arch from "../display/Arch.svelte";

export let arch: string | null = null;
export let href: string;

const setupState = getTypedContext(SETUP_STATE_CONTEXT);

function getAdvancedButtonText(arch: string): string {
    if(arch === "x86-64") {
        return "Download for 64-bit systems";
    } else if(arch === "x86-32") {
        return "Download for 32-bit systems";
    } else if(arch === "arm") {
        return "Download for ARM systems";
    } else {
        return `Download for ${arch} systems`;
    }
}
</script>

<Arch {arch}>
    <Button type={ButtonType.Primary} {href}>
        {#if $setupState.advancedMode}
            {getAdvancedButtonText(arch)}
        {:else}
            Download
        {/if}
    </Button>
</Arch>