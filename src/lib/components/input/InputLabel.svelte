<style>
    label {
        display: inline-block;
        padding: 0.5em 0;
        font-weight: bold;
        font-size: 1.2em;
    }
    label.no-padding-top {
        padding-top: 0;
    }
</style>

<script lang="ts">
    export let forId: string;
    export let noPaddingTop: boolean = false;
</script>

<!--suppress XmlInvalidId -->
<label class:no-padding-top={noPaddingTop} for={forId}><slot/></label>