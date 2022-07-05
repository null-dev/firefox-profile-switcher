<script lang="ts">
    export let hash: string = location.hash;
</script>

<svelte:window on:hashchange={() => hash = location.hash}/>