<style>
    .control-page {
        --page-max-width: 1000px;

        position: relative;
        height: 100%;
    }
    .control-page-controls {
        position: absolute;
        bottom: 0;
        height: var(--bottom-bar-height);

        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0 16px;
    }
    .control-page-controls > :global(*) {
        margin-right: 8px;
    }
    .control-page-controls > :global(*:last-child) {
        margin-right: 0;
    }
    .control-page-controls.left {
        left: 0;
    }
    .control-page-controls.right {
        right: 0;
    }
    .control-page-header {
        font-weight: lighter;
        margin: 0;
        padding: 0.8em 0 0.5em;
    }
    .control-page-contents {
        display: flex;
        flex-direction: column;
        max-width: var(--page-max-width);
        margin: 0 auto;
        padding: 0 32px;
        height: 100%;
    }
    /*.control-page-contents label {
        display: inline-block;
        padding: 0.5em 0;
        font-weight: bold;
        font-size: 1.2em;
    }
    .control-page-contents input[type="text"] {
        margin-left: 0;
        width: 300px;
    }*/
    .control-page-scroll {
        overflow-y: auto;
        padding: 0 4px;
        margin-bottom: var(--bottom-bar-height);
    }
</style>

<div class="control-page">
    <div class="control-page-contents">
        <h1 class="control-page-header" id="edit_page_header"><slot name="header"/></h1>
        <div id="edit_page_scroll" class="control-page-scroll">
            <slot name="content"/>
        </div>
    </div>
    <div class="control-page-controls left">
        <slot name="controls-left"/>
    </div>
    <div class="control-page-controls right">
        <slot name="controls-right"/>
    </div>
</div>