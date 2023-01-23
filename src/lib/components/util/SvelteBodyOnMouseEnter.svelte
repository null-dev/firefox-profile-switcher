<!-- Hack to use conditionally use svelte:body -->

<script lang="ts">
    export let onmouseenter: (MouseEvent) => void;
</script>

<svelte:body on:mouseenter={onmouseenter}/>
