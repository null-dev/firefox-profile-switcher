import App from "./App.svelte";
import browser from "webextension-polyfill";
import {REQUEST_TYPE_CLOSE_MANAGER} from "~/lib/common";
import {setScrollWindow} from "svelte-dnd-action";

setScrollWindow(false);

new App({
  target: document.getElementById("app"),
});

// Close manager if requested by background page
browser.runtime.onMessage.addListener((req, sender) => {
  if(sender.id === browser.runtime.id && req.type === REQUEST_TYPE_CLOSE_MANAGER) {
    window.close();
  }
});
