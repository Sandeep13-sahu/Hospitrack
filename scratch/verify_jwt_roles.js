const http = require("http");

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }
    }, res => {
      let b = "";
      res.on("data", c => b += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
        catch(e) { resolve({ status: res.statusCode, raw: b }); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function decodeJwt(token) {
  const parts = token.split(".");
  const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
  const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
  return { header, payload };
}

async function testRoles() {
  const users = [
    { role: "PATIENT", id: "john.doe@email.com", pass: "Patient@123!" },
    { role: "DOCTOR", id: "s.sharma@citygeneral.in", pass: "Doctor@123!" },
    { role: "HOSPITAL_ADMIN", id: "admin@citygeneral.in", pass: "Hospital@123!" },
    { role: "SUPER_ADMIN", id: "admin@hospitrack.com", pass: "Admin@Hospitrack2026!" }
  ];

  console.log("=== REAL JWT LOGIN VERIFICATION ===");
  for (const u of users) {
    const res = await post("http://localhost:8000/api/auth/login", { identifier: u.id, password: u.pass });
    if (res.status === 200 && res.body.data && res.body.data.accessToken) {
      const decoded = decodeJwt(res.body.data.accessToken);
      console.log(`\nRole: ${u.role}`);
      console.log(`  Email/ID: ${u.id}`);
      console.log(`  HTTP Status: ${res.status}`);
      console.log(`  JWT Header: alg=${decoded.header.alg}, typ=${decoded.header.typ}`);
      console.log(`  JWT Subject (sub): ${decoded.payload.sub}`);
      console.log(`  JWT Role Claim: ${decoded.payload.role}`);
      console.log(`  JWT Expiration: ${new Date(decoded.payload.exp * 1000).toISOString()}`);
      console.log(`  Returned User Profile: id=${res.body.data.user.id}, role=${res.body.data.user.role}, name=${res.body.data.user.name}`);
    } else {
      console.error(`FAILED for ${u.role}:`, res);
    }
  }

  console.log("\n=== INVALID CREDENTIALS REJECTION ===");
  const badRes = await post("http://localhost:8000/api/auth/login", { identifier: "john.doe@email.com", password: "BadPassword!" });
  console.log(`  HTTP Status: ${badRes.status}`);
  console.log(`  Response:`, JSON.stringify(badRes.body));
}

testRoles();

