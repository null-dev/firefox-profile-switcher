<script lang="ts">
    import {HomeInstallScriptType} from "./homeinstall";
    import Highlight from "svelte-highlight";
    import bash from "svelte-highlight/languages/bash";

    export let arch: string;
    export let type: HomeInstallScriptType;

    let baseDir: string | null = null;
    let binInstallDir: string | null = null;
    function updateDirs(type: HomeInstallScriptType) {
        if(type === HomeInstallScriptType.Flatpak) {
            baseDir = "$HOME/.var/app/org.mozilla.firefox";
            binInstallDir = "/data/firefoxprofileswitcher-install";
        } else if(type === HomeInstallScriptType.Snap) {
            baseDir = "$HOME/snap/firefox/common";
            binInstallDir = "/firefoxprofileswitcher-install";
        } else {
            console.error("Unknown home-install script type:", type);
            baseDir = null;
            binInstallDir = null;
        }
    }
    $: updateDirs(type);

    let archLink: string | null = null;
    function updateArchLink(arch: string) {
        if(arch === "x86-64") {
            archLink = "x64";
        } else if(arch === "x86-32") {
            archLink = "x86";
        } else {
            console.error("Unknown home-install arch:", arch);
            archLink = null;
        }
    }
    $: updateArchLink(arch);

    $: homeInstallScript = baseDir != null && binInstallDir != null && archLink != null
        ? `#!/bin/sh
BASE_DIR="${baseDir}"
BIN_INSTALL_DIR="$BASE_DIR${binInstallDir}"
MANIFEST_INSTALL_DIR="$BASE_DIR/.mozilla/native-messaging-hosts"
DOWNLOAD_URL="https://github.com/null-dev/firefox-profile-switcher-connector/releases/latest/download/linux-${archLink}.deb"

# Download and install the binary
mkdir -p "$BIN_INSTALL_DIR"
TMP_FILE="$(mktemp)"
curl -L "$DOWNLOAD_URL" -o "$TMP_FILE"
ar p "$TMP_FILE" data.tar.xz | tar xfJ - --strip-components=2 -C "$BIN_INSTALL_DIR" usr/bin/ff-pswitch-connector
rm "$TMP_FILE"

# Install the manifest (used by Firefox to locate the binary)
mkdir -p "$MANIFEST_INSTALL_DIR"
echo '
{
    "allowed_extensions": [
    "profile-switcher-ff@nd.ax"
    ],
    "description": "Profile Switcher for Firefox",
    "name": "ax.nd.profile_switcher_ff",
    "path": "'"$BIN_INSTALL_DIR"'/ff-pswitch-connector",
    "type": "stdio"
}
' > "$MANIFEST_INSTALL_DIR/ax.nd.profile_switcher_ff.json"
` : "Internal error, please contact developer.";
</script>

<Highlight language={bash} code={homeInstallScript} />
