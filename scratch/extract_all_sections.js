const { execSync } = require('child_process');
const fs = require('fs');

const initialCss = execSync('git show ab34f0b:css/styles.css').toString('utf8');

const regex = /\/\* =+\s*([\s\S]*?)\s*=+ \*\//g;
let m;
const headings = [];
while ((m = regex.exec(initialCss)) !== null) {
  headings.push({ index: m.index, title: m[1].trim() });
}

for (let i = 0; i < headings.length; i++) {
  const current = headings[i];
  const next = headings[i + 1];
  const content = next ? initialCss.slice(current.index, next.index) : initialCss.slice(current.index);
  console.log(`[Section ${i + 1}] ${current.title.split('\n')[0]} (${content.length} bytes)`);
}

