<style>
    .warning-wrapper {
        text-align: center;
        padding: 16px;
    }
    .warning-logo {
        height: 64px;
        width: 64px;
        margin: 0 auto;
    }
    .warning-header {
        margin-top: 0.3em;
        text-align: center;
    }
    .warning-message {
        text-align: center;
    }
    .warning-help-link {
        text-align: center;
        font-size: 0.8em;
        margin-bottom: 0;
    }
</style>

<script lang="ts">
import Button from "~/lib/components/button/Button.svelte";
import {ButtonType} from "~/lib/components/button/button";
import browser from "webextension-polyfill";

function onOpenGithubLink() {
    // For some reason if we don't have this the Github link opens in a new window???
    setTimeout(() => {
        window.close();
    }, 1);
}

function openSetup() {
    browser.tabs.create({
        url: "/src/entries/setup/index.html"
    });
    window.close();
}
</script>

<div class="warning-wrapper">
    <img class="warning-logo" src="/icons/icon.svg" alt="Profile Switcher for Firefox logo" />
    <h1 class="warning-header">Setup incomplete!</h1>
    <p class="warning-message">This extension requires extra software to function, please follow the link below to install the software.</p>
    <Button type={ButtonType.Primary} on:click={openSetup}>Complete setup</Button>
    <p class="warning-help-link">
        <a href="https://github.com/null-dev/firefox-profile-switcher/issues/new" on:click={onOpenGithubLink}>
            Having trouble? Open a Github issue!
        </a>
    </p>
</div>
