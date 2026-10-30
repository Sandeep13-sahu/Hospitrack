const fs = require('fs');
const { getCSSLanguageService, TextDocument } = require('vscode-css-languageservice');

const service = getCSSLanguageService();
const cssContent = fs.readFileSync('scratch/master_unified.css', 'utf8');

const doc = TextDocument.create('file:///master_unified.css', 'css', 1, cssContent);
const stylesheet = service.parseStylesheet(doc);
const diagnostics = service.doValidation(doc, stylesheet);

console.log(`=== CSS DIAGNOSTICS FOR MASTER UNIFIED CSS (Total: ${diagnostics.length}) ===`);
diagnostics.forEach((d, i) => {
  console.log(`[Problem ${i + 1}] Line ${d.range.start.line + 1}, Col ${d.range.start.character + 1}: ${d.message} (code: ${d.code}, severity: ${d.severity})`);
});

