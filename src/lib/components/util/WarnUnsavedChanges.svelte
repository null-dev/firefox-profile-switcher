<script lang="ts">
    function warnUnsavedChanges(event): string {
        event.preventDefault();
        return event.returnValue = 'You have unsaved changes, they will be lost if you close the page!';
    }
</script>

<svelte:body on:beforeunload={warnUnsavedChanges}/>
