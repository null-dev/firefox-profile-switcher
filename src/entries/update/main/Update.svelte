<style>
    .content {
        max-width: 800px;
        margin: 0 auto;
    }
    .content h1 {
        text-align: center;
    }
    iframe.seamless {
        background-color: transparent;
        border: 0px none transparent;
        padding: 0px;
        overflow: hidden;
        width: 100%;
    }
</style>

<script lang="ts">
    import {calcSrcDoc} from "./style";
    import {darkModeStore} from "~/lib/common";
    import { marked } from 'marked';
    import Button from "~/lib/components/button/Button.svelte";
    import {ButtonType} from "~/lib/components/button/button";

    let iframe: HTMLIFrameElement | null = null;
    function resizeIframeToFitContent() {
        if(iframe != null)
            iframe.height = iframe.contentWindow.document.documentElement.offsetHeight.toString();
    }

    async function getChangelogHtml(): Promise<string> {
        try {
            const resp = await fetch('https://api.github.com/repos/null-dev/firefox-profile-switcher-connector/releases');
            const json = await resp.json();
            return marked(json[0].body);
        } catch(e) {
            console.error("Failed to load changelog:", e);
            throw e;
        }
    }
</script>

<div class="content">
    <h1>Update Profile Switcher for Firefox</h1>
    <p>An update is available for the additional software component required by this extension to function. The update is not mandatory but it is recommended that you install it since it usually contains bug fixes and new features.</p>
    <hr/>
    <h3>Changelog</h3>
    Here's what's changed since the last version:
    {#await getChangelogHtml()}
        <p>Loading changelog...</p>
    {:then html}
        <iframe bind:this={iframe}
                class="seamless"
                title="Changelog"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-same-origin"
                on:load={resizeIframeToFitContent}
                srcdoc={calcSrcDoc($darkModeStore, html)}></iframe>
    {:catch error}
        <p>An error occurred while loading the changelog!</p>
    {/await}
    <Button type={ButtonType.Primary} href="../setup/index.html">Install update</Button>
</div>

<svelte:window on:resize={resizeIframeToFitContent}/>