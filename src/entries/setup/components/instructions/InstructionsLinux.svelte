<script lang="ts">
    import DownloadButton from "../button/DownloadButton.svelte";
    import CompileInstructions from "../compileinstructions/CompileInstructions.svelte";
    import Arch from "../display/Arch.svelte";
    import {getTypedContext} from "~/lib/util/typed-context";
    import {SETUP_STATE_CONTEXT} from "../../main/state";
    import HomeInstallScript from "../homeinstallscript/HomeInstallScript.svelte";
    import {HomeInstallScriptType} from "../homeinstallscript/homeinstall";
    import {getUniqueElementId} from "~/lib/util/dom";

    let flatpak: string | null = null;
    let snap: string | null = null;

    let flatpakYesId = getUniqueElementId();
    let flatpakNoId = getUniqueElementId();

    let snapYesId = getUniqueElementId();
    let snapNoId = getUniqueElementId();

    let homeInstallArch: string | null = null;
    let homeInstallArch64Id = getUniqueElementId();
    let homeInstallArch32Id = getUniqueElementId();

    let setupState = getTypedContext(SETUP_STATE_CONTEXT);

    $: if(homeInstallArch == null) {
        homeInstallArch = $setupState.currentArch;
    }

    let distro: string | null = null;
</script>

<div>
    <h3>Instructions for Linux</h3>

    <p>
        Are you running Firefox with Flatpak? Check by typing <code>about:support</code> into the address bar, hit ENTER and see if on the resulting page the <code>Distribution ID</code> says <code>mozilla-flatpak</code>:
        <input id={flatpakYesId} type="radio" name="linux_flatpak" bind:group={flatpak} value="yes" autocomplete="off">
        <label for={flatpakYesId}>Yes</label>
        <input id={flatpakNoId} type="radio" name="linux_flatpak" bind:group={flatpak} value="no" autocomplete="off">
        <label for={flatpakNoId}>No</label>
    </p>
    {#if flatpak === "no"}
        <p>
            Are you running Firefox with Snap? Check by typing <code>about:support</code> into the address bar, hit ENTER and see if on the resulting page the <code>Application Binary</code> starts with <code>/snap</code>:
            <input id={snapYesId} type="radio" name="linux_snap" bind:group={snap} value="yes" autocomplete="off">
            <label for={snapYesId}>Yes</label>
            <input id={snapNoId} type="radio" name="linux_snap" bind:group={snap} value="no" autocomplete="off">
            <label for={snapNoId}>No</label>
        </p>
    {/if}
    {#if flatpak === "yes" || snap === "yes"}
        <p>
            Please select the architecture your system uses:
            <input id={homeInstallArch64Id} type="radio" bind:group={homeInstallArch} name="linux_home_arch" value="x86-64" autocomplete="off">
            <label for={homeInstallArch64Id}>64-bit</label>
            <input id={homeInstallArch32Id} type="radio" bind:group={homeInstallArch} name="linux_home_arch" value="x86-32" autocomplete="off">
            <label for={homeInstallArch32Id}>32-bit</label>
        </p>

        {#if homeInstallArch != null}
            Run the following shell script to install the connector software (you need to have the <code>ar</code>, <code>tar</code> and <code>curl</code> commands on your system):

            <HomeInstallScript arch={homeInstallArch} type={flatpak === "yes" ? HomeInstallScriptType.Flatpak : HomeInstallScriptType.Snap} />
        {/if}
    {:else if flatpak === "no" && snap === "no"}
        <p>
            What Linux distribution are you running?
            &nbsp;
            <select bind:value={distro} autocomplete="off">
                <option value="no-distribution" selected hidden></option>

                <!-- Debian based -->
                <option value="ubuntu">Ubuntu</option>
                <option value="debian">Debian</option>
                <option value="mint">Linux Mint</option>
                <option value="popos">Pop! OS</option>
                <option value="elementary">elementary OS</option>
                <option value="kdeneon">KDE neon</option>
                <option value="zorinos">Zorin OS</option>
                <option value="deepin">deepin</option>
                <option value="kali">Kali Linux</option>

                <!-- Arch-like -->
                <option value="arch">Arch Linux</option>
                <option value="manjaro">Manjaro</option>
                <option value="endeavouros">EndeavourOS</option>

                <!-- RPM -->
                <option value="fedora">Fedora</option>
                <option value="opensuse">openSUSE</option>
                <option value="centos">CentOS</option>

                <option value="other">Other</option>
            </select>
        </p>
        {#if ["ubuntu", "debian", "mint", "popos", "elementary", "kdeneon", "zorinos", "deepin", "kali"].includes(distro)}
            <Arch arch={["x86-64", "x86-32"]}>
                <p>Download the <code>.deb</code> file using the button below and install it.</p>
                <p>After you've installed the software, restart your browser.</p>

                <DownloadButton arch="x86-64" href="https://github.com/null-dev/firefox-profile-switcher-connector/releases/latest/download/linux-x64.deb"/>
                <DownloadButton arch="x86-32" href="https://github.com/null-dev/firefox-profile-switcher-connector/releases/latest/download/linux-x86.deb"/>
            </Arch>
            <Arch arch={["arm", "other"]} unsupported>
                <p>I don't have pre-built binaries for your architecture but you can compile them from source:</p>
                <CompileInstructions/>
            </Arch>
        {:else if ["arch", "manjaro", "endeavouros"].includes(distro)}
            <p>Install the <a href="https://aur.archlinux.org/packages/firefox-profile-switcher-connector/" target="_blank"><code>firefox-profile-switcher-connector</code></a> AUR package.</p>
            <p>Restart your browser after the package has finished installing.</p>
        {:else if ["fedora", "opensuse", "centos"].includes(distro)}
            <Arch arch={["x86-64", "x86-32"]}>
                <p>Download the <code>.rpm</code> file using the button below and install it.</p>
                <p>After you've installed the software, restart your browser.</p>

                <DownloadButton arch="x86-64" href="https://github.com/null-dev/firefox-profile-switcher-connector/releases/latest/download/linux-x64.rpm"/>
                <DownloadButton arch="x86-32" href="https://github.com/null-dev/firefox-profile-switcher-connector/releases/latest/download/linux-x86.rpm"/>
            </Arch>
            <Arch arch={["arm", "other"]} unsupported>
                <p>I don't have pre-built binaries for your architecture but you can compile them from source:</p>
                <CompileInstructions/>
            </Arch>
        {:else if distro != null && distro !== "no-distribution"}
            <p>This extension will probably still work on your distro, you'll just have to compile it from source:</p>
            <CompileInstructions/>
        {/if}
    {/if}
</div>
