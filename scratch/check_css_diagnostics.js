const { getCSSLanguageService } = require('vscode-css-languageservice');
const { TextDocument } = require('vscode-languageserver-textdocument');
const fs = require('fs');

const cssContent = fs.readFileSync('css/styles.css', 'utf8');
const doc = TextDocument.create('file:///s:/hospitrack-project/css/styles.css', 'css', 1, cssContent);
const ls = getCSSLanguageService();
const stylesheet = ls.parseStylesheet(doc);

// Pass standard VS Code lint settings
const lintSettings = {
  validate: true,
  lint: {
    compatibleVendorPrefixes: 'warning',
    vendorPrefix: 'warning',
    duplicateProperties: 'warning',
    emptyRules: 'warning',
    importStatement: 'warning',
    boxModel: 'ignore',
    universalSelector: 'ignore',
    zeroUnits: 'ignore',
    fontFaceProperties: 'warning',
    hexColorLength: 'error',
    argumentsInColorFunction: 'error',
    unknownProperties: 'warning',
    ieHack: 'ignore',
    unknownVendorSpecificProperties: 'ignore',
    propertyIgnoredDueToDisplay: 'warning',
    important: 'ignore',
    float: 'ignore',
    idSelector: 'ignore',
    unknownAtRules: 'warning'
  }
};

const diagnostics = ls.doValidation(doc, stylesheet, lintSettings);

console.log('=== CSS DIAGNOSTICS (Total: ' + diagnostics.length + ') ===');
diagnostics.forEach((d, i) => {
  console.log(`[Problem ${i + 1}] Line ${d.range.start.line + 1}, Col ${d.range.start.character + 1}: ${d.message} (code: ${d.code || 'none'}, severity: ${d.severity})`);
});
