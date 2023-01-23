<style>
    .dimmer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--dimmer-background);
        z-index: 800;

        display: flex;
        justify-content: center;
        align-items: center;
    }
    .dimmer-fixed {
        position: fixed;
    }
</style>

<script lang="ts">
    import Loader from "~/lib/components/loader/Loader.svelte";

    export let loading: boolean = false;
    export let loadingText: string = "";
    export let fixed: boolean = false;
</script>

<div class="dimmer" class:dimmer-fixed={fixed}>
    {#if loading}
        <div class="loader">
            <Loader text={loadingText}/>
        </div>
    {/if}
</div>
