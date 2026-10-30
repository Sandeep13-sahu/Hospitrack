const fs = require('fs');
const css = fs.readFileSync('css/styles.css', 'utf8');

// Parse rules and declarations
const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
let match;
let duplicateProps = [];
let unknownProps = [];
let invalidValues = [];

const knownProps = new Set([
  'display', 'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-flow', 'flex-basis',
  'order', 'align-items', 'justify-content', 'align-self', 'align-content', 'justify-items', 'justify-self',
  'place-items', 'place-content', 'place-self',
  'grid', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas', 'grid-auto-flow',
  'grid-auto-columns', 'grid-auto-rows', 'grid-column', 'grid-column-start', 'grid-column-end',
  'grid-row', 'grid-row-start', 'grid-row-end', 'grid-area', 'gap', 'row-gap', 'column-gap',
  'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'margin-inline', 'margin-block',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'padding-inline', 'padding-block',
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
  'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius',
  'border-collapse', 'border-spacing',
  'background', 'background-color', 'background-image', 'background-position', 'background-size',
  'background-repeat', 'background-attachment', 'background-clip', 'background-origin',
  'color', 'font', 'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant', 'line-height',
  'letter-spacing', 'text-align', 'text-decoration', 'text-decoration-line', 'text-decoration-color',
  'text-decoration-style', 'text-transform', 'text-overflow', 'text-shadow', 'white-space', 'word-break',
  'overflow-wrap', 'word-wrap', 'hyphens',
  'position', 'top', 'right', 'bottom', 'left', 'z-index', 'inset', 'inset-block', 'inset-inline',
  'overflow', 'overflow-x', 'overflow-y', 'box-shadow', 'opacity', 'visibility',
  'cursor', 'pointer-events', 'user-select', 'touch-action',
  'transition', 'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay',
  'transform', 'transform-origin', 'transform-style', 'perspective',
  'animation', 'animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay',
  'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'animation-play-state',
  'content', 'box-sizing', 'outline', 'outline-color', 'outline-style', 'outline-width', 'outline-offset',
  'vertical-align', 'list-style', 'list-style-type', 'list-style-position', 'list-style-image',
  'table-layout', 'caption-side', 'empty-cells',
  'object-fit', 'object-position', 'aspect-ratio',
  'filter', 'backdrop-filter', 'mix-blend-mode', 'isolation',
  'resize', 'appearance', 'columns', 'column-count', 'column-width', 'column-rule',
  'clip-path', 'mask', 'mask-image',
  'scrollbar-width', 'scrollbar-color', 'scroll-behavior', 'overscroll-behavior'
]);

while ((match = ruleRegex.exec(css)) !== null) {
  const selector = match[1].trim();
  const body = match[2];
  const line = css.substring(0, match.index).split('\n').length;
  
  const decls = body.split(';');
  const seenProps = new Set();
  
  decls.forEach(d => {
    const parts = d.split(':');
    if (parts.length >= 2) {
      const prop = parts[0].trim().toLowerCase();
      const val = parts.slice(1).join(':').trim();
      
      if (!prop.startsWith('--') && !prop.startsWith('/*')) {
        // Duplicate check
        if (seenProps.has(prop)) {
          duplicateProps.push({ line, selector, prop });
        }
        seenProps.add(prop);
        
        // Unknown property check
        if (!knownProps.has(prop) && !prop.startsWith('-webkit-') && !prop.startsWith('-moz-') && !prop.startsWith('-ms-')) {
          unknownProps.push({ line, selector, prop, val });
        }
      }
    }
  });
}

console.log('--- Duplicate Properties in Same Rule (' + duplicateProps.length + ') ---');
duplicateProps.forEach(d => console.log(`Line ${d.line} in "${d.selector}": duplicate "${d.prop}"`));

console.log('\n--- Unknown Properties (' + unknownProps.length + ') ---');
unknownProps.forEach(u => console.log(`Line ${u.line} in "${u.selector}": unknown "${u.prop}"`));

