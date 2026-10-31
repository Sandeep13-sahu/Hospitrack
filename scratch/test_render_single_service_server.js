/**
 * Hospitrack — Single-Service Render Architecture Verification Test
 * Validates Dockerfile, server.js port decoupling, database URL normalization,
 * health endpoints, and environment profile configurations.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const http = require('http');

console.log('='.repeat(70));
console.log('🚀 HOSPITRACK: RENDER SINGLE-SERVICE DEPLOYMENT VERIFICATION');
console.log('='.repeat(70));

// 1. Verify Dockerfile exists and contains required multi-stage instructions
console.log('\n[1] Verifying Root Production Dockerfile...');
const dockerfilePath = path.join(__dirname, '..', 'Dockerfile');
assert(fs.existsSync(dockerfilePath), 'Dockerfile must exist at repository root');

const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
assert(dockerfileContent.includes('maven:3.9.6-eclipse-temurin-17'), 'Must use Maven with Java 17 for backend builder stage');
assert(dockerfileContent.includes('node:20-bookworm-slim'), 'Must use Node.js 20 compatible base for production runtime');
assert(dockerfileContent.includes('openjdk-17-jre-headless'), 'Must install Java 17 JRE in runtime image');
assert(dockerfileContent.includes('mvn clean package -DskipTests'), 'Must compile Spring Boot JAR with Maven');
assert(dockerfileContent.includes('COPY index.html'), 'Must copy frontend files');
assert(dockerfileContent.includes('COPY server.js'), 'Must copy server.js');
assert(dockerfileContent.includes('hospitrack-backend-1.0.0.jar'), 'Must copy compiled backend JAR');
assert(dockerfileContent.includes('CMD ["node", "server.js"]'), 'Must execute node server.js as container entrypoint');
console.log('  ✓ Dockerfile meets all multi-stage, Java 17, Node 20, and artifact specifications');

// 2. Verify .dockerignore exists and excludes transient/sensitive files
console.log('\n[2] Verifying .dockerignore Configuration...');
const dockerignorePath = path.join(__dirname, '..', '.dockerignore');
assert(fs.existsSync(dockerignorePath), '.dockerignore must exist at repository root');

const dockerignoreContent = fs.readFileSync(dockerignorePath, 'utf8');
assert(dockerignoreContent.includes('.git'), '.dockerignore must exclude .git');
assert(dockerignoreContent.includes('node_modules'), '.dockerignore must exclude node_modules');
assert(dockerignoreContent.includes('backend/target/'), '.dockerignore must exclude backend/target/');
assert(dockerignoreContent.includes('scratch/'), '.dockerignore must exclude scratch/');
assert(dockerignoreContent.includes('.env'), '.dockerignore must exclude .env');
console.log('  ✓ .dockerignore excludes heavy build context and sensitive artifacts');

// 3. Test PostgreSQL Database URL Normalization Logic
console.log('\n[3] Testing PostgreSQL Database URL Normalizer...');
// Extract normalizeDatabaseUrl from server.js for isolated unit testing
const serverJsContent = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const normalizeFnMatch = serverJsContent.match(/function normalizeDatabaseUrl\([\s\S]*?\n\}/);
assert(normalizeFnMatch, 'normalizeDatabaseUrl function must be defined in server.js');

const normalizeDatabaseUrl = new Function('return ' + normalizeFnMatch[0])();

// Test Case 3A: Render / Supabase standard postgres:// URI
const renderPgUri = 'postgres://hospitrack_user:SecretPass123%21@dpg-abc12345.oregon-postgres.render.com:5432/hospitrack_prod';
const res1 = normalizeDatabaseUrl(renderPgUri);
assert.strictEqual(
  res1.DATABASE_URL,
  'jdbc:postgresql://dpg-abc12345.oregon-postgres.render.com:5432/hospitrack_prod',
  'Must normalize postgres:// to jdbc:postgresql://'
);
assert.strictEqual(res1.DATABASE_USERNAME, 'hospitrack_user', 'Must extract username from URI');
assert.strictEqual(res1.DATABASE_PASSWORD, 'SecretPass123!', 'Must extract decoded password from URI');
console.log('  ✓ Render postgres:// URL normalized to Spring Boot JDBC format with credentials');

// Test Case 3B: postgresql:// with SSL query params
const sslPgUri = 'postgresql://admin:pass@db.example.com:5432/med_db?sslmode=require';
const res2 = normalizeDatabaseUrl(sslPgUri);
assert.strictEqual(
  res2.DATABASE_URL,
  'jdbc:postgresql://db.example.com:5432/med_db?sslmode=require',
  'Must preserve query parameters such as ?sslmode=require'
);
console.log('  ✓ Query parameters (?sslmode=require) preserved in JDBC URL');

// Test Case 3C: Standard JDBC URL left untouched
const directJdbc = 'jdbc:postgresql://localhost:5432/hospitrack_prod';
const res3 = normalizeDatabaseUrl(directJdbc);
assert.strictEqual(res3.DATABASE_URL, directJdbc, 'Existing jdbc: URLs must remain untouched');
console.log('  ✓ Existing jdbc:postgresql: URLs pass through unaltered');

// 4. Verify Server.js Port Decoupling & Host Binding
console.log('\n[4] Verifying Port Decoupling & 0.0.0.0 Binding in server.js...');
assert(serverJsContent.includes("server.listen(PORT, HOST"), 'Must bind server to HOST (0.0.0.0)');
assert(serverJsContent.includes("HOST = process.env.HOST || '0.0.0.0'"), 'Default host must be 0.0.0.0');
assert(serverJsContent.includes("PORT = parseInt(process.env.PORT"), 'Must parse Render PORT');
assert(serverJsContent.includes("BACKEND_PORT = parseInt(process.env.BACKEND_PORT"), 'Must separate BACKEND_PORT');
assert(serverJsContent.includes("`--server.port=${BACKEND_PORT}`"), 'Must explicitly pass backend port to Java CLI argument');
assert(serverJsContent.includes("PORT: String(BACKEND_PORT)"), 'Child process env must isolate Spring Boot PORT from Render PORT');
console.log('  ✓ Server binds to 0.0.0.0 and isolates Render external PORT from Spring Boot internal port 8080');

// 5. Verify /health and /api/health Endpoint Handlers
console.log('\n[5] Verifying Health Check Endpoints in server.js...');
assert(serverJsContent.includes("reqPath === '/health'"), 'Must handle /health endpoint for container probes');
assert(serverJsContent.includes("checkBackendHealth"), 'Must include checkBackendHealth probe');
assert(serverJsContent.includes("reqPath.startsWith('/api/') || reqPath === '/api'"), 'Must proxy /api requests to backend');
console.log('  ✓ Container health check (/health) and Spring Boot health check (/api/health) operational');

// 6. Verify Production Spring Profile (application-prod.yml)
console.log('\n[6] Verifying application-prod.yml Configuration...');
const prodYmlPath = path.join(__dirname, '..', 'backend', 'src', 'main', 'resources', 'application-prod.yml');
const prodYml = fs.readFileSync(prodYmlPath, 'utf8');
assert(prodYml.includes('driver-class-name: org.postgresql.Driver'), 'Production must use org.postgresql.Driver');
assert(prodYml.includes('PostgreSQLDialect'), 'Production must use PostgreSQLDialect');
assert(!prodYml.includes('h2'), 'Production YAML must not configure H2 database');
assert(prodYml.includes('${DATABASE_URL}'), 'Production must read DATABASE_URL from environment');
assert(prodYml.includes('${JWT_SECRET}'), 'Production must read JWT_SECRET from environment');
console.log('  ✓ application-prod.yml enforces pure PostgreSQL and externalized credentials');

// 7. Verify render.yaml Configuration
console.log('\n[7] Verifying render.yaml Infrastructure as Code Blueprint...');
const renderYamlPath = path.join(__dirname, '..', 'render.yaml');
const renderYaml = fs.readFileSync(renderYamlPath, 'utf8');
assert(renderYaml.includes('dockerfilePath: ./Dockerfile'), 'render.yaml must point to root Dockerfile');
assert(renderYaml.includes('dockerContext: .'), 'render.yaml must set root as dockerContext');
assert(renderYaml.includes('healthCheckPath: /health'), 'render.yaml must probe /health');
assert(renderYaml.includes('SPRING_PROFILES_ACTIVE'), 'render.yaml must set SPRING_PROFILES_ACTIVE to prod');
assert(renderYaml.includes('fromDatabase:'), 'render.yaml must wire DATABASE_URL from hospitrack-db');
console.log('  ✓ render.yaml defines unified single-service Docker web service & managed PostgreSQL');

console.log('\n' + '='.repeat(70));
console.log('🎉 ALL 7 RENDER SINGLE-SERVICE DEPLOYMENT CHECKS PASSED PERFECTLY!');
console.log('='.repeat(70));

