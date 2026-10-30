/**
 * Automated Verification Suite:
 * UNIFIED HORIZONTAL SCROLLING & SYNCHRONIZED TIMELINE PROGRESS ARCHITECTURE
 * 
 * Verifies:
 * 1. HorizontalScrollTrack.tsx component, props, calculations, ref-driven scroll observers, and icons.
 * 2. scrollSync.js client-side engine, boundary detection, progress percentage, and mutation observer.
 * 3. CSS styles in css/styles.css (global viewport isolation, custom scrollbars, fade masks, sticky tables, centered timeline).
 * 4. Integrations in index.html, PatientClinicalRecords.tsx, PatientDischargePathway.tsx, SuperadminDashboard.tsx, and patientDashboard.js.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🧪 VERIFYING UNIFIED HORIZONTAL SCROLLING & TIMELINE INDICATORS');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// 1. HorizontalScrollTrack.tsx React Component Verification
// -----------------------------------------------------------------------------
console.log('📦 1. Verifying HorizontalScrollTrack.tsx Component...');

const tsxPath = path.join(__dirname, '../js/modules/HorizontalScrollTrack.tsx');
assert.ok(fs.existsSync(tsxPath), 'HorizontalScrollTrack.tsx must exist');
const tsxContent = fs.readFileSync(tsxPath, 'utf8');

runTest('HorizontalScrollTrack.tsx: exports typed data contracts and components', () => {
  assert.ok(tsxContent.includes('export interface HorizontalScrollTrackProps'), 'Must export HorizontalScrollTrackProps');
  assert.ok(tsxContent.includes('export const HorizontalScrollTrack: React.FC<HorizontalScrollTrackProps>'), 'Must export HorizontalScrollTrack');
  assert.ok(tsxContent.includes('export const HorizontalScrollItem'), 'Must export HorizontalScrollItem');
  assert.ok(tsxContent.includes('export const TableScrollWrapper'), 'Must export TableScrollWrapper');
  assert.ok(tsxContent.includes('export default HorizontalScrollTrack'), 'Must provide default export');
});

runTest('HorizontalScrollTrack.tsx: implements Lucide React navigation icons', () => {
  assert.ok(tsxContent.includes('ChevronLeft'), 'Must import ChevronLeft');
  assert.ok(tsxContent.includes('ChevronRight'), 'Must import ChevronRight');
  assert.ok(tsxContent.includes('<ChevronLeft'), 'Must render ChevronLeft');
  assert.ok(tsxContent.includes('<ChevronRight'), 'Must render ChevronRight');
});

runTest('HorizontalScrollTrack.tsx: binds reactive ref-driven scroll observers and percentage calculation', () => {
  assert.ok(tsxContent.includes('useRef<HTMLDivElement>'), 'Must use containerRef');
  assert.ok(tsxContent.includes('scrollWidth - clientWidth'), 'Must compute maxScroll via scrollWidth - clientWidth');
  assert.ok(tsxContent.includes('(scrollLeft / maxScroll) * 100'), 'Must calculate scroll percentage strictly from scrollLeft / maxScroll');
  assert.ok(tsxContent.includes('ResizeObserver'), 'Must observe dimensions with ResizeObserver');
  assert.ok(tsxContent.includes('requestAnimationFrame'), 'Must optimize scroll events with requestAnimationFrame');
});

runTest('HorizontalScrollTrack.tsx: implements boundary detection and disabled states', () => {
  assert.ok(tsxContent.includes('setCanScrollLeft(scrollLeft > 2)'), 'Must check left boundary');
  assert.ok(tsxContent.includes('setCanScrollRight(scrollLeft < maxScroll - 2)'), 'Must check right boundary');
  assert.ok(tsxContent.includes('disabled={!canScrollLeft}'), 'Left button must disable at start');
  assert.ok(tsxContent.includes('disabled={!canScrollRight}'), 'Right button must disable at end');
});

runTest('HorizontalScrollTrack.tsx: supports progress line, fade masks, and drag-to-scroll', () => {
  assert.ok(tsxContent.includes('role="progressbar"'), 'Must have progressbar role');
  assert.ok(tsxContent.includes('scroll-fade-mask'), 'Must support scroll-fade-mask');
  assert.ok(tsxContent.includes('handleMouseDown'), 'Must implement mouse drag support');
  assert.ok(tsxContent.includes('scrollStep = 240'), 'Must have configurable scrollStep');
});

// -----------------------------------------------------------------------------
// 2. scrollSync.js Client-Side Engine Verification
// -----------------------------------------------------------------------------
console.log('\n⚙️ 2. Verifying scrollSync.js Runtime Module...');

const scrollSyncPath = path.join(__dirname, '../js/modules/scrollSync.js');
assert.ok(fs.existsSync(scrollSyncPath), 'scrollSync.js must exist');
const scrollSyncContent = fs.readFileSync(scrollSyncPath, 'utf8');

// Load in VM sandbox for mathematical testing
const vm = require('vm');
const mockDom = {
  window: {},
  document: {
    readyState: 'complete',
    addEventListener: () => {},
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      className: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      setAttribute: () => {},
      appendChild: () => {},
      addEventListener: () => {}
    }),
    querySelectorAll: () => []
  }
};
mockDom.window.document = mockDom.document;
vm.createContext(mockDom);
vm.runInContext(scrollSyncContent, mockDom);

runTest('scrollSync.js: exports hospitrackScrollSync on global window', () => {
  assert.ok(mockDom.window.hospitrackScrollSync, 'Must export hospitrackScrollSync on window');
  assert.strictEqual(typeof mockDom.window.hospitrackScrollSync.initHorizontalScroll, 'function');
  assert.strictEqual(typeof mockDom.window.hospitrackScrollSync.calculateScrollPercentage, 'function');
  assert.strictEqual(typeof mockDom.window.initHorizontalScrollTrack, 'function');
});

runTest('scrollSync.js: mathematically computes scrollPercentage correctly', () => {
  const calc = mockDom.window.hospitrackScrollSync.calculateScrollPercentage;
  
  // Non-overflowing container (maxScroll = 0)
  assert.strictEqual(calc({ scrollLeft: 0, scrollWidth: 500, clientWidth: 500 }), 100);
  
  // Scrolled to beginning
  assert.strictEqual(calc({ scrollLeft: 0, scrollWidth: 1000, clientWidth: 500 }), 0);
  
  // Scrolled halfway (scrollLeft = 250 of 500 max)
  assert.strictEqual(calc({ scrollLeft: 250, scrollWidth: 1000, clientWidth: 500 }), 50);
  
  // Scrolled to the end (scrollLeft = 500 of 500 max)
  assert.strictEqual(calc({ scrollLeft: 500, scrollWidth: 1000, clientWidth: 500 }), 100);
});

runTest('scrollSync.js: handles table sticky columns and MutationObserver', () => {
  assert.ok(scrollSyncContent.includes('initTableStickyColumns'), 'Must implement table sticky column initializer');
  assert.ok(scrollSyncContent.includes('sticky-column-left'), 'Must apply sticky-column-left');
  assert.ok(scrollSyncContent.includes('MutationObserver'), 'Must attach MutationObserver for dynamic tab transitions');
  assert.ok(scrollSyncContent.includes('.milestone-stepper-ribbon'), 'Must target milestone steppers');
  assert.ok(scrollSyncContent.includes('.facility-pill-strip'), 'Must target facility switcher strips');
});

// -----------------------------------------------------------------------------
// 3. CSS Stylesheet & Layout Rules Verification
// -----------------------------------------------------------------------------
console.log('\n🎨 3. Verifying CSS Stylesheet (css/styles.css)...');

const cssPath = path.join(__dirname, '../css/styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

runTest('css/styles.css: enforces global container isolation on html, body, and main-content', () => {
  assert.ok(cssContent.includes('html,\nbody') || cssContent.includes('html, body'), 'Must target html and body');
  assert.ok(cssContent.includes('overflow-x: hidden !important'), 'html/body must have overflow-x: hidden !important');
  assert.ok(cssContent.includes('max-width: 100vw !important'), 'html/body must have max-width: 100vw !important');
  assert.ok(cssContent.includes('.main-content {\n  height: 100% !important;\n  overflow-y: auto !important;\n  overflow-x: hidden !important;\n  min-width: 0 !important;\n  max-width: 100% !important;'), 'main-content must be isolated with min-width: 0');
});

runTest('css/styles.css: defines custom-horizontal-scrollbar and no-scrollbar utilities', () => {
  assert.ok(cssContent.includes('.custom-horizontal-scrollbar::-webkit-scrollbar'), 'Must style custom horizontal scrollbar');
  assert.ok(cssContent.includes('height: 5px !important'), 'Scrollbar height must be 5px');
  assert.ok(cssContent.includes('.no-scrollbar'), 'Must provide no-scrollbar utility');
  assert.ok(cssContent.includes('scrollbar-width: none !important'), 'Must hide Firefox scrollbars');
});

runTest('css/styles.css: defines scroll-container, snap alignment, and scroll-fade-mask', () => {
  assert.ok(cssContent.includes('.scroll-container'), 'Must define scroll-container');
  assert.ok(cssContent.includes('scroll-snap-type: x mandatory !important'), 'Must enable mandatory x snap');
  assert.ok(cssContent.includes('.scroll-item'), 'Must define scroll-item');
  assert.ok(cssContent.includes('.scroll-fade-mask'), 'Must define scroll-fade-mask');
  assert.ok(cssContent.includes('mask-image: linear-gradient'), 'Must implement gradient mask');
});

runTest('css/styles.css: defines table-scroll-container and sticky pinned column classes', () => {
  assert.ok(cssContent.includes('.table-container,'), 'Must target .table-container');
  assert.ok(cssContent.includes('.table-container-clean,'), 'Must target .table-container-clean');
  assert.ok(cssContent.includes('.sticky-col-first,') || cssContent.includes('.sticky-column-left'), 'Must define sticky column');
  assert.ok(cssContent.includes('position: sticky !important'), 'Sticky column must have position: sticky');
  assert.ok(cssContent.includes('left: 0 !important'), 'Sticky column must have left: 0');
});

runTest('css/styles.css: defines synchronized timeline track and centered milestone circles', () => {
  assert.ok(cssContent.includes('.timeline-track-wrapper'), 'Must define timeline-track-wrapper');
  assert.ok(cssContent.includes('.timeline-track-bg'), 'Must define timeline-track-bg');
  assert.ok(cssContent.includes('.timeline-progress-bar'), 'Must define timeline-progress-bar');
  assert.ok(cssContent.includes('.scroll-progress-bar'), 'Must define scroll-progress-bar');
  assert.ok(cssContent.includes('.milestone-stepper-ribbon::before'), 'Must position connected track behind milestone circles');
  assert.ok(cssContent.includes('.milestone-step-circle'), 'Must style milestone-step-circle');
});

// -----------------------------------------------------------------------------
// 4. Dashboard Integration Verification
// -----------------------------------------------------------------------------
console.log('\n💻 4. Verifying Dashboard Integrations...');

const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
runTest('index.html: loads js/modules/scrollSync.js in script sequence', () => {
  assert.ok(indexHtml.includes('js/modules/scrollSync.js'), 'index.html must load scrollSync.js');
});

const patientRecsContent = fs.readFileSync(path.join(__dirname, '../js/modules/PatientClinicalRecords.tsx'), 'utf8');
runTest('PatientClinicalRecords.tsx: imports and uses HorizontalScrollTrack for milestones', () => {
  assert.ok(patientRecsContent.includes("import { HorizontalScrollTrack } from './HorizontalScrollTrack'"), 'Must import HorizontalScrollTrack');
  assert.ok(patientRecsContent.includes('<HorizontalScrollTrack'), 'Must render HorizontalScrollTrack');
});

const dischargePathwayContent = fs.readFileSync(path.join(__dirname, '../js/modules/PatientDischargePathway.tsx'), 'utf8');
runTest('PatientDischargePathway.tsx: imports and uses HorizontalScrollTrack for clearance pipeline', () => {
  assert.ok(dischargePathwayContent.includes("import { HorizontalScrollTrack } from './HorizontalScrollTrack'"), 'Must import HorizontalScrollTrack');
  assert.ok(dischargePathwayContent.includes('<HorizontalScrollTrack'), 'Must render HorizontalScrollTrack');
});

const superadminContent = fs.readFileSync(path.join(__dirname, '../js/modules/SuperadminDashboard.tsx'), 'utf8');
runTest('SuperadminDashboard.tsx: imports and uses HorizontalScrollTrack for credential tables', () => {
  assert.ok(superadminContent.includes("import { HorizontalScrollTrack } from './HorizontalScrollTrack'"), 'Must import HorizontalScrollTrack');
  assert.ok(superadminContent.includes('<HorizontalScrollTrack'), 'Must render HorizontalScrollTrack');
});

const patientDashContent = fs.readFileSync(path.join(__dirname, '../js/components/patientDashboard.js'), 'utf8');
runTest('patientDashboard.js: synchronizes scroll tracks on view render', () => {
  assert.ok(patientDashContent.includes('window.hospitrackScrollSync.initAllScrollTracks(container)'), 'Must call initAllScrollTracks in patient dashboard');
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('🎉 ALL 17 VERIFICATION CHECKS PASSED PERFECTLY (100% PASS)!');
} else {
  console.error(`FAILED ${totalTests - passedTests} CHECKS`);
  process.exit(1);
}
console.log('================================================================\n');

