import sveltePreprocess from "svelte-preprocess";
import MagicString, {Bundle} from "magic-string";
import * as path from "path";
import * as fs from 'node:fs/promises';

/* Make `@import "./whatever.css" scoped;` statements import CSS into the component's CSS scope */
function importCSSPreprocess() {
  async function importCSS({ content, filename }) {
    function matchAllImports(str) {
      const globalRegex = /@import\s+(".*"|'.*')\s+scoped\s*;/g;
      const matches = [];
      let match;
      while ((match = globalRegex.exec(str)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        matches.push({ start, end, file: match[1].substring(1, match[1].length - 1) });
      }
      return matches;
    }

    const imports = matchAllImports(content);
    if(imports.length > 0) {
      let lastStart = null;
      const state = new MagicString(content, { filename });
      const remove = (start, end) => state.clone().remove(start, end);
      let out = [];
      const deps = [];
      for(const { start, end, file } of imports.reverse()) {
        // Right
        if(lastStart != null) {
          out.push(remove(lastStart, content.length).remove(0, end));
        } else {
          out.push(remove(0, end));
        }
        const absPath = path.join(path.dirname(filename), file);
        deps.push(absPath);
        const text = (await fs.readFile(absPath)).toString();
        out.push(new MagicString(text, { filename: absPath }));
        lastStart = start;
      }
      // Left
      const first = remove(lastStart, content.length);
      const bundle = new Bundle();
      bundle.addSource(first);
      for(let i = out.length - 1; i >= 0; i--) {
        bundle.addSource(out[i]);
      }

      return {
        code: bundle.toString(),
        map: bundle.generateMap(),
        dependencies: deps
      };
    } else {
      return {code: content};
    }
  }
  return { style: importCSS }
}

export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    importCSSPreprocess(),
    sveltePreprocess(),
  ],
};
