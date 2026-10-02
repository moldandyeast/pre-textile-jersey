// Builds public/index.html from the original piece in src/, verbatim except for five splices:
// js-yaml, jsPDF and JSZip inlined in place of their CDN <script src> tags, the credits CSS, and the credits bar.
import { readFileSync, writeFileSync } from 'node:fs';

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8');
let html = read('./src/pre-textile-jersey.html');

const splice = (find, replace) => {
  if (html.split(find).length !== 2) throw new Error(`expected exactly one match for ${find}`);
  html = html.replace(find, () => replace);
};

// Each library goes in where its CDN tag was. The sourceMappingURL comment is dropped so devtools never asks for a .map file.
const inline = (cdnPath, file) => {
  const js = read(file).replace(/\n\/\/# sourceMappingURL=\S+\s*$/, '').trimEnd();
  if (/<\/script|<!--/i.test(js)) throw new Error(`${file} contains </script or <!--`);
  splice(`<script src="https://cdnjs.cloudflare.com/ajax/libs/${cdnPath}"></script>`, `<script>${js}</script>`);
};
inline('js-yaml/4.1.0/js-yaml.min.js', './vendor/js-yaml/js-yaml.min.js');
inline('jspdf/2.5.1/jspdf.umd.min.js', './vendor/jspdf/jspdf.umd.min.js');
inline('jszip/3.10.1/jszip.min.js', './vendor/jszip/jszip.min.js');

splice('</style>\n\n<div id="landing">\n', `\n${read('./src/credits.css')}</style>\n\n${read('./src/credits.html')}<div id="landing">\n`);

writeFileSync(new URL('./public/index.html', import.meta.url), html);
console.log(`public/index.html ${html.length} chars`);
