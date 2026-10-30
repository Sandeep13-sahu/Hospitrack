const fs = require('fs');
const css = fs.readFileSync('css/styles.css', 'utf8');
const lines = css.split('\n');

const issues = [];

// 1. Check for unclosed var() or calc()
lines.forEach((line, index) => {
  const lineNum = index + 1;
  const trimmed = line.trim();
  
  // Skip comments
  if (trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

  // Check calc syntax: operators must have spaces around them
  const calcMatches = trimmed.match(/calc\([^)]+\)/g);
  if (calcMatches) {
    calcMatches.forEach(c => {
      // e.g. calc(100%-20px) without spaces around - or +
      if (/calc\([^)]*([0-9a-zA-Z%]+[\+\-][0-9a-zA-Z%]+)[^)]*\)/.test(c)) {
        issues.push({ line: lineNum, type: 'calc-spacing', text: c });
      }
    });
  }

  // Check for var() with missing closing parenthesis
  if (/var\(--[a-zA-Z0-9_\-]+[^\),;}]*$/.test(trimmed) && !trimmed.endsWith(')')) {
    issues.push({ line: lineNum, type: 'unclosed-var', text: trimmed });
  }

  // Check for duplicate properties in same line or missing values
  if (/^[a-zA-Z_\-]+:\s*;/.test(trimmed)) {
    issues.push({ line: lineNum, type: 'empty-property-value', text: trimmed });
  }

  // Check for unknown pseudo-classes/elements
  const pseudoMatches = trimmed.match(/::?[a-zA-Z0-9_\-]+/g);
  if (pseudoMatches) {
    const validPseudos = new Set([
      ':hover', ':focus', ':active', ':visited', ':disabled', ':checked', ':first-child',
      ':last-child', ':nth-child', ':nth-of-type', ':first-of-type', ':last-of-type',
      ':not', ':is', ':where', ':has', ':root', ':empty', ':focus-within', ':focus-visible',
      '::before', '::after', '::placeholder', '::-webkit-scrollbar', '::-webkit-scrollbar-track',
      '::-webkit-scrollbar-thumb', '::-webkit-scrollbar-corner', '::-webkit-inner-spin-button',
      '::-webkit-outer-spin-button', ':read-only', ':required', ':valid', ':invalid'
    ]);
    pseudoMatches.forEach(p => {
      if (!validPseudos.has(p) && !p.startsWith(':nth-') && !p.startsWith(':not') && !p.startsWith(':has')) {
        issues.push({ line: lineNum, type: 'suspicious-pseudo', text: p });
      }
    });
  }

  // Check for CSS property name typos
  const propMatch = trimmed.match(/^([a-zA-Z\-]+)\s*:\s*([^;]+);?$/);
  if (propMatch && !trimmed.startsWith('--')) {
    const prop = propMatch[1].toLowerCase();
    // Common typos
    const knownProps = new Set([
      'display', 'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-flow',
      'align-items', 'justify-content', 'align-self', 'align-content', 'justify-items', 'justify-self',
      'grid', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas', 'grid-auto-flow',
      'grid-column', 'grid-row', 'grid-gap', 'gap', 'row-gap', 'column-gap',
      'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
      'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
      'border-width', 'border-style', 'border-radius', 'border-collapse', 'border-spacing',
      'background', 'background-color', 'background-image', 'background-position', 'background-size',
      'background-repeat', 'background-attachment', 'background-clip',
      'color', 'font', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
      'letter-spacing', 'text-align', 'text-decoration', 'text-transform', 'text-overflow', 'white-space',
      'word-break', 'overflow-wrap', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
      'overflow', 'overflow-x', 'overflow-y', 'box-shadow', 'opacity', 'visibility',
      'cursor', 'pointer-events', 'user-select', 'transition', 'transition-property', 'transition-duration',
      'transition-timing-function', 'transition-delay', 'transform', 'transform-origin',
      'animation', 'animation-name', 'animation-duration', 'animation-timing-function', 'animation-iteration-count',
      'content', 'box-sizing', 'outline', 'outline-color', 'outline-offset', 'vertical-align',
      'list-style', 'list-style-type', '-webkit-font-smoothing', '-moz-osx-font-smoothing',
      'backdrop-filter', '-webkit-backdrop-filter', 'resize', 'filter', 'text-shadow'
    ]);
    if (!knownProps.has(prop) && !prop.startsWith('-webkit-') && !prop.startsWith('-moz-')) {
      issues.push({ line: lineNum, type: 'unknown-property', text: prop });
    }
  }
});

console.log('Issues found:', issues.length);
issues.forEach(i => console.log(`Line ${i.line} [${i.type}]: ${i.text}`));

