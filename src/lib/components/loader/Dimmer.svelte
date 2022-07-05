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
</style>

<script lang="ts">
    import Loader from "~/lib/components/loader/Loader.svelte";

    export let loading: boolean = false;
</script>

<div class="dimmer">
    {#if loading}
        <div class="loader">
            <Loader/>
        </div>
    {/if}
</div>