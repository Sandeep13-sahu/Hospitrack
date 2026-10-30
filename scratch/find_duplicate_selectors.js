const fs = require('fs');
const css = fs.readFileSync('css/styles.css', 'utf8');

// Match selectors outside of @media queries or inside
const selectorRegex = /([^{}]+)\s*\{/g;
let match;
const selectorCounts = new Map();

while ((match = selectorRegex.exec(css)) !== null) {
  const sel = match[1].trim();
  if (sel.startsWith('@') || sel.startsWith('/*')) continue;
  
  // Normalize multi-line selector
  const normalized = sel.replace(/\s+/g, ' ');
  selectorCounts.set(normalized, (selectorCounts.get(normalized) || 0) + 1);
}

const duplicates = [];
for (let [sel, count] of selectorCounts.entries()) {
  if (count > 1) {
    duplicates.push({ sel, count });
  }
}

console.log('Total duplicate selector blocks found:', duplicates.length);
duplicates.sort((a, b) => b.count - a.count).slice(0, 30).forEach(d => {
  console.log(`  [x${d.count}] ${d.sel}`);
});

