const distDropdown = document.getElementById("distribution_select");
const distDropdownWrapper = document.getElementById("distribution_select_wrapper");
const linuxFlatpakSelectWrapper = document.getElementById("linux_flatpak_select_wrapper");
const linuxFlatpakArchSelectWrapper = document.getElementById("linux_flatpak_arch_select_wrapper");
const archList = ["x86-64", "x86-32", "arm", "other"];
async function init() {
    const platformInfo = await browser.runtime.getPlatformInfo(); 
    const browserInfo = await browser.runtime.getBrowserInfo();

    const browserName = browserInfo.name; // Firefox
    const platform = platformInfo.os; // mac, win, android, cros, linux, openbsd
    let arch = platformInfo.arch; // x86-64, x86-32, arm
    if(!archList.includes(arch))
        arch = "other";

    linuxFlatpakArchSelectWrapper.onchange = e => {
        if(e.target.name === 'linux_flatpak_arch') {
            for(const element of document.querySelectorAll(".content > .instructions .flatpak-arch")) {
                element.classList.add("hidden");
            }
            for(const element of document.querySelectorAll(".content > .instructions .flatpak-arch." + e.target.value)) {
                element.classList.remove("hidden");
            }
        }
    };
    const flatpakArchElement = document.getElementById("linux_flatpak_arch_" + arch);
    flatpakArchElement.checked = true;
    flatpakArchElement.dispatchEvent(new Event('change', { bubbles: true })); // Trigger onchange

    postInit(browserName, platform, arch, null);
}

function postInit(browserName, platform, arch, flatpak) {
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
            postInit(browserName, platform, arch, e.target.value === "yes");
        }
    };

    const showLinuxDist = flatpak === false;
    distDropdownWrapper.classList[showLinuxDist ? "remove" : "add"]("hidden");
    for(const element of document.querySelectorAll(".content > .instructions .flatpak")) {
        element.classList[flatpak === true ? "remove" : "add"]("hidden");
    }

    window.onhashchange = () => postInit(browserName, platform, arch, flatpak);
    distDropdown.onchange = () => updateLinuxDist(showLinuxDist);
    updateLinuxDist(showLinuxDist);
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
