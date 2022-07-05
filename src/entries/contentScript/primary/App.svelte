<script lang="ts">
  import logo from "~/assets/logo.svg";

  const logoImageUrl = new URL(logo, import.meta.url).href;
</script>

<div class="logo">
  <img src={logoImageUrl} height="50" alt="" />
</div>

<style>
  .logo {
    z-index: 99999;
    position: fixed;
    bottom: 20px;
    right: 10px;
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 4px solid #c72a21;
    border-radius: 50%;
    background-color: #fff;
  }

  img {
    position: absolute;
    top: 7px;
  }
</style>
