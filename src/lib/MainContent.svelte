<style>
    :global(body) {
        --blue-50: #0a84ff;
        --blue-50-a30: rgba(10, 132, 255, 0.3);
        --blue-60: #0060df;
        --blue-70: #003eaa;
        --blue-80: #002275;
        --grey-90-a10: rgba(12, 12, 13, 0.1);
        --grey-90-a20: rgba(12, 12, 13, 0.2);
        --grey-90-a30: rgba(12, 12, 13, 0.3);
        --grey-90-a50: rgba(12, 12, 13, 0.5);
        --red-60: #d70022;
        --red-70: #a4000f;
        --red-80: #5a0002;

        --in-content-page-color: rgb(21, 20, 26);
        --in-content-page-background: #fefefe;
        --in-content-deemphasized-text: rgb(91, 91, 102);
        --in-content-text-color: var(--in-content-page-color);
        --in-content-selected-text: #fff;
        /*--in-content-box-border-color: var(--grey-90-a30);*/
        --in-content-box-border-color: rgb(143, 143, 157);
        --in-content-box-background: #fff;
        --in-content-border-hover: var(--grey-90-a50);
        --in-content-border-active: var(--blue-50);
        --in-content-border-active-shadow: var(--blue-50-a30);
        --in-content-button-background: var(--grey-90-a10);
        --in-content-button-background-hover: var(--grey-90-a20);
        --in-content-button-background-active: var(--grey-90-a30);
        --in-content-primary-button-background: var(--blue-60);
        --in-content-primary-button-background-hover: var(--blue-70);
        --in-content-primary-button-background-active: var(--blue-80);
        --in-content-primary-button-text-color: rgb(255,255,255);

        --in-content-link-color: var(--blue-60);
        --in-content-link-color-hover: var(--blue-70);
        --in-content-link-color-active: var(--blue-80);
        --in-content-link-color-visited: var(--in-content-link-color);

        --shadow-10: 0 1px 4px var(--grey-90-a10);
        --shadow-30: 0 4px 16px var(--grey-90-a10);
        --shadow-30-reverse: 0 -4px 16px var(--grey-90-a10);

        --card-padding: 16px;
        --card-shadow: var(--shadow-10);
        --card-shadow-hover: var(--shadow-30);

        --button-hover-light: #e9e9e9;
        --code-background: lightgrey;

        --dimmer-background: rgba(255,255,255,.85);

        background-color: var(--in-content-page-background);
        color: var(--in-content-page-color);

        font-family: Roboto, Noto, "San Francisco", Ubuntu, "Segoe UI", "Fira Sans", message-box, Arial, sans-serif;
        font-size: 12pt;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }
    :global(body.dark-mode) {
        --in-content-page-background: rgb(28,27,34);
        --in-content-page-color: rgb(251,251,254);
        --in-content-deemphasized-text: rgb(191,191,201);

        --in-content-box-background: rgb(35, 34, 43);
        --in-content-box-background-odd: rgba(249,249,250,0.05);
        --in-content-box-info-background: rgba(249,249,250,0.15);

        --in-content-border-color: rgba(249,249,250,0.2);
        --in-content-border-hover: rgba(249,249,250,0.3);
        --in-content-border-invalid: rgb(255,132,139);

        --in-content-error-text-color: #FF9AA2;

        --in-content-button-background: rgb(43,42,51);
        --in-content-button-background-hover: rgb(82,82,94);
        --in-content-button-background-active: rgb(91,91,102);
        --in-content-icon-color: rgb(251,251,254);

        --in-content-primary-button-text-color: rgb(20,20,26);
        --in-content-primary-button-background: rgb(0,221,255);
        --in-content-primary-button-background-hover: rgb(128,235,255);
        --in-content-primary-button-background-active: rgb(170,242,255);

        --in-content-danger-button-background: #ff848b;
        --in-content-danger-button-background-hover: #ffbdc5;
        --in-content-danger-button-background-active: #ffdfe7;

        --in-content-table-background: rgb(35, 34, 43);
        --in-content-table-border-dark-color: rgba(249,249,250,0.2);
        --in-content-table-header-background: rgb(5, 64, 150);
        --in-content-table-header-color: var(--in-content-page-color);
        --in-content-dialog-header-background: rgba(249,249,250,0.05);

        --in-content-accent-color: var(--in-content-primary-button-background);
        --in-content-accent-color-active: var(--in-content-primary-button-background-hover);
        --in-content-link-color: var(--in-content-primary-button-background);
        --in-content-link-color-hover: var(--in-content-primary-button-background-hover);
        --in-content-link-color-active: var(--in-content-primary-button-background-active);
        --in-content-link-color-visited: var(--in-content-link-color);

        --checkbox-unchecked-bgcolor: rgb(43, 42, 51);
        --checkbox-unchecked-hover-bgcolor: rgb(82, 82, 94);
        --checkbox-unchecked-active-bgcolor: rgb(91, 91, 102);
        --checkbox-checked-bgcolor: rgb(0, 221, 255);
        --checkbox-checked-color: rgb(43, 42, 51);
        --checkbox-checked-hover-bgcolor: rgb(128, 235, 255);
        --checkbox-checked-active-bgcolor: rgb(170, 242, 255);

        --button-hover-light: var(--in-content-button-background-hover);
        --code-background: rgb(63, 61, 79);

        --dimmer-background: rgba(0,0,0,.85);
    }
    :global(body.dark-mode .invert-when-dark) {
        filter: invert(100%);
    }

    :global(a) {
        color: var(--in-content-link-color);
        text-decoration: none;
    }
    :global(a:hover) {
        color: var(--in-content-link-color-hover);
        text-decoration: underline;
    }
    :global(a:visited) {
        color: var(--in-content-link-color-visited);
    }
    :global(a:hover:active) {
        color: var(--in-content-link-color-active);
        text-decoration: none;
    }
</style>

<script>
    import { SvelteToast } from '@zerodevx/svelte-toast'
    import {darkModeStore} from "~/lib/common";

    $: if($darkModeStore) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
</script>

<main>
    <slot/>
    <SvelteToast />
</main>
