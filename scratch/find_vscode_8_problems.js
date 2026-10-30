const { getCSSLanguageService } = require('vscode-css-languageservice');
const { TextDocument } = require('vscode-languageserver-textdocument');
const fs = require('fs');

const cssContent = fs.readFileSync('css/styles.css', 'utf8');
const doc = TextDocument.create('file:///s:/hospitrack-project/css/styles.css', 'css', 1, cssContent);
const ls = getCSSLanguageService();
const stylesheet = ls.parseStylesheet(doc);

// Turn ON every lint rule to 'warning' or 'error'
const allRules = [
  'compatibleVendorPrefixes',
  'vendorPrefix',
  'duplicateProperties',
  'emptyRules',
  'importStatement',
  'boxModel',
  'universalSelector',
  'zeroUnits',
  'fontFaceProperties',
  'hexColorLength',
  'argumentsInColorFunction',
  'unknownProperties',
  'ieHack',
  'unknownVendorSpecificProperties',
  'propertyIgnoredDueToDisplay',
  'important',
  'float',
  'idSelector',
  'unknownAtRules'
];

allRules.forEach(rule => {
  const settings = { validate: true, lint: {} };
  settings.lint[rule] = 'warning';
  const diags = ls.doValidation(doc, stylesheet, settings);
  if (diags.length > 0) {
    console.log(`Rule [${rule}]: ${diags.length} issue(s)`);
    diags.forEach(d => {
      console.log(`  Line ${d.range.start.line + 1}, Col ${d.range.start.character + 1}: ${d.message}`);
    });
  }
});

