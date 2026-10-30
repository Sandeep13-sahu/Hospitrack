const http = require('http');
const assert = require('assert');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (_) {}
        resolve({ statusCode: res.statusCode, headers: res.headers, body, json });
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runLiveVerification() {
  console.log('======================================================================');
  console.log('  HOSPITRACK — LIVE CDS DRUG SAFETY & EVS TURNOVER VERIFICATION');
  console.log('======================================================================\n');

  // 1. Doctor Login
  console.log('[1/6] Authenticating Doctor Dr. Sarah Sharma (DOC-201)...');
  const docLogin = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    identifier: 's.sharma@citygeneral.in',
    password: 'Doctor@123!'
  });
  assert.strictEqual(docLogin.statusCode, 200);
  const docToken = docLogin.json.data.accessToken;
  console.log('  ✓ Doctor authenticated with JWT Bearer Token\n');

  // 2. Test CDS Safety-Check Endpoint
  console.log('[2/6] Calling POST /api/prescriptions/safety-check for lethal DDI...');
  const safetyCheckRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/prescriptions/safety-check',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${docToken}`
    }
  }, {
    patientId: 'PAT-300',
    medicines: [
      { name: 'Sildenafil', dosage: '50mg', frequency: 'PRN' },
      { name: 'Nitroglycerin', dosage: '0.4mg', frequency: 'PRN' }
    ]
  });
  assert.strictEqual(safetyCheckRes.statusCode, 200);
  assert.strictEqual(safetyCheckRes.json.data.safe, false);
  assert.strictEqual(safetyCheckRes.json.data.hasContraindication, true);
  console.log(`  ✓ Safety Check flagged ${safetyCheckRes.json.data.alerts.length} alert(s) with hasContraindication=true\n`);

  // 3. Test Hard Safety Block on Contraindicated Prescription Submission
  console.log('[3/6] Attempting to sign contraindicated prescription order...');
  const blockedRxRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/prescriptions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${docToken}`
    }
  }, {
    patientId: 'PAT-300',
    medicines: [
      { name: 'Sildenafil', dosage: '50mg', frequency: 'PRN' },
      { name: 'Nitroglycerin', dosage: '0.4mg', frequency: 'PRN' }
    ],
    instructions: 'Test order',
    overrideConfirmed: false
  });
  assert.strictEqual(blockedRxRes.statusCode, 422, 'Must block contraindicated order with 422 Unprocessable Entity');
  console.log(`  ✓ Blocked with HTTP 422: "${blockedRxRes.json.message}"\n`);

  // 4. Test Major Alert requiring Override & Success with Documented Override
  console.log('[4/6] Signing high-risk order (Warfarin + Aspirin) with clinical override rationale...');
  const overrideRxRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/prescriptions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${docToken}`
    }
  }, {
    patientId: 'PAT-300',
    medicines: [
      { name: 'Warfarin', dosage: '5mg', frequency: '1× daily' },
      { name: 'Aspirin', dosage: '81mg', frequency: '1× daily' }
    ],
    instructions: 'Co-prescribed post-coronary stent with pantoprazole gastroprotection',
    clinicalOverrideReason: 'Cardiology post-PCI stent indicated. Bi-weekly INR telemetry monitoring in place.',
    overrideConfirmed: true
  });
  assert.strictEqual(overrideRxRes.statusCode, 200, 'Must accept high-risk order when valid override is provided');
  assert.strictEqual(overrideRxRes.json.success, true);
  console.log(`  ✓ High-risk order accepted with documented clinical override audit trail\n`);

  // 5. Authenticate Hospital Admin for EVS Workflow
  console.log('[5/6] Authenticating Hospital Admin (admin@citygeneral.in)...');
  const hospLogin = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    identifier: 'admin@citygeneral.in',
    password: 'Hospital@123!'
  });
  assert.strictEqual(hospLogin.statusCode, 200);
  const hospToken = hospLogin.json.data.accessToken;

  // 6. Test 3-Stage EVS Bed Turnover Workflow
  console.log('[6/6] Executing EVS Bed Turnover Workflow (Dispatch -> Clean -> Certify)...');
  
  // Step 0: Fetch active beds for HOSP-101
  const bedsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/hospital/beds',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${hospToken}` }
  });
  assert.strictEqual(bedsRes.statusCode, 200);
  assert(Array.isArray(bedsRes.json.data) && bedsRes.json.data.length > 0, 'Hospital must have initialized beds');
  const targetBed = bedsRes.json.data[0];
  const targetBedId = targetBed.id;
  console.log(`  ✓ Selected Target Bed: ${targetBed.bedNumber} (${targetBedId})`);

  // Step A: Dispatch Housekeeping
  const dispatchRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/beds/${targetBedId}/evs-dispatch`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hospToken}`
    }
  }, {
    staffName: 'Deepak Verma',
    protocol: 'Terminal Disinfection & UV-C Sterilization',
    notes: 'Post-discharge complete room sanitization'
  });
  assert.strictEqual(dispatchRes.statusCode, 200);
  assert.strictEqual(dispatchRes.json.data.status, 'CLEANING_IN_PROGRESS');
  console.log('  ✓ Step A: EVS Housekeeper dispatched -> Bed status: CLEANING_IN_PROGRESS');

  // Step B: Complete Cleaning
  const completeRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/beds/${targetBedId}/evs-complete`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hospToken}`
    }
  });
  assert.strictEqual(completeRes.statusCode, 200);
  assert.strictEqual(completeRes.json.data.status, 'READY_FOR_INSPECTION');
  console.log(`  ✓ Step B: Sanitization completed -> Turnaround: ${completeRes.json.data.evsTurnaroundMinutes} mins, Status: READY_FOR_INSPECTION`);

  // Step C: Charge Nurse / Supervisor Inspection & Release
  const inspectRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/beds/${targetBedId}/evs-inspect`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hospToken}`
    }
  }, {
    supervisorName: 'Head Nurse Sunita',
    passed: true,
    inspectionNotes: 'ATP bioluminescence swab test passed (<10 RLU). Bed certified sterile.'
  });
  assert.strictEqual(inspectRes.statusCode, 200);
  assert.strictEqual(inspectRes.json.data.status, 'AVAILABLE');
  assert.strictEqual(inspectRes.json.data.status, 'AVAILABLE');
  console.log('  ✓ Step C: Clinical Inspection passed -> Bed status: AVAILABLE for immediate admission');

  // Step D: EVS Turnover KPI Summary
  const summaryRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/hospital/evs-summary',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${hospToken}`
    }
  });
  assert.strictEqual(summaryRes.statusCode, 200);
  console.log(`  ✓ Step D: EVS Metrics -> Total Queue: ${summaryRes.json.data.totalTurnoverQueue}, Avg TAT: ${summaryRes.json.data.averageTurnaroundMinutes} mins\n`);

  console.log('======================================================================');
  console.log('  ALL LIVE CLINICAL CDS & EVS ENDPOINTS VERIFIED WITH 100% SUCCESS!');
  console.log('======================================================================\n');
}

runLiveVerification().catch(err => {
  console.error('Live Verification failed:', err);
  process.exit(1);
});
