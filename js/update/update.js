const distDropdown = document.getElementById("distribution_select");
async function init() {
    const changelogElement = document.getElementById("changelog");
    try {
        const resp = await fetch('https://api.github.com/repos/null-dev/firefox-profile-switcher-connector/releases');
        const json = await resp.json();
        const html = marked(json[0].body);

        changelogElement.innerHTML = html;
    } catch(e) {
        console.error(e);
        changelogElement.textContent = "Failed to load changelog.";
    }
}

init();
