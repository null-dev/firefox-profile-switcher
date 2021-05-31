const distDropdown = document.getElementById("distribution_select");
async function init() {
    const platformInfo = await browser.runtime.getPlatformInfo(); 
    const browserInfo = await browser.runtime.getBrowserInfo();

    const browserName = browserInfo.name; // Firefox
    const platform = platformInfo.os; // mac, win, android, cros, linux, openbsd
    let arch = platformInfo.arch; // x86-64, x86-32, arm
    if(arch !== "x86-64" && arch !== "x86-32" && arch !== "arm")
        arch = "other";

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
    for(const potentialArch of ["x86-64", "x86-32", "arm", "other"]) {
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
        compileTarget.innerHTML = compileInstructions.innerHTML;
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

    window.onhashchange = () => postInit(browserName, platform, arch);
    distDropdown.onchange = updateLinuxDist;
    updateLinuxDist();
}

function updateLinuxDist() {
    const newVal = distDropdown.value;

    for(const dist of document.querySelectorAll(".content > .instructions.linux .distribution")) {
        dist.classList.add("hidden");
    }
    for(const dist of document.querySelectorAll(".content > .instructions.linux .distribution." + newVal)) {
        dist.classList.remove("hidden");
    }
}

init();
