const { execSync } = require('child_process');
const fs = require('fs');

console.log('=== HOSPITRACK MASTER CSS COMPOSER V4 (WITH DOCTORS & ALL ROLES) ===');

const initialCss = execSync('git show ab34f0b:css/styles.css').toString('utf8');
const currentCss = fs.readFileSync('css/styles.css', 'utf8');
const doctorAndRoleStyles = fs.readFileSync('scratch/doctor_and_role_styles.css', 'utf8');
const moreRoleStyles = fs.readFileSync('scratch/more_role_styles.css', 'utf8');

// Function to parse CSS into rule blocks
function parseRules(css) {
  const rules = [];
  let i = 0;
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i++;
    if (i >= css.length) break;

    if (css.slice(i, i + 2) === '/*') {
      const end = css.indexOf('*/', i + 2);
      if (end === -1) break;
      const commentText = css.slice(i, end + 2);
      rules.push({ type: 'comment', text: commentText });
      i = end + 2;
      continue;
    }

    if (css[i] === '@') {
      const openBrace = css.indexOf('{', i);
      if (openBrace === -1) break;
      const atSelector = css.slice(i, openBrace).trim();
      let depth = 1;
      let j = openBrace + 1;
      while (j < css.length && depth > 0) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') depth--;
        j++;
      }
      const body = css.slice(openBrace, j);
      rules.push({ type: 'at-rule', selector: atSelector, full: atSelector + ' ' + body, body });
      i = j;
      continue;
    }

    const openBrace = css.indexOf('{', i);
    if (openBrace === -1) break;
    const selector = css.slice(i, openBrace).trim();
    let depth = 1;
    let j = openBrace + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    const body = css.slice(openBrace, j);
    rules.push({ type: 'rule', selector, full: selector + ' ' + body, body });
    i = j;
  }
  return rules;
}

const initRules = parseRules(initialCss);
const currRules = parseRules(currentCss);
const docRules = parseRules(doctorAndRoleStyles);
const moreRules = parseRules(moreRoleStyles);

console.log(`Initial: ${initRules.length}, Current: ${currRules.length}, Doctor/Roles: ${docRules.length}, More: ${moreRules.length}`);

const selectorMap = new Map();
const outputRules = [];

function addRule(r, source) {
  if (r.type === 'comment') {
    outputRules.push(r.text);
    return;
  }
  if (r.type === 'at-rule') {
    outputRules.push(r.full);
    return;
  }
  const normalizedSelector = r.selector.replace(/\s+/g, ' ').trim();
  if (selectorMap.has(normalizedSelector)) {
    if (source === 'current' || source === 'doctor') {
      const idx = selectorMap.get(normalizedSelector);
      outputRules[idx] = r.full;
    }
    return;
  }
  selectorMap.set(normalizedSelector, outputRules.length);
  outputRules.push(r.full);
}

// 1. Initial base rules
initRules.forEach(r => addRule(r, 'initial'));

// 2. Current production enhanced rules
currRules.forEach(r => addRule(r, 'current'));

// 3. Doctor and all role rules
docRules.forEach(r => addRule(r, 'doctor'));

// 4. Advanced clinical panels and workspace rules
moreRules.forEach(r => addRule(r, 'more'));

// Final assembly
let finalCss = outputRules.join('\n\n');

// Eliminate render-blocking Google Font import (fonts are parallel-loaded in index.html)
finalCss = finalCss.replace(/@import\s+url\([^)]+\);\s*/g, '');

// Write to css/styles.css
fs.writeFileSync('css/styles.css', finalCss, 'utf8');
console.log(`✓ Master consolidated CSS written to css/styles.css (${finalCss.length} bytes, ${finalCss.split('\n').length} lines)`);
