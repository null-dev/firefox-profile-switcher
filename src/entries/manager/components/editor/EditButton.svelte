<script lang="ts">
    import {resolveAsset} from "~/lib/utils";
    import Loader from "~/lib/components/loader/Loader.svelte";

    export let src;
    export let label: string;
    export let danger: boolean = false;
    export let loading = false;
</script>

<style>
    .edit-action {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        font-size: 12pt;
        color: white;
    }
    .edit-action:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    img {
        width: 24px;
    }
    .edit-action:nth-child(1) {
        border-right: var(--border);
        border-bottom: var(--border);
    }
    .edit-action:nth-child(2) {
        border-left: var(--border);
        border-bottom: var(--border);
    }
    .edit-action:nth-child(3) {
        border-right: var(--border);
        border-top: var(--border);
    }
    .edit-action:nth-child(4) {
        border-left: var(--border);
        border-top: var(--border);
    }

    /* https://stackoverflow.com/a/43960991 */
    .edit-action.danger:hover {
        background: rgba(255, 0, 0, 0.2);
        /*color: red;*/
    }
    /*.edit-action.danger:hover img {
        filter: brightness(0) saturate(100%) invert(55%) sepia(48%) saturate(6638%) hue-rotate(332deg) brightness(109%) contrast(101%);
    }*/
</style>

<div class="edit-action" class:danger on:click>
    {#if loading}
        <Loader/>
    {:else}
        <div class="edit-action-wrapper">
            <img src={resolveAsset(src)} alt={label} />
            <div>{label}</div>
        </div>
    {/if}
</div>
