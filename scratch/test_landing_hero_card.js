const fs = require('fs');
const path = require('path');

console.log('=== TEST SUITE: LANDING HERO CLINICAL NETWORK PREVIEW CARD ===');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'styles.css'), 'utf8');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

// 1. Check HTML elements
assert(html.includes('class="landing-hero-graphic"'), 'landing-hero-graphic exists');
assert(html.includes('class="hero-preview-card"'), 'hero-preview-card exists');
assert(html.includes('class="hero-preview-header"'), 'hero-preview-header exists');
assert(html.includes('class="live-dot-pulse"'), 'live-dot-pulse exists');
assert(html.includes('class="hero-preview-badge-text">Live Clinical Network</span>'), 'hero-preview-badge-text exists');
assert(html.includes('class="hero-preview-list"'), 'hero-preview-list exists');

// 2. Check Role items & navigations
assert(html.includes("navigateToLogin('PATIENT')"), 'Patient Portal item triggers navigateToLogin("PATIENT")');
assert(html.includes("navigateToLogin('DOCTOR')"), 'Doctor Workstation item triggers navigateToLogin("DOCTOR")');
assert(html.includes("navigateToLogin('HOSPITAL')"), 'Hospital Operations item triggers navigateToLogin("HOSPITAL")');

// 3. Check Subtitles & Pill Tags
assert(html.includes('Longitudinal EHR'), 'Patient pill "Longitudinal EHR" rendered');
assert(html.includes('Decision Safety'), 'Doctor pill "Decision Safety" rendered');
assert(html.includes('Real-Time Capacity'), 'Hospital pill "Real-Time Capacity" rendered');

// 4. Check Arrow & Footer Stats
assert(html.includes('class="hero-preview-arrow"'), 'hero-preview-arrow navigation cue rendered');
assert(html.includes('3</strong> Accredited Hospitals'), 'Accredited Hospitals live stat rendered');
assert(html.includes('119</strong> Beds Live'), '119 Beds Live stat rendered');
assert(html.includes('Zero-Duplicate Rx'), 'Zero-Duplicate Rx stat rendered');

// 5. Check Lucide SVG stroke vector icons (replaces raw emojis)
assert(html.includes('lucide-activity'), 'Activity SVG vector icon rendered in header meta');
assert(html.includes('lucide-user-check'), 'UserCheck SVG vector icon rendered in Patient card');
assert(html.includes('lucide-stethoscope'), 'Stethoscope SVG vector icon rendered in Doctor card');
assert(html.includes('lucide-building-2'), 'Building2 SVG vector icon rendered in Hospital card');
assert(html.includes('lucide-arrow-right'), 'ArrowRight SVG vector icon rendered in item buttons');

// 6. Check CSS rules
const requiredSelectors = [
  '.landing-hero-graphic',
  '.hero-preview-card',
  '.hero-preview-header',
  '.hero-preview-badge',
  '.live-dot-pulse',
  '@keyframes liveDotPulse',
  '.hero-preview-badge-text',
  '.hero-preview-meta',
  '.hero-preview-list',
  '.hero-preview-item',
  '.hero-preview-icon',
  '.hero-preview-icon.patient',
  '.hero-preview-icon.doctor',
  '.hero-preview-icon.hospital',
  '.hero-preview-content',
  '.hero-preview-title',
  '.hero-preview-pill',
  '.hero-preview-desc',
  '.hero-preview-arrow',
  '.hero-preview-footer',
  '.hero-footer-stat',
  '.hero-footer-dot'
];

requiredSelectors.forEach(selector => {
  assert(css.includes(selector), `CSS selector "${selector}" is defined`);
});

// 7. Check cache-busting version
assert(/styles\.css\?v=\d+\.\d+/.test(html), 'Cache buster incremented');

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

