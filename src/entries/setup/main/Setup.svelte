<script lang="ts">
    import InstructionsWin from "../components/instructions/InstructionsWin.svelte";
    import InstructionsMac from "../components/instructions/InstructionsMac.svelte";
    import InstructionsLinux from "../components/instructions/InstructionsLinux.svelte";
    import InstructionsAndroid from "../components/instructions/InstructionsAndroid.svelte";
    import InstructionsChromeOS from "../components/instructions/InstructionsChromeOS.svelte";
    import InstructionsBSD from "../components/instructions/InstructionsBSD.svelte";
    import {setTypedContext} from "~/lib/typed-context";
    import {SETUP_STATE_CONTEXT, SetupState} from "./state";
    import {Writable, writable} from "svelte/store";
    import WindowHash from "~/lib/components/windowhash/WindowHash.svelte";
    import {onMount} from "svelte";
    import browser from "webextension-polyfill";
    import OS from "../components/display/OS.svelte";
    import HighlightTheme from "~/lib/components/highlight/HighlightTheme.svelte";

    const KNOWN_ARCH_LIST = ["x86-64", "x86-32", "arm", "other"];

    const ADVANCED_HASH = "#advanced";
    let hash: string;

    const setupState: Writable<SetupState> = writable({
        advancedMode: true,
        currentArch: null,
        currentOs: null,
    });
    $: $setupState.advancedMode = hash === ADVANCED_HASH;

    onMount(async () => {
        const platformInfo = await browser.runtime.getPlatformInfo();
        // TODO Support Firefox forks
        // const browserInfo = await browser.runtime.getBrowserInfo();
        $setupState.currentOs = platformInfo.os;
        $setupState.currentArch = KNOWN_ARCH_LIST.includes(platformInfo.arch) ? platformInfo.arch : "other";
    });

    setTypedContext(SETUP_STATE_CONTEXT, setupState);
</script>

<style>
    .content {
        max-width: 800px;
        margin: 0 auto;
    }
    :global(.content h1) {
        text-align: center;
    }
    :global(.content ol) {
        text-align: left;
    }
</style>

<div class="content">
    <h1>Setup Profile Switcher for Firefox</h1>
    <p>Additional software is required for 'Profile Switcher for Firefox' to access your browser profiles. The extension cannot function without this software. Follow the instructions below to install the software.</p>
    <hr/>
    <OS os="win">
        <InstructionsWin/>
    </OS>
    <OS os="mac">
        <InstructionsMac/>
    </OS>
    <OS os="linux">
        <InstructionsLinux/>
    </OS>
    <OS os="android" unsupported>
        <InstructionsAndroid/>
    </OS>
    <OS os="cros" unsupported>
        <InstructionsChromeOS/>
    </OS>
    <OS os={["bsd", "openbsd"]}>
        <InstructionsBSD/>
    </OS>
    <p>
        <sub>
            Advanced Users:
            {#if $setupState.advancedMode}
                <a href="#">Show only installation instructions for current platform</a>
            {:else}
                <a href={ADVANCED_HASH}>Show installation instructions for all platforms</a>
            {/if}
        </sub>
    </p>
</div>

<HighlightTheme />
<WindowHash bind:hash />