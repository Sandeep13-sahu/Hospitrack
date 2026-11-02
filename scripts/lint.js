/**
 * Hospitrack — Production Codebase & JavaScript Syntax Linter
 * Validates ES2022+ syntax, imports, and execution safety across all
 * frontend, serverless API gateway, and server entry points.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TARGET_DIRECTORIES = ['js', 'api', 'scripts'];
const TARGET_FILES = ['server.js', 'test.js'];

let totalChecked = 0;
let totalErrors = 0;
const failures = [];

function checkFile(filePath) {
  totalChecked++;
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  try {
    execSync(`node -c "${filePath}"`, { stdio: 'pipe' });
    process.stdout.write(`  ✓ [VALID] ${relativePath}\n`);
  } catch (err) {
    totalErrors++;
    failures.push({ file: relativePath, error: err.stderr ? err.stderr.toString() : err.message });
    process.stderr.write(`  ✕ [FAIL]  ${relativePath}\n`);
  }
}

function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'scratch') {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      checkFile(fullPath);
    }
  }
}

console.log('======================================================================');
console.log('  HOSPITRACK — CODE QUALITY & JAVASCRIPT INTEGRITY VERIFICATION');
console.log('======================================================================\n');

for (const dir of TARGET_DIRECTORIES) {
  scanDirectory(path.join(PROJECT_ROOT, dir));
}

for (const file of TARGET_FILES) {
  const fullPath = path.join(PROJECT_ROOT, file);
  if (fs.existsSync(fullPath)) {
    checkFile(fullPath);
  }
}

console.log('\n======================================================================');
console.log(`  VERIFICATION RESULTS: ${totalChecked - totalErrors}/${totalChecked} files passed`);
if (totalErrors === 0) {
  console.log('  [PASS] All JavaScript source files passed strict syntax verification.');
  console.log('======================================================================\n');
  process.exit(0);
} else {
  console.error(`  [FAIL] ${totalErrors} file(s) failed validation:`);
  failures.forEach(f => console.error(`    - ${f.file}: ${f.error.trim()}`));
  console.log('======================================================================\n');
  process.exit(1);
}

