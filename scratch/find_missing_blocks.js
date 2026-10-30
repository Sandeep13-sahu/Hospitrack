const { execSync } = require('child_process');
const fs = require('fs');

const initialCss = execSync('git show ab34f0b:css/styles.css').toString('utf8');
const currentCss = fs.readFileSync('css/styles.css', 'utf8');

// Parse selector blocks: selector { ... }
function extractBlocks(css) {
  const blocks = [];
  // simple parser for top-level rules
  let i = 0;
  while (i < css.length) {
    if (css.slice(i, i + 2) === '/*') {
      const endComment = css.indexOf('*/', i + 2);
      if (endComment === -1) break;
      i = endComment + 2;
      continue;
    }
    const openBrace = css.indexOf('{', i);
    if (openBrace === -1) break;
    const selector = css.slice(i, openBrace).trim();
    
    // find matching closing brace
    let depth = 1;
    let j = openBrace + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    const body = css.slice(openBrace, j);
    blocks.push({ selector, full: selector + ' ' + body, body });
    i = j;
  }
  return blocks;
}

const initBlocks = extractBlocks(initialCss);
const currBlocks = extractBlocks(currentCss);

console.log('Initial CSS blocks:', initBlocks.length);
console.log('Current CSS blocks:', currBlocks.length);

const currSelectors = new Set(currBlocks.map(b => b.selector));
const missingInCurrent = initBlocks.filter(b => !currSelectors.has(b.selector) && !b.selector.startsWith('@'));

console.log('Blocks in initial but missing in current:', missingInCurrent.length);
console.log('Sample missing selectors:');
missingInCurrent.slice(0, 25).forEach(b => console.log('  ' + b.selector));

