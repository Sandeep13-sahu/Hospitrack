const fs = require('fs');
const currentCss = fs.readFileSync('css/styles.css', 'utf8');

const regex = /\/\* =+\s*([\s\S]*?)\s*=+ \*\//g;
let m;
const headings = [];
while ((m = regex.exec(currentCss)) !== null) {
  headings.push({ index: m.index, title: m[1].trim() });
}

for (let i = 0; i < headings.length; i++) {
  const current = headings[i];
  const next = headings[i + 1];
  const content = next ? currentCss.slice(current.index, next.index) : currentCss.slice(current.index);
  console.log(`[Current Section ${i + 1}] ${current.title.split('\n')[0]} (${content.length} bytes)`);
}

