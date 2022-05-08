const distDropdown = document.getElementById("distribution_select");
const distDropdownWrapper = document.getElementById("distribution_select_wrapper");
const linuxFlatpakSelectWrapper = document.getElementById("linux_flatpak_select_wrapper");
const linuxSnapSelectWrapper = document.getElementById("linux_snap_select_wrapper");
const linuxHomeArchSelectWrapper = document.getElementById("linux_home_arch_select_wrapper");
const archList = ["x86-64", "x86-32", "arm", "other"];
let flatpak = null;
let snap = null;
let homeInstallArch = null;
async function init() {
    const platformInfo = await browser.runtime.getPlatformInfo(); 
    const browserInfo = await browser.runtime.getBrowserInfo();

    const browserName = browserInfo.name; // Firefox
    const platform = platformInfo.os; // mac, win, android, cros, linux, openbsd
    let arch = platformInfo.arch; // x86-64, x86-32, arm
    if(!archList.includes(arch))
        arch = "other";

    linuxHomeArchSelectWrapper.onchange = e => {
        if(e.target.name === 'linux_home_arch') {
            homeInstallArch = e.target.value;
            updateHomeInstallInstructions();
        }
    };
    const homeArchElement = document.getElementById("linux_home_arch_" + arch);
    homeArchElement.checked = true;
    homeArchElement.dispatchEvent(new Event('change', { bubbles: true })); // Trigger onchange

    postInit(browserName, platform, arch);
}

function postInit(browserName, platform, arch) {
    // TODO Handle different browser
    
    const advanced = window.location.hash === "#advanced";
    // Hide irrelevant OS instructions
    for(const dist of document.querySelectorAll(".content > .instructions")) {
        if(dist.classList.contains("unsupported") || !advanced) {
                dist.classList.add("hidden");
        } else {
                dist.classList.remove("hidden");
        }
    }
    for(const dist of document.querySelectorAll(".content > .instructions." + platform)) {
        dist.classList.remove("hidden");
    }

    // Update download buttons
    for(const dlBtn of document.querySelectorAll(".content > .instructions .download.button")) {
        if(advanced) {
            if(dlBtn.classList.contains("x86-64")) {
                dlBtn.textContent = "Download for 64-bit systems";
            } else if(dlBtn.classList.contains("x86-32")) {
                dlBtn.textContent = "Download for 32-bit systems";
            } else if(dlBtn.classList.contains("arm")) {
                dlBtn.textContent = "Download for ARM systems";
            }
        } else {
            dlBtn.textContent = "Download";
        }
    }

    // Update arch instructions
    for(const potentialArch of archList) {
        for(const element of document.querySelectorAll(".content > .instructions .arch." + potentialArch)) {
            if((advanced && !element.classList.contains("unsupported")) || (!advanced && element.classList.contains(arch))) {
                element.classList.remove("hidden");
            } else {
                element.classList.add("hidden");
            }
        }
    }

    // Inject compile instructions
    const compileInstructions = document.getElementById("compile_instructions");
    for(const compileTarget of document.querySelectorAll(".compile.instructions")) {
        while (compileTarget.firstChild) { compileTarget.removeChild(compileTarget.lastChild); } // clear
        for(const child of compileInstructions.content.children) {
            compileTarget.appendChild(child.cloneNode(true));
        }
    }

    for(const element of document.querySelectorAll(".advanced-only")) {
        if(advanced) {
            element.classList.remove("hidden");
        } else {
            element.classList.add("hidden");
        }
    }
    for(const element of document.querySelectorAll(".simple-only")) {
        if(!advanced) {
            element.classList.remove("hidden");
        } else {
            element.classList.add("hidden");
        }
    }

    linuxFlatpakSelectWrapper.onchange = e => {
        if(e.target.name === 'linux_flatpak') {
            flatpak = e.target.value === "yes";
            snap = null;
            postInit(browserName, platform, arch);
        }
    };
    linuxSnapSelectWrapper.onchange = e => {
        if(e.target.name === 'linux_snap') {
            snap = e.target.value === "yes";
            postInit(browserName, platform, arch);
        }
    };

    updateHomeInstallInstructions();

    const showLinuxDist = flatpak === false && snap === false;
    const showHomeInstall = flatpak === true || snap === true;
    distDropdownWrapper.classList[showLinuxDist ? "remove" : "add"]("hidden");
    linuxSnapSelectWrapper.classList[flatpak === false ? "remove" : "add"]("hidden");
    for(const element of document.querySelectorAll(".content > .instructions .home-install")) {
        element.classList[showHomeInstall ? "remove" : "add"]("hidden");
    }

    window.onhashchange = () => postInit(browserName, platform, arch);
    distDropdown.onchange = () => updateLinuxDist(showLinuxDist);
    updateLinuxDist(showLinuxDist);
}

function updateHomeInstallInstructions() {
    // Inject home-install instructions
    const homeInstallInstructions = document.getElementById("home_install_instructions");
    for(const homeInstallTarget of document.querySelectorAll(".home-install > .instructions")) {
        while (homeInstallTarget.firstChild) { homeInstallTarget.removeChild(homeInstallTarget.lastChild); } // clear
        for(const child of homeInstallInstructions.content.children) {
            homeInstallTarget.appendChild(child.cloneNode(true));
        }
        // Update text to match arch
        if(homeInstallArch != null) {
            for(const element of homeInstallTarget.querySelectorAll(".home-arch:not(." + homeInstallArch + ")")) {
                element.remove();
            }
        }
        // Update text to match type
        for(const element of homeInstallTarget.querySelectorAll(".home-type.snap")) {
            if(snap !== true) element.remove();
        }
        for(const element of homeInstallTarget.querySelectorAll(".home-type.flatpak")) {
            if(flatpak !== true) element.remove();
        }
        // Highlight code
        for(const preCode of homeInstallTarget.querySelectorAll("pre > code")) {
            hljs.highlightElement(preCode);
        }
    }
}

function updateLinuxDist(show) {
    const newVal = distDropdown.value;

    for(const dist of document.querySelectorAll(".content > .instructions.linux .distribution")) {
        dist.classList.add("hidden");
    }
    if(show) {
        for(const dist of document.querySelectorAll(".content > .instructions.linux .distribution." + newVal)) {
            dist.classList.remove("hidden");
        }
    }
}

init();
