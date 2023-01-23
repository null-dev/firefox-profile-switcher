<script lang="ts">
    import SvelteBodyOnMouseEnter from "~/lib/components/util/SvelteBodyOnMouseEnter.svelte";

    export let hovering = false;
    let element: HTMLDivElement | null = null;

    function enter() {
        hovering = true;
    }

    function leave() {
        hovering = false;
    }

    function enterElse(evt) {
        // Check if element is our child. Note that a node contains itself.
        if(element != null && !element.contains(evt.target)) {
            hovering = false;
        }
    }
</script>

<div bind:this={element} on:mouseenter={enter} on:mouseleave={leave}>
    <slot hovering={hovering} />
</div>

<!--
Hack to ensure hover state is removed if the user somehow leaves the element without firing onmouseleave.
We attach an event listener to the body and if onmouseenter if fired for any element that is not our child we know the
mouse has escaped somehow.
This is very efficient because we only keep the listener attached if we are hovered.
-->
{#if hovering}
    <SvelteBodyOnMouseEnter onmouseenter={enterElse}/>
{/if}
