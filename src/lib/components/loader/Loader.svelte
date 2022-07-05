<!-- Inspired by Semantic/Fomantic UI -->
<style>
    .loader:before, .loader:after {
        position: absolute;
        content: '';
        top: 0;
        left: 0;
        border-radius: 500rem;
        border: .2em solid currentColor;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }

    .loader:before {
        border-color: rgba(255,255,255,.15);
    }

    .loader:after {
        animation: loader .6s infinite linear;
        border-left-color: transparent;
        border-right-color: transparent;
        border-top-color: transparent;
    }

    .loader {
        display: block;
        position: relative;
        width: var(--loader-size);
        height: var(--loader-size);
    }

    .loader.mini {
        --loader-size: 1rem;
    }
    .loader.tiny {
        --loader-size: 1.2rem;
    }
    .loader.small {
        --loader-size: 1.5rem;
    }
    .loader.medium {
        --loader-size: 2rem;
    }
    .loader.max {
        --loader-size: 100%;
    }

    @keyframes loader {
        100% {
            transform: rotate(360deg);
        }
    }
</style>

<script>
    export let size = "medium"
</script>

<span class="loader {size}">
</span>