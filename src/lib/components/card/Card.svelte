<style>
    .card {
        background: var(--in-content-box-background);
        border-radius: 4px;
        box-shadow: var(--this-card-shadow, var(--card-shadow));
        margin: 0 0 8px;
        transition: box-shadow 150ms;
        cursor: pointer;
        border: var(--this-card-border, initial);
    }
    .card:not(.card-no-hover):hover {
        box-shadow: var(--card-shadow-hover);
    }
</style>

<div class="card"><slot/></div>