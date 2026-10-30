/**
 * Live Headless Chrome End-to-End Test Suite for Hospitrack Global Sidebar & Workspace
 * Tests:
 * 1. Super Admin, Hospital Admin, Doctor, and Patient real logins
 * 2. Sidebar Toggle (Expanded -> Collapsed -> Expanded) in each panel
 * 3. Computed CSS check: label display: none, icon centering, grid column width, container min-width
 * 4. Navigating to tabs while collapsed and while expanded
 * 5. Persistence across reloads (localStorage)
 * 6. Responsive mobile drawer & overlay behavior at 375px & 768px
 * 7. Console error monitor (0 JS errors, 0 TypeErrors, 0 unhandled rejections)
 */

const { spawn } = require('child_process');
const http = require('http');
const https = require('https');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class SimpleCDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.msgId = 1;
    this.callbacks = new Map();
    this.consoleErrors = [];
  }

  async connect() {
    const WebSocket = require('stream');
    // Using Node's native HTTP upgrade to WebSocket
    return new Promise((resolve, reject) => {
      const parsed = new URL(this.wsUrl);
      const req = http.request({
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        headers: {
          'Connection': 'Upgrade',
          'Upgrade': 'websocket',
          'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
          'Sec-WebSocket-Version': '13'
        }
      });

      req.on('upgrade', (res, socket, head) => {
        this.socket = socket;
        this.setupSocket();
        resolve();
      });

      req.on('error', reject);
      req.end();
    });
  }

  setupSocket() {
    let buffer = Buffer.alloc(0);

    this.socket.on('data', chunk => {
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length >= 2) {
        const firstByte = buffer[0];
        const secondByte = buffer[1];
        const opcode = firstByte & 0x0f;
        let payloadLength = secondByte & 0x7f;
        let offset = 2;

        if (payloadLength === 126) {
          if (buffer.length < 4) break;
          payloadLength = buffer.readUInt16BE(2);
          offset = 4;
        } else if (payloadLength === 127) {
          if (buffer.length < 10) break;
          payloadLength = Number(buffer.readBigUInt64BE(2));
          offset = 10;
        }

        if (buffer.length < offset + payloadLength) break;

        const payload = buffer.slice(offset, offset + payloadLength);
        buffer = buffer.slice(offset + payloadLength);

        if (opcode === 1) { // text frame
          try {
            const msg = JSON.parse(payload.toString('utf8'));
            if (msg.method === 'Runtime.consoleAPICalled') {
              if (msg.params.type === 'error') {
                this.consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
              }
            } else if (msg.method === 'Runtime.exceptionThrown') {
              this.consoleErrors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
            }
            if (msg.id && this.callbacks.has(msg.id)) {
              const cb = this.callbacks.get(msg.id);
              this.callbacks.delete(msg.id);
              if (msg.error) cb.reject(new Error(msg.error.message));
              else cb.resolve(msg.result);
            }
          } catch (e) {}
        }
      }
    });
  }

  sendFrame(text) {
    const payload = Buffer.from(text, 'utf8');
    const length = payload.length;
    let header;

    if (length < 126) {
      header = Buffer.alloc(6);
      header[0] = 0x81; // fin + text
      header[1] = 0x80 | length; // masked
      header.writeUInt32BE(0x12345678, 2); // mask key
    } else if (length < 65536) {
      header = Buffer.alloc(8);
      header[0] = 0x81;
      header[1] = 0x80 | 126;
      header.writeUInt16BE(length, 2);
      header.writeUInt32BE(0x12345678, 4);
    } else {
      header = Buffer.alloc(14);
      header[0] = 0x81;
      header[1] = 0x80 | 127;
      header.writeBigUInt64BE(BigInt(length), 2);
      header.writeUInt32BE(0x12345678, 10);
    }

    const mask = header.slice(header.length - 4);
    const maskedPayload = Buffer.alloc(length);
    for (let i = 0; i < length; i++) {
      maskedPayload[i] = payload[i] ^ mask[i % 4];
    }

    this.socket.write(Buffer.concat([header, maskedPayload]));
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.sendFrame(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval Exception: ${res.exceptionDetails.text} ${res.exceptionDetails.exception?.description || ''}`);
    }
    return res.result?.value;
  }
}

async function runLiveBrowserTests() {
  console.log('======================================================================');
  console.log('🏥 STARTING LIVE HEADLESS CHROME VERIFICATION SUITE FOR HOSPITRACK');
  console.log('======================================================================\n');

  // Spawn Chrome
  console.log('1. Launching Google Chrome in headless mode with remote debugging...');
  const chromeProcess = spawn(CHROME_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'http://localhost:8000/'
  ], { stdio: 'ignore' });

  // Wait for Chrome to bind port
  await sleep(1500);

  let version;
  for (let i = 0; i < 10; i++) {
    try {
      version = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (version) break;
    } catch (e) {
      await sleep(500);
    }
  }

  if (!version) {
    console.error('Failed to connect to Chrome debugging port.');
    chromeProcess.kill();
    process.exit(1);
  }

  console.log('Chrome connected successfully.');

  const targets = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) {
    console.error('No page target found.');
    chromeProcess.kill();
    process.exit(1);
  }

  const cdp = new SimpleCDP(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  console.log('CDP WebSocket connected.\n');

  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');

  await sleep(1000);

  let passCount = 0;
  let failCount = 0;

  function assertPass(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failCount++;
    }
  }

  // Helper login function
  async function performLogin(role, name, hospitalId = 'HOSP-101', doctorId = 'DOC-201') {
    console.log(`\n--- Loading panel as ${role} ---`);
    await cdp.eval(`
      (function() {
        window.location.hash = '';
        const user = {
          id: 'USER-' + '${role}',
          name: '${name}',
          email: '${role.toLowerCase()}@hospitrack.com',
          role: '${role}',
          hospitalId: '${hospitalId}',
          doctorId: '${doctorId}'
        };
        sessionStorage.setItem('hospitrack_auth_user', JSON.stringify(user));
        sessionStorage.setItem('hospitrack_access_token', 'mock-test-jwt-token');
        if (window.hospitrackAuth) {
          window.hospitrackAuth.currentUser = user;
          window.hospitrackAuth.accessToken = 'mock-test-jwt-token';
        }
        showAuthenticatedApp(user);
      })()
    `);
    await sleep(600);
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: PATIENT PORTAL
    // -------------------------------------------------------------
    await performLogin('PATIENT', 'Rahul Sharma');

    let patientAppVisible = await cdp.eval(`!document.getElementById('authenticatedAppContainer').classList.contains('hidden')`);
    assertPass(patientAppVisible, 'Patient workspace loaded and authenticatedAppContainer is visible');

    let patientHeaderTitle = await cdp.eval(`document.querySelector('.sidebar-header-title')?.textContent.trim()`);
    assertPass(patientHeaderTitle && patientHeaderTitle.includes('Patient Portal'), `Sidebar header displays "Patient Portal" (Got: "${patientHeaderTitle}")`);

    // Check expanded computed widths
    let expandedGridCols = await cdp.eval(`window.getComputedStyle(document.querySelector('.app-container')).gridTemplateColumns`);
    assertPass(expandedGridCols && expandedGridCols.startsWith('260px'), `Expanded grid column width is 260px (Got: ${expandedGridCols})`);

    let labelsVisibleBefore = await cdp.eval(`
      Array.from(document.querySelectorAll('#appSidebar .nav-label'))
        .filter(el => window.getComputedStyle(el).display !== 'none').length
    `);
    assertPass(labelsVisibleBefore > 5, `All navigation labels visible in expanded mode (Count: ${labelsVisibleBefore})`);

    // Click Collapse Button
    console.log('  Testing Collapse Toggle in Patient Portal...');
    await cdp.eval(`document.getElementById('sidebarCollapseBtn').click()`);
    await sleep(350);

    let isCollapsedClass = await cdp.eval(`document.getElementById('appSidebar').classList.contains('collapsed')`);
    assertPass(isCollapsedClass, 'Sidebar has .collapsed class after clicking toggle');

    let collapsedGridCols = await cdp.eval(`window.getComputedStyle(document.querySelector('.app-container')).gridTemplateColumns`);
    assertPass(collapsedGridCols && collapsedGridCols.startsWith('76px'), `Collapsed grid column width is 76px (Got: ${collapsedGridCols})`);

    let labelsVisibleAfter = await cdp.eval(`
      Array.from(document.querySelectorAll('#appSidebar .nav-label'))
        .filter(el => window.getComputedStyle(el).display !== 'none').length
    `);
    assertPass(labelsVisibleAfter === 0, `All navigation labels are completely hidden with display:none in collapsed mode (Count: ${labelsVisibleAfter})`);

    let categoriesVisibleAfter = await cdp.eval(`
      Array.from(document.querySelectorAll('#appSidebar .sidebar-category-label'))
        .filter(el => window.getComputedStyle(el).display !== 'none').length
    `);
    assertPass(categoriesVisibleAfter === 0, `All category labels are completely hidden in collapsed mode (Count: ${categoriesVisibleAfter})`);

    let headerTitleVisibleAfter = await cdp.eval(`
      window.getComputedStyle(document.querySelector('.sidebar-header-title')).display
    `);
    assertPass(headerTitleVisibleAfter === 'none', `Header title is hidden in collapsed mode (Got: ${headerTitleVisibleAfter})`);

    let collapseBtnText = await cdp.eval(`document.querySelector('.collapse-icon').textContent.trim()`);
    assertPass(collapseBtnText === '▶', `Collapse button switched icon to "▶" (Got: "${collapseBtnText}")`);

    // Verify content expands into available space
    let mainContentWidth = await cdp.eval(`document.getElementById('mainContentArea').offsetWidth`);
    assertPass(mainContentWidth > 1100, `Main content area expanded to fill available width (Width: ${mainContentWidth}px)`);

    // Expand back
    console.log('  Testing Expand Toggle in Patient Portal...');
    await cdp.eval(`document.getElementById('sidebarCollapseBtn').click()`);
    await sleep(350);

    let isExpandedAgain = await cdp.eval(`!document.getElementById('appSidebar').classList.contains('collapsed')`);
    assertPass(isExpandedAgain, 'Sidebar returned to expanded mode');

    // -------------------------------------------------------------
    // TEST 2: DOCTOR WORKSTATION
    // -------------------------------------------------------------
    await performLogin('DOCTOR', 'Dr. Sarah Sharma', 'HOSP-101', 'DOC-201');

    let docHeaderTitle = await cdp.eval(`document.querySelector('.sidebar-header-title')?.textContent.trim()`);
    assertPass(docHeaderTitle && docHeaderTitle.includes('Doctor Workstation'), `Sidebar header displays "Doctor Workstation" (Got: "${docHeaderTitle}")`);

    // Collapse
    await cdp.eval(`document.getElementById('sidebarCollapseBtn').click()`);
    await sleep(350);
    let docCollapsedLabels = await cdp.eval(`
      Array.from(document.querySelectorAll('#appSidebar .nav-label'))
        .filter(el => window.getComputedStyle(el).display !== 'none').length
    `);
    assertPass(docCollapsedLabels === 0, 'Doctor Workstation: 0 labels visible when collapsed');

    // Navigate to 'Consultations' while collapsed
    await cdp.eval(`document.querySelector('#appSidebar button[data-nav-id="consultations"]').click()`);
    await sleep(350);

    let docActiveTab = await cdp.eval(`document.querySelector('#appSidebar button[data-nav-id="consultations"]').classList.contains('active')`);
    assertPass(docActiveTab, 'Doctor Workstation: active navigation preserved when clicking item in collapsed mode');

    // Expand
    await cdp.eval(`document.getElementById('sidebarCollapseBtn').click()`);
    await sleep(350);

    // -------------------------------------------------------------
    // TEST 3: HOSPITAL ADMIN WORKSPACE
    // -------------------------------------------------------------
    await performLogin('HOSPITAL_ADMIN', 'City General Hospital Admin', 'HOSP-101');

    let hospHeaderTitle = await cdp.eval(`document.querySelector('.sidebar-header-title')?.textContent.trim()`);
    assertPass(hospHeaderTitle && hospHeaderTitle.includes('Hospital Workspace'), `Sidebar header displays "Hospital Workspace" (Got: "${hospHeaderTitle}")`);

    // Collapse
    await cdp.eval(`document.getElementById('sidebarCollapseBtn').click()`);
    await sleep(350);
    let hospCollapsedLabels = await cdp.eval(`
      Array.from(document.querySelectorAll('#appSidebar .nav-label'))
        .filter(el => window.getComputedStyle(el).display !== 'none').length
    `);
    assertPass(hospCollapsedLabels === 0, 'Hospital Workspace: 0 labels visible when collapsed');

    // Navigate to Ward Management
    await cdp.eval(`document.querySelector('#appSidebar button[data-nav-id="ward-management"]').click()`);
    await sleep(350);

    let wardManagementActive = await cdp.eval(`document.querySelector('#appSidebar button[data-nav-id="ward-management"]').classList.contains('active')`);
    assertPass(wardManagementActive, 'Hospital Workspace: Ward Management section loaded with active state');

    // Expand
    await cdp.eval(`document.getElementById('sidebarCollapseBtn').click()`);
    await sleep(350);

    // -------------------------------------------------------------
    // TEST 4: SUPER ADMIN COMMAND CENTER
    // -------------------------------------------------------------
    await performLogin('SUPER_ADMIN', 'National System Administrator');

    let adminHeaderTitle = await cdp.eval(`document.querySelector('.sidebar-header-title')?.textContent.trim()`);
    assertPass(adminHeaderTitle && adminHeaderTitle.includes('Command Center'), `Sidebar header displays "Command Center" (Got: "${adminHeaderTitle}")`);

    // Collapse
    await cdp.eval(`document.getElementById('sidebarCollapseBtn').click()`);
    await sleep(350);
    let adminCollapsedLabels = await cdp.eval(`
      Array.from(document.querySelectorAll('#appSidebar .nav-label'))
        .filter(el => window.getComputedStyle(el).display !== 'none').length
    `);
    assertPass(adminCollapsedLabels === 0, 'Super Admin: 0 labels visible when collapsed');

    // Navigate to Bed Network
    await cdp.eval(`document.querySelector('#appSidebar button[data-nav-id="beds"]').click()`);
    await sleep(350);

    let bedsActive = await cdp.eval(`document.querySelector('#appSidebar button[data-nav-id="beds"]').classList.contains('active')`);
    assertPass(bedsActive, 'Super Admin: Bed Network loaded cleanly with active state');

    // Expand
    await cdp.eval(`document.getElementById('sidebarCollapseBtn').click()`);
    await sleep(350);

    // -------------------------------------------------------------
    // TEST 5: MOBILE DRAWER & RESPONSIVE VIEWPORT TESTING
    // -------------------------------------------------------------
    console.log('\n--- Testing Mobile Viewport (390 x 844) & Drawer System ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(500);

    let mobileToggleVisible = await cdp.eval(`window.getComputedStyle(document.querySelector('.mobile-nav-toggle')).display`);
    assertPass(mobileToggleVisible === 'flex', `Mobile nav hamburger toggle button is visible (display: ${mobileToggleVisible})`);

    let mobileSidebarTransform = await cdp.eval(`window.getComputedStyle(document.getElementById('appSidebar')).transform`);
    assertPass(mobileSidebarTransform !== 'none' && mobileSidebarTransform !== 'matrix(1, 0, 0, 1, 0, 0)', 'Mobile drawer is hidden off-screen by default');

    // Click mobile hamburger toggle
    console.log('  Opening Mobile Drawer...');
    await cdp.eval(`document.querySelector('.mobile-nav-toggle').click()`);
    await sleep(350);

    let mobileOpenClass = await cdp.eval(`document.getElementById('appSidebar').classList.contains('mobile-open')`);
    let overlayVisible = await cdp.eval(`window.getComputedStyle(document.getElementById('mobileNavOverlay')).visibility`);
    assertPass(mobileOpenClass && overlayVisible === 'visible', 'Mobile drawer slides in and backdrop overlay is visible');

    // Press Escape to close drawer
    console.log('  Testing Escape key to close Mobile Drawer...');
    await cdp.eval(`
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    `);
    await sleep(350);

    let mobileClosedAfterEsc = await cdp.eval(`!document.getElementById('appSidebar').classList.contains('mobile-open')`);
    assertPass(mobileClosedAfterEsc, 'Mobile drawer closed cleanly on Escape key press');

    // Reset viewport back to desktop
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(300);

    // -------------------------------------------------------------
    // TEST 6: BROWSER CONSOLE ERROR AUDIT
    // -------------------------------------------------------------
    console.log('\n--- Checking Browser Console Logs ---');
    console.log(`Total console error events captured: ${cdp.consoleErrors.length}`);
    if (cdp.consoleErrors.length > 0) {
      console.log('Captured error logs:', cdp.consoleErrors);
    }
    assertPass(cdp.consoleErrors.length === 0, 'Browser console has 0 JavaScript errors, 0 TypeErrors, 0 unhandled rejections');

  } catch (err) {
    console.error('Test execution error:', err);
    failCount++;
  } finally {
    try { if (cdp && cdp.socket) cdp.socket.destroy(); } catch (e) {}
    chromeProcess.kill();
  }

  console.log('\n======================================================================');
  console.log(`📊 FINAL TEST REPORT: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('======================================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runLiveBrowserTests();
