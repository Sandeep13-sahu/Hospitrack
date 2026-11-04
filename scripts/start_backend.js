/**
 * Hospitrack — Node.js Backend Launcher
 * Safely parses .env (preserving special characters in Supabase passwords)
 * and starts the Spring Boot backend with proper database parameters.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(PROJECT_ROOT, '.env');

// 1. Load .env file safely without mangling special characters
if (fs.existsSync(ENV_PATH)) {
  try {
    const lines = fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        const key = line.slice(0, eqIdx).trim();
        let val = line.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  } catch (e) {
    console.warn('[Launcher] Warning: Could not read .env:', e.message);
  }
}

// 2. Discover Database URL
const candidateKeys = [
  'DATABASE_URL',
  'SPRING_DATASOURCE_URL',
  'SUPABASE_DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRESQL_URL',
  'JDBC_DATABASE_URL'
];

let rawDbUrl = '';
for (const key of candidateKeys) {
  const v = process.env[key];
  if (v && typeof v === 'string' && v.trim() && !v.trim().startsWith('${') && !v.trim().startsWith('$')) {
    rawDbUrl = v.trim();
    break;
  }
}

const isSupabase = rawDbUrl.toLowerCase().includes('supabase');
const isPostgres = isSupabase || rawDbUrl.toLowerCase().startsWith('postgres') || rawDbUrl.toLowerCase().startsWith('jdbc:postgresql:');

console.log('='.repeat(70));
console.log('  HOSPITRACK — SPRING BOOT BACKEND LAUNCHER');
console.log('='.repeat(70));
if (isPostgres) {
  console.log('  [Database Target] PostgreSQL / Supabase Detected');
} else {
  console.log('  [Database Target] In-Memory H2 (PostgreSQL Mode)');
}

const backendDir = path.join(PROJECT_ROOT, 'backend');
const jarPath = path.join(backendDir, 'target', 'hospitrack-backend-1.0.0.jar');
const port = process.env.PORT || '8080';
const profile = process.env.SPRING_PROFILES_ACTIVE || (isPostgres ? 'prod' : 'dev');

const javaArgs = [
  `-Dserver.port=${port}`,
  `-Dserver.address=${process.env.SERVER_ADDRESS || '127.0.0.1'}`,
  `-Dspring.profiles.active=${profile}`,
  `-Dfile.encoding=UTF-8`
];

// If database URL is provided, inject it cleanly
if (rawDbUrl) {
  // Defensively strip template brackets if copied from documentation e.g. :[password]@ or :[username]:
  rawDbUrl = rawDbUrl.replace(/:\[([^\]]+)\]@/, ':$1@');
  rawDbUrl = rawDbUrl.replace(/:\/\/\[([^\]]+)\]:/, '://$1:');
  javaArgs.push(`-Dspring.datasource.url=${rawDbUrl}`);
  javaArgs.push(`-DDATABASE_URL=${rawDbUrl}`);
}
if (process.env.DATABASE_USERNAME || process.env.DB_USERNAME) {
  const user = process.env.DATABASE_USERNAME || process.env.DB_USERNAME;
  javaArgs.push(`-Dspring.datasource.username=${user}`);
}
if (process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD) {
  const pass = process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD;
  javaArgs.push(`-Dspring.datasource.password=${pass}`);
}

let child;
if (fs.existsSync(jarPath)) {
  console.log(`  [Runtime] Executing Packaged JAR: ${jarPath}`);
  console.log('='.repeat(70));
  child = spawn('java', ['-jar', jarPath, ...javaArgs], {
    cwd: backendDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: port,
      SERVER_PORT: port,
      SPRING_PROFILES_ACTIVE: profile
    }
  });
} else {
  console.log(`  [Runtime] Executing Maven Wrapper in ${backendDir}...`);
  console.log('='.repeat(70));
  const mvnCmd = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';
  child = spawn(mvnCmd, ['spring-boot:run'], {
    cwd: backendDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: port,
      SERVER_PORT: port,
      SPRING_PROFILES_ACTIVE: profile
    }
  });
}

child.on('error', (err) => {
  console.error('[Launcher] Fatal process error:', err);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (code !== null) process.exit(code);
  if (signal) process.kill(process.pid, signal);
});

