const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password });

  if (res.statusCode !== 200) {
    throw new Error(`Login failed for ${email}: ${res.statusCode} ${JSON.stringify(res.data)}`);
  }
  const token = res.data?.data?.accessToken || res.data?.accessToken;
  if (!token) throw new Error(`No token returned for ${email}: ${JSON.stringify(res.data)}`);
  return token;
}

async function runVerification() {
  console.log('================================================================');
  console.log('HOSPITRACK — END-TO-END CLINICAL INTAKE & TELEMETRY VERIFICATION');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`[PASS] Test ${totalTests}: ${testName}`);
      if (details) console.log(`       -> ${details}`);
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName}`);
      if (details) console.error(`       -> ${details}`);
      process.exitCode = 1;
    }
  }

  // TEST 1: Login as City General Hospital Admin
  console.log('--- Step 1: Hospital Admin Authentication (HOSP-101) ---');
  const adminToken = await login('admin@citygeneral.in', 'Hospital@123!');
  assert(Boolean(adminToken), 'Hospital Admin authenticated successfully', 'admin@citygeneral.in (HOSP-101)');

  // TEST 2: Admit Patient with Intake Triage Telemetry
  console.log('\n--- Step 2: Patient Admission with Non-Default Triage Vitals ---');
  const admitPayload = {
    name: 'Aarav Patel',
    age: 36,
    gender: 'Male',
    bloodGroup: 'B+',
    contact: '+91 98765 12345',
    email: `aarav.patel.${Date.now()}@example.com`,
    address: 'Flat 502, Orchid Towers, Delhi',
    emergencyContact: '+91 98765 99999 (Meera Patel - Spouse)',
    emergencyContactName: 'Meera Patel',
    emergencyContactPhone: '+91 98765 99999',
    emergencyContactRelation: 'Spouse',
    assignedDoctorId: 'DOC-201',
    primaryDoctorId: 'DOC-201',
    password: 'Patient@123!',
    bloodPressureSystolic: 138,
    bloodPressureDiastolic: 88,
    bloodPressure: '138/88',
    heartRate: 82,
    oxygenSaturation: 97,
    bodyTemperature: 99.1,
    rhythmNotes: 'Resting sinus rhythm with trace palpitations',
    intakeSource: 'HOSPITAL_ADMISSION'
  };

  const admitRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/patients/admit',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, admitPayload);

  assert(admitRes.statusCode === 201 || admitRes.statusCode === 200, 'Patient admission HTTP status OK', `HTTP ${admitRes.statusCode}`);
  const admittedPatient = admitRes.data?.data;
  assert(Boolean(admittedPatient?.id), 'Patient ID generated', `ID: ${admittedPatient?.id}`);
  assert(admittedPatient?.assignedDoctorId === 'DOC-201', 'Assigned Doctor correctly mapped to DOC-201', `Assigned: ${admittedPatient?.assignedDoctorId}`);
  assert(admittedPatient?.bloodPressureSystolic === 138, 'Systolic Blood Pressure stored on patient entity', `BP Sys: ${admittedPatient?.bloodPressureSystolic} mmHg`);
  assert(admittedPatient?.bloodPressureDiastolic === 88, 'Diastolic Blood Pressure stored on patient entity', `BP Dia: ${admittedPatient?.bloodPressureDiastolic} mmHg`);
  assert(admittedPatient?.heartRate === 82, 'Heart Rate stored on patient entity', `HR: ${admittedPatient?.heartRate} bpm`);
  assert(admittedPatient?.oxygenSaturation === 97, 'Oxygen Saturation stored on patient entity', `SpO2: ${admittedPatient?.oxygenSaturation}%`);
  assert(admittedPatient?.bodyTemperature === 99.1, 'Body Temperature stored on patient entity', `Temp: ${admittedPatient?.bodyTemperature}°F`);
  assert(admittedPatient?.rhythmNotes === 'Resting sinus rhythm with trace palpitations', 'Rhythm notes stored', `Notes: ${admittedPatient?.rhythmNotes}`);

  // TEST 3: Verify Triage Vitals Audit Trail endpoint
  console.log('\n--- Step 3: Triage Vitals Immutable Audit Trail Check ---');
  const vitalsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/patients/${admittedPatient.id}/triage-vitals`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  assert(vitalsRes.statusCode === 200, 'GET /api/patients/{id}/triage-vitals HTTP status OK', `HTTP ${vitalsRes.statusCode}`);
  const vitalsList = vitalsRes.data?.data;
  assert(Array.isArray(vitalsList) && vitalsList.length > 0, 'Triage vitals audit records found in triage_vitals table', `Count: ${vitalsList?.length}`);
  const latestVitals = vitalsList[0];
  assert(latestVitals?.bloodPressureSystolic === 138 && latestVitals?.heartRate === 82, 'Audit trail record matches intake measurements', `Sys: ${latestVitals?.bloodPressureSystolic}, HR: ${latestVitals?.heartRate}`);

  // TEST 4: Doctor Login & Rounds Workspace View
  console.log('\n--- Step 4: Attending Doctor Rounds Telemetry View ---');
  const doctorToken = await login('s.sharma@citygeneral.in', 'Doctor@123!');
  assert(Boolean(doctorToken), 'Doctor authenticated successfully', 'Dr. Sarah Sharma (DOC-201)');

  const docPatientsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/doctors/me/patients',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${doctorToken}`
    }
  });

  assert(docPatientsRes.statusCode === 200, 'Doctor retrieved assigned clinical queue', `HTTP ${docPatientsRes.statusCode}`);
  const assignedList = docPatientsRes.data?.data || [];
  const foundInRounds = assignedList.find(p => p.id === admittedPatient.id);
  assert(Boolean(foundInRounds), 'Admitted patient appears in attending doctor rounds queue', `Found patient ${foundInRounds?.name} (${foundInRounds?.id})`);
  assert(foundInRounds?.bloodPressureSystolic === 138, 'Doctor view displays exact intake systolic BP (138 mmHg)', `BP: ${foundInRounds?.bloodPressureSystolic}/${foundInRounds?.bloodPressureDiastolic}`);
  assert(foundInRounds?.heartRate === 82, 'Doctor view displays exact intake heart rate (82 bpm)', `HR: ${foundInRounds?.heartRate}`);
  assert(foundInRounds?.oxygenSaturation === 97, 'Doctor view displays exact intake SpO2 (97%)', `SpO2: ${foundInRounds?.oxygenSaturation}%`);
  assert(foundInRounds?.bodyTemperature === 99.1, 'Doctor view displays exact intake temperature (99.1°F)', `Temp: ${foundInRounds?.bodyTemperature}°F`);

  // TEST 5: Doctor Prescribes Inpatient Medication
  console.log('\n--- Step 5: Inpatient Medication Prescription Workflow ---');
  const prescriptionPayload = {
    patientId: admittedPatient.id,
    medicines: [
      {
        name: 'Metoprolol Succinate',
        dosage: '25mg',
        form: 'Tablet',
        frequency: 'Twice Daily [BD]',
        route: 'Oral',
        timing: 'After Meals',
        duration: '7 days',
        instructions: 'Take 1 tablet every 12 hours with meals.'
      }
    ],
    instructions: 'Monitor heart rate and telemetry daily.',
    overrideConfirmed: false
  };

  const rxRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/prescriptions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${doctorToken}`
    }
  }, prescriptionPayload);

  assert(rxRes.statusCode === 201 || rxRes.statusCode === 200, 'Doctor prescribed inpatient medication without synthetic defaults', `HTTP ${rxRes.statusCode}`);
  const createdRx = rxRes.data?.data;
  assert(Boolean(createdRx?.id), 'Prescription persisted with unique ID', `Rx ID: ${createdRx?.id}`);
  assert(createdRx?.items?.[0]?.name === 'Metoprolol Succinate' && createdRx?.items?.[0]?.dosage === '25mg', 'Prescribed item contains specified drug and dosage', `${createdRx?.items?.[0]?.name} ${createdRx?.items?.[0]?.dosage}`);

  // TEST 6: Multi-Tenant Hospital Isolation
  console.log('\n--- Step 6: Multi-Tenant Data Isolation Check ---');
  const apexAdminToken = await login('operations@apexcare.in', 'Hospital@123!');
  assert(Boolean(apexAdminToken), 'Apex Care Hospital Admin authenticated', 'operations@apexcare.in (HOSP-102)');

  const apexPatientsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/patients',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apexAdminToken}`
    }
  });

  const apexPatients = apexPatientsRes.data?.data || [];
  const leakedInApex = apexPatients.find(p => p.id === admittedPatient.id);
  assert(!leakedInApex, 'City General patient is completely isolated from Apex Care patient queue', `Patient ${admittedPatient.id} NOT in Apex Care list`);

  const apexDirectAccessRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/patients/${admittedPatient.id}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apexAdminToken}`
    }
  });
  assert(apexDirectAccessRes.statusCode === 403, 'Cross-hospital direct patient access returns 403 Forbidden', `HTTP ${apexDirectAccessRes.statusCode}`);

  // TEST 7: Unmeasured Vitals Display Neutral State
  console.log('\n--- Step 7: Unmeasured Telemetry Neutral State Check ---');
  const unmeasuredPatientPayload = {
    name: 'Neha Gupta',
    age: 29,
    gender: 'Female',
    bloodGroup: 'O+',
    contact: '+91 98765 77777',
    email: `neha.gupta.${Date.now()}@example.com`,
    address: 'Sector 15, Noida',
    emergencyContact: '+91 98765 88888 (Deepak Gupta - Father)',
    emergencyContactName: 'Deepak Gupta',
    emergencyContactPhone: '+91 98765 88888',
    emergencyContactRelation: 'Father',
    assignedDoctorId: 'DOC-201',
    primaryDoctorId: 'DOC-201',
    password: 'Patient@123!'
    // No vitals passed: should be null / unmeasured
  };

  const unmeasuredRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/patients/admit',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, unmeasuredPatientPayload);

  assert(unmeasuredRes.statusCode === 201 || unmeasuredRes.statusCode === 200, 'Admitted unmeasured patient successfully', `HTTP ${unmeasuredRes.statusCode}`);
  const unmeasuredPatient = unmeasuredRes.data?.data;
  assert(unmeasuredPatient?.bloodPressureSystolic == null, 'Systolic BP is null when unmeasured (no fake 120)', `Value: ${unmeasuredPatient?.bloodPressureSystolic}`);
  assert(unmeasuredPatient?.heartRate == null, 'Heart rate is null when unmeasured (no fake 74)', `Value: ${unmeasuredPatient?.heartRate}`);
  assert(unmeasuredPatient?.oxygenSaturation == null, 'SpO2 is null when unmeasured (no fake 99)', `Value: ${unmeasuredPatient?.oxygenSaturation}`);
  assert(unmeasuredPatient?.bodyTemperature == null, 'Temperature is null when unmeasured (no fake 98.6)', `Value: ${unmeasuredPatient?.bodyTemperature}`);

  console.log('\n================================================================');
  console.log(`VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('================================================================');

  if (passedTests === totalTests) {
    console.log('ALL CLINICAL INTAKE, TELEMETRY, ROUNDS, AND MULTI-TENANCY TESTS PASSED WITH 100% SUCCESS.');
    process.exit(0);
  } else {
    console.error('SOME TESTS FAILED.');
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
