const distDropdown = document.getElementById("distribution_select");

function resizeIframeToFitContent(iframe) {
    iframe.height = iframe.contentWindow.document.documentElement.offsetHeight;
}

let curChangelogElement = document.getElementById("changelog");

function updateChangelog(html, css) {
    const iframe = document.createElement("iframe");
    window.addEventListener('DOMContentLoaded', e => {
        resizeIframeToFitContent(iframe);
    });
    iframe.sandbox = "allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-same-origin";
    iframe.classList.add("seamless");
    iframe.onload = () => resizeIframeToFitContent(iframe);
    iframe.srcdoc = `
    <html class="${document.documentElement.className}">
    <head>
      <base target="_blank" />
      ${css}
    </head>
    <body>${html}</body>
    </html>
    `;

    curChangelogElement.replaceWith(iframe);
    curChangelogElement = iframe;
}

async function init() {
    try {
        const resp = await fetch('https://api.github.com/repos/null-dev/firefox-profile-switcher-connector/releases');
        const json = await resp.json();
        const html = marked(json[0].body);
        const cssOnThisPage = (await Promise.all(Array.from(document.querySelectorAll("link[rel=stylesheet]"))
            .map(it => fetch(it.href).then(it => it.text()))))
            .map(it => ('<style>' + it + '</style>'))
            .join('');

        updateChangelog(html, cssOnThisPage);
        darkModeListeners.push(() => updateChangelog(html, cssOnThisPage));
    } catch(e) {
        console.error(e);
        curChangelogElement.textContent = "Failed to load changelog.";
    }
}

init();

