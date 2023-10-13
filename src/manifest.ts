import pkg from "../package.json";

const manifest = {
  homepage_url: "https://github.com/null-dev/firefox-profile-switcher",
  permissions: [
    "storage",
    "nativeMessaging",
    "tabs",
    "contextMenus"
  ],
  background: {
    scripts: ["src/entries/background/main.ts"],
    persistent: true,
  },
  // content_scripts: [
  //   {
  //     js: ["src/entries/contentScript/primary/main.ts"],
  //     matches: ["*://*/*"],
  //   },
  // ],
  browser_action: {
    default_icon: "icons/icon.svg",
    default_title: "Switch profile",
    default_popup: "src/entries/popup/index.html",
  },
  icons: {
    48: "icons/icon.svg",
    96: "icons/icon.svg",
  },
  commands: {
    _execute_browser_action: {
      suggested_key: { default: "Ctrl+Alt+U" },
      description: "Open Profile Switcher Addon"
    }
  },
  browser_specific_settings: {
    gecko: {
      id: "profile-switcher-ff@nd.ax"
    }
  },
  web_accessible_resources: [
    /* These resources shouldn't actually be web accessible.
     * This is actually a hack to make vite-plugin-web-extension compile the HTML file */
    "src/entries/manager/index.html",
    "src/entries/setup/index.html",
    "src/entries/update/index.html",

    "src/entries/winfocus/index.html",
  ],
  // options_ui: {
  //   chrome_style: false,
  //   open_in_tab: true,
  //   page: "src/entries/options/index.html",
  // },
};

export function getManifest(): chrome.runtime.ManifestV2 {
  return {
    author: pkg.author,
    description: pkg.description,
    name: pkg.displayName ?? pkg.name,
    version: pkg.version,
    manifest_version: 2,
    ...manifest,
  };
}
