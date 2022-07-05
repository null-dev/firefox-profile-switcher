<script lang="ts">
    import stackOverflowLight from "svelte-highlight/styles/stackoverflow-light";
    import stackOverflowDark from "svelte-highlight/styles/stackoverflow-dark";
    import {darkModeStore} from "~/lib/common";

    $: theme = $darkModeStore ? stackOverflowDark : stackOverflowLight;
</script>

<svelte:head>
    {@html theme}
</svelte:head>