//language=css
export const INLINE_STYLE = `
    body {
        --blue-60: #0060df;
        --blue-70: #003eaa;
        --blue-80: #002275;
        
        --in-content-page-color: rgb(21, 20, 26);
        --in-content-page-background: #fefefe;
        
        --in-content-link-color: var(--blue-60);
        --in-content-link-color-hover: var(--blue-70);
        --in-content-link-color-active: var(--blue-80);
        --in-content-link-color-visited: var(--in-content-link-color);
        
        background-color: var(--in-content-page-background);
        color: var(--in-content-page-color);

        font-family: Roboto, Noto, "San Francisco", Ubuntu, "Segoe UI", "Fira Sans", message-box, Arial, sans-serif;
        font-size: 12pt;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }
    body.dark-mode {
        --in-content-page-background: rgb(28,27,34);
        --in-content-page-color: rgb(251,251,254);

        --in-content-primary-button-background: rgb(0,221,255);
        --in-content-primary-button-background-hover: rgb(128,235,255);
        --in-content-primary-button-background-active: rgb(170,242,255);
        
        --in-content-link-color: var(--in-content-primary-button-background);
        --in-content-link-color-hover: var(--in-content-primary-button-background-hover);
        --in-content-link-color-active: var(--in-content-primary-button-background-active);
    }
    a {
        color: var(--in-content-link-color);
        text-decoration: none;
    }
    a:hover {
        color: var(--in-content-link-color-hover);
        text-decoration: underline;
    }
    a:visited {
        color: var(--in-content-link-color-visited);
    }
    a:hover:active {
        color: var(--in-content-link-color-active);
        text-decoration: none;
    }
`;

export function calcSrcDoc(darkMode: boolean, html: string) {
    return `
    <html lang="en">
    <head>
      <base target="_blank" />
      <style>${INLINE_STYLE}</style>
    </head>
    <body class="${darkMode ? "dark-mode" : ""}">${html}</body>
    </html>
    `;
}

