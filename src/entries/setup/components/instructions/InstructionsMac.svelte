<script lang="ts">
    import Highlight from "svelte-highlight";
    import bash from "svelte-highlight/languages/bash";

    let macExtraCommands = `sudo mkdir -p "/Library/Application Support/Mozilla/NativeMessagingHosts"
sudo ln -sf "$(brew ls -l firefox-profile-switcher-connector | grep -i ax.nd.profile_switcher_ff.json | head -n1)" "/Library/Application Support/Mozilla/NativeMessagingHosts"/ax.nd.profile_switcher_ff.json
`;
</script>

<div>
    <h3>Instructions for Mac</h3>
    <ol>
        <li>
            You need Homebrew installed to continue. Homebrew is a popular program used to manage software on Mac computers.
            Install Homebrew from it's website here: <a href="https://brew.sh/" target="_blank">https://brew.sh/</a>
        </li>
        <li>Open the Terminal app.</li>
        <li>Paste this command and press <i>ENTER</i> to tell homebrew where to download the software: <code>brew tap null-dev/firefox-profile-switcher</code></li>
        <li>Wait for the command to finish, you'll know it's done once you see the <code>%</code> symbol beside your cursor.</li>
        <li>
            Paste the following command and press <i>ENTER</i> to download and install the software: <code>brew install firefox-profile-switcher-connector</code>
            <ul>
                <li><b>If you have an older version of the software component installed and are upgrading it</b>, use this command instead: <code>brew upgrade firefox-profile-switcher-connector</code></li>
            </ul>
        </li>
        <li>The output from the above command will give you two more commands you need to run, make sure you run those commands.</li>
        <li>Restart your browser.</li>
        <li>
            The extension should work now!
        </li>
        <li>
            If the extension still does not work, you can try running the following commands:
            <Highlight language={bash} code={macExtraCommands}/>
        </li>
    </ol>
</div>
