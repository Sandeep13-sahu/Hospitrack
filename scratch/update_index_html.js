const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add print.css link in head
if (!html.includes('css/print.css')) {
  html = html.replace(
    '<link rel="stylesheet" href="css/styles.css?v=4.8">',
    '<link rel="stylesheet" href="css/styles.css?v=4.8">\n  <link rel="stylesheet" href="css/print.css?v=1.0">'
  );
}

// 2. Add print module scripts
if (!html.includes('js/modules/printService.js')) {
  html = html.replace(
    '<script src="js/workspaceRenderer.js"></script>',
    `<script src="js/modules/documentUtils.js"></script>
  <script src="js/modules/printTemplates.js"></script>
  <script src="js/modules/printService.js"></script>
  <script src="js/workspaceRenderer.js"></script>`
  );
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html with print.css and print modules.');

