/**
 * Hospitrack — Strictly Zero-Cost Deployment & Database URL Normalization Verification Test
 * Validates:
 * 1. Render Free tier (plan: free, no paid resources, no databases block)
 * 2. External Supabase PostgreSQL support (URL normalization, special character decoding, Hikari optimization)
 * 3. Rejection of unexpanded literal placeholders like "${DATABASE_URL}"
 * 4. Automatic extraction of DB_USERNAME / DB_PASSWORD without exposing secrets in JDBC URL
 * 5. 512MB RAM CGroup budget compliance (SerialGC, 256MB heap cap)
 * 6. Zero ephemeral disk dependencies (Base64/TEXT PostgreSQL storage)
 * 7. application-prod.yml configuration
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('='.repeat(70));
console.log('💰 HOSPITRACK: STRICTLY ZERO-COST DEPLOYMENT & DB VERIFICATION');
console.log('='.repeat(70));

// 1. Verify render.yaml enforces Free plan and has NO paid database resources
console.log('\n[1] Verifying render.yaml for Zero-Cost Enforcement...');
const renderYamlPath = path.join(__dirname, '..', 'render.yaml');
const renderYaml = fs.readFileSync(renderYamlPath, 'utf8');

assert(renderYaml.includes('plan: free'), 'render.yaml MUST specify plan: free');
assert(!renderYaml.includes('plan: starter'), 'render.yaml must NOT use paid starter plan');
assert(!renderYaml.includes('databases:'), 'render.yaml must NOT declare paid Render database resource');
assert(renderYaml.includes('dockerfilePath: ./Dockerfile'), 'Must point to root Dockerfile');
assert(renderYaml.includes('healthCheckPath: /health'), 'Must use /health probe');
assert(renderYaml.includes('DATABASE_URL'), 'Must declare external DATABASE_URL env var');
assert(renderYaml.includes('-XX:+UseSerialGC'), 'Must configure SerialGC in JAVA_OPTS');
console.log('  ✓ render.yaml is 100% free-tier compliant ($0/month, no paid resources)');

// 2. Verify Root Dockerfile Specifications
console.log('\n[2] Verifying Root Dockerfile Specifications...');
const dockerfilePath = path.join(__dirname, '..', 'Dockerfile');
const dockerfile = fs.readFileSync(dockerfilePath, 'utf8');

assert(dockerfile.includes('maven:3.9.6-eclipse-temurin-17'), 'Build stage must use Maven with Java 17');
assert(dockerfile.includes('node:20-bookworm-slim'), 'Runtime stage must use Node 20 base');
assert(dockerfile.includes('openjdk-17-jre-headless'), 'Must install Java 17 headless runtime');
assert(dockerfile.includes('ENV JAVA_OPTS='), 'Must set default low-memory JAVA_OPTS in image');
assert(dockerfile.includes('-XX:+UseSerialGC'), 'Default JAVA_OPTS must use SerialGC for 512MB limit');
assert(dockerfile.includes('CMD ["node", "server.js"]'), 'Must launch supervisor node server.js');
console.log('  ✓ Dockerfile combines Node.js 20 and Java 17 with 512MB memory tuning');

// 3. Verify Supabase PostgreSQL URL Normalization in server.js
console.log('\n[3] Testing Supabase PostgreSQL URL Normalization & Placeholder Rejection in server.js...');
const { normalizeDatabaseUrl, resolveDatabaseConfig } = require('../server.js');

// Test Case 3A: Supabase Connection Pooler URI with raw special characters in password
const supabasePoolerUri = 'postgresql://postgres.refid123:P@$$w0rd!#123@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require';
const res1 = normalizeDatabaseUrl(supabasePoolerUri);
assert.strictEqual(res1.valid, true, 'Must be valid');
assert.strictEqual(
  res1.jdbcUrl,
  'jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0',
  'Must transform Supabase pooler URI to clean jdbc:postgresql:// with sslmode and prepareThreshold=0'
);
assert.strictEqual(res1.username, 'postgres.refid123', 'Must extract pooler username');
assert.strictEqual(res1.password, 'P@$$w0rd!#123', 'Must extract password with special characters');
assert(!res1.jdbcUrl.includes('P@$$w0rd!#123'), 'Password must NOT be embedded in JDBC URL string');
console.log('  ✓ Supabase connection pooler URI successfully normalized with complex password');

// Test Case 3B: Supabase Direct Connection URI with URL-encoded characters
const supabaseDirectUri = 'postgres://postgres:DirectPass%21%40%23@db.myprojectref.supabase.co:5432/postgres';
const res2 = normalizeDatabaseUrl(supabaseDirectUri);
assert.strictEqual(res2.valid, true);
assert.strictEqual(
  res2.jdbcUrl,
  'jdbc:postgresql://db.myprojectref.supabase.co:5432/postgres?sslmode=require',
  'Must transform Supabase direct URI to jdbc:postgresql:// with sslmode=require'
);
assert.strictEqual(res2.username, 'postgres');
assert.strictEqual(res2.password, 'DirectPass!@#');
console.log('  ✓ Supabase direct connection URI successfully normalized with URL-decoded password');

// Test Case 3C: Standard JDBC URL pass-through
const standardJdbc = 'jdbc:postgresql://aws-0.pooler.supabase.com:6543/postgres?sslmode=require';
const res3 = normalizeDatabaseUrl(standardJdbc);
assert.strictEqual(res3.valid, true);
assert.strictEqual(res3.jdbcUrl, 'jdbc:postgresql://aws-0.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0');
console.log('  ✓ Standard JDBC URL correctly formatted and preserved');

// Test Case 3D: Rejection of literal unexpanded placeholders
const placeholder1 = normalizeDatabaseUrl('${DATABASE_URL}');
assert.strictEqual(placeholder1.valid, false, 'Literal ${DATABASE_URL} must be rejected');
assert.strictEqual(placeholder1.isPlaceholder, true);

const placeholder2 = normalizeDatabaseUrl('${SPRING_DATASOURCE_URL}');
assert.strictEqual(placeholder2.valid, false, 'Literal ${SPRING_DATASOURCE_URL} must be rejected');

const placeholder3 = normalizeDatabaseUrl('');
assert.strictEqual(placeholder3.valid, false, 'Empty URL must be rejected');
console.log('  ✓ Literal placeholders (${DATABASE_URL}) and empty strings strictly rejected');

// 4. Verify Memory Allocation & 512MB Budget in server.js
console.log('\n[4] Verifying 512MB Memory Protection in server.js...');
const serverJsContent = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
assert(serverJsContent.includes('-Xmx256m'), 'Must cap JVM max heap at 256MB');
assert(serverJsContent.includes('-XX:+UseSerialGC'), 'Must specify SerialGC to save GC memory overhead');
assert(serverJsContent.includes('-XX:MaxMetaspaceSize=112m'), 'Must constrain Metaspace to 112MB');
assert(serverJsContent.includes('-Xss512k'), 'Must reduce thread stack size to 512k');
console.log('  ✓ server.js enforces strict 256MB heap cap & SerialGC for 512MB container limit');

// 5. Verify Zero Disk Dependencies (PostgreSQL Base64/TEXT Storage)
console.log('\n[5] Verifying Zero Ephemeral Disk Dependencies...');
const patientEntity = fs.readFileSync(path.join(__dirname, '..', 'backend', 'src', 'main', 'java', 'com', 'hospitrack', 'entity', 'Patient.java'), 'utf8');
assert(patientEntity.includes('@Column(name = "photo_url", columnDefinition = "TEXT")'), 'Patient photos must be stored as TEXT in PostgreSQL');

const userEntity = fs.readFileSync(path.join(__dirname, '..', 'backend', 'src', 'main', 'java', 'com', 'hospitrack', 'entity', 'User.java'), 'utf8');
assert(userEntity.includes('@Column(name = "avatar_url", columnDefinition = "TEXT")'), 'User avatars must be stored as TEXT in PostgreSQL');

const labEntity = fs.readFileSync(path.join(__dirname, '..', 'backend', 'src', 'main', 'java', 'com', 'hospitrack', 'entity', 'LabReport.java'), 'utf8');
assert(labEntity.includes('columnDefinition = "TEXT"'), 'Lab reports results and summaries must be stored as TEXT in PostgreSQL');
console.log('  ✓ All patient photos, documents, and lab reports persist in PostgreSQL (no local disk needed)');

// 6. Verify Production Spring Profile (application-prod.yml)
console.log('\n[6] Verifying application-prod.yml Configuration...');
const prodYml = fs.readFileSync(path.join(__dirname, '..', 'backend', 'src', 'main', 'resources', 'application-prod.yml'), 'utf8');
assert(prodYml.includes('driver-class-name: org.postgresql.Driver'), 'Must use PostgreSQL driver');
assert(prodYml.includes('PostgreSQLDialect'), 'Must use PostgreSQL dialect');
assert(!prodYml.includes('h2'), 'Production must never use H2 database');
assert(prodYml.includes('maximum-pool-size: ${DB_POOL_MAX:5}'), 'Hikari pool must be optimized for Supabase Free tier (5 connections)');
assert(prodYml.includes('${SPRING_DATASOURCE_URL:${DATABASE_URL:${JDBC_DATABASE_URL:}}}'), 'Must support fallback variable resolution');
assert(prodYml.includes('${DB_USERNAME:${DATABASE_USERNAME:${SPRING_DATASOURCE_USERNAME:}}}'), 'Must support DB_USERNAME, DATABASE_USERNAME, and SPRING_DATASOURCE_USERNAME');
assert(prodYml.includes('${DB_PASSWORD:${DATABASE_PASSWORD:${SPRING_DATASOURCE_PASSWORD:}}}'), 'Must support DB_PASSWORD, DATABASE_PASSWORD, and SPRING_DATASOURCE_PASSWORD');
assert(prodYml.includes('${JWT_SECRET}'), 'Must read JWT_SECRET from environment');
console.log('  ✓ application-prod.yml strictly enforces PostgreSQL with comprehensive env variable resolution');

console.log('\n' + '='.repeat(70));
console.log('🎉 ALL 6 STRICTLY ZERO-COST DEPLOYMENT & DB CHECKS PASSED PERFECTLY!');
console.log('='.repeat(70));
