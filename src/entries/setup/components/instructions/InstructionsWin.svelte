<script>
    import DownloadButton from "../button/DownloadButton.svelte";
    import Arch from "../display/Arch.svelte";
</script>

<div>
    <h3>Instructions for Windows</h3>
    <Arch arch={["x86-64", "x86-32"]}>
        <ol>
            <li>Download the file using the button below.</li>
            <li>Close your browser.</li>
            <li>Open the downloaded file.</li>
            <li>Follow the instructions on-screen to install the software.</li>
            <li>You can now open your browser and the extension should work.</li>
        </ol>

        <DownloadButton arch="x86-64" href="https://github.com/null-dev/firefox-profile-switcher-connector/releases/latest/download/windows-x64.msi"/>
        <DownloadButton arch="x86-32" href="https://github.com/null-dev/firefox-profile-switcher-connector/releases/latest/download/windows-x86.msi"/>
    </Arch>
    <Arch arch={["arm", "other"]} unsupported>
        This extension will probably work on your platform but you'll have to compile it from source yourself.
        The source code for this extension can be found <a href="https://github.com/null-dev/firefox-profile-switcher-connector" target="_blank">here</a>.
    </Arch>
</div>
