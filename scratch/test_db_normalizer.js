const assert = require('assert');

function normalizeDatabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return { valid: false };
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.startsWith('${') || trimmed.startsWith('$')) {
    return { valid: false, isPlaceholder: true, raw: trimmed };
  }

  let username = '';
  let password = '';
  let host = '';
  let port = '5432';
  let dbName = 'postgres';
  const queryParams = new Map();

  if (trimmed.toLowerCase().startsWith('jdbc:postgresql:')) {
    let remainder = trimmed.slice('jdbc:postgresql:'.length);
    if (remainder.startsWith('//')) {
      remainder = remainder.slice(2);
    }
    const qIdx = remainder.indexOf('?');
    let queryStr = '';
    if (qIdx !== -1) {
      queryStr = remainder.slice(qIdx + 1);
      remainder = remainder.slice(0, qIdx);
    }
    if (queryStr) {
      for (const part of queryStr.split('&')) {
        const eq = part.indexOf('=');
        if (eq !== -1) {
          queryParams.set(part.slice(0, eq), part.slice(eq + 1));
        } else if (part) {
          queryParams.set(part, '');
        }
      }
    }
    const slashIdx = remainder.indexOf('/');
    if (slashIdx !== -1) {
      dbName = remainder.slice(slashIdx + 1) || 'postgres';
      remainder = remainder.slice(0, slashIdx);
    }
    const atIdx = remainder.lastIndexOf('@');
    if (atIdx !== -1) {
      const userInfo = remainder.slice(0, atIdx);
      remainder = remainder.slice(atIdx + 1);
      const colonIdx = userInfo.indexOf(':');
      if (colonIdx !== -1) {
        username = decodeURIComponent(userInfo.slice(0, colonIdx));
        try { password = decodeURIComponent(userInfo.slice(colonIdx + 1)); }
        catch (e) { password = userInfo.slice(colonIdx + 1); }
      } else {
        username = decodeURIComponent(userInfo);
      }
    }
    const colonIdx = remainder.lastIndexOf(':');
    if (colonIdx !== -1) {
      host = remainder.slice(0, colonIdx);
      port = remainder.slice(colonIdx + 1);
    } else {
      host = remainder;
    }
  } else if (/^postgres(?:ql)?:\/\//i.test(trimmed)) {
    let remainder = trimmed.replace(/^postgres(?:ql)?:\/\//i, '');
    const qIdx = remainder.indexOf('?');
    let queryStr = '';
    if (qIdx !== -1) {
      queryStr = remainder.slice(qIdx + 1);
      remainder = remainder.slice(0, qIdx);
    }
    if (queryStr) {
      for (const part of queryStr.split('&')) {
        const eq = part.indexOf('=');
        if (eq !== -1) {
          queryParams.set(part.slice(0, eq), part.slice(eq + 1));
        } else if (part) {
          queryParams.set(part, '');
        }
      }
    }
    const slashIdx = remainder.indexOf('/');
    if (slashIdx !== -1) {
      dbName = remainder.slice(slashIdx + 1) || 'postgres';
      remainder = remainder.slice(0, slashIdx);
    }
    const atIdx = remainder.lastIndexOf('@');
    if (atIdx !== -1) {
      const userInfo = remainder.slice(0, atIdx);
      remainder = remainder.slice(atIdx + 1);
      const colonIdx = userInfo.indexOf(':');
      if (colonIdx !== -1) {
        username = decodeURIComponent(userInfo.slice(0, colonIdx));
        try { password = decodeURIComponent(userInfo.slice(colonIdx + 1)); }
        catch (e) { password = userInfo.slice(colonIdx + 1); }
      } else {
        username = decodeURIComponent(userInfo);
      }
    }
    const colonIdx = remainder.lastIndexOf(':');
    if (colonIdx !== -1) {
      host = remainder.slice(0, colonIdx);
      port = remainder.slice(colonIdx + 1);
    } else {
      host = remainder;
    }
  } else {
    return { valid: false, raw: trimmed };
  }

  if (queryParams.has('user') && !username) {
    username = decodeURIComponent(queryParams.get('user'));
    queryParams.delete('user');
  }
  if (queryParams.has('password') && !password) {
    password = decodeURIComponent(queryParams.get('password'));
    queryParams.delete('password');
  }

  if (host.includes('supabase') && !queryParams.has('sslmode')) {
    queryParams.set('sslmode', 'require');
  }
  if (port === '6543' && !queryParams.has('prepareThreshold')) {
    queryParams.set('prepareThreshold', '0');
  }

  const queryParts = [];
  for (const [k, v] of queryParams.entries()) {
    queryParts.push(v ? `${k}=${v}` : k);
  }
  const search = queryParts.length ? '?' + queryParts.join('&') : '';
  const jdbcUrl = `jdbc:postgresql://${host}:${port}/${dbName}${search}`;

  return {
    valid: true,
    jdbcUrl,
    username,
    password,
    host,
    port,
    dbName
  };
}

// Tests
const t1 = normalizeDatabaseUrl('postgresql://postgres.myproject:P@$$w0rd!#123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require');
assert.strictEqual(t1.valid, true);
assert.strictEqual(t1.username, 'postgres.myproject');
assert.strictEqual(t1.password, 'P@$$w0rd!#123');
assert.strictEqual(t1.host, 'aws-0-us-east-1.pooler.supabase.com');
assert.strictEqual(t1.port, '6543');
assert.strictEqual(t1.jdbcUrl, 'jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0');

const t2 = normalizeDatabaseUrl('postgresql://postgres.ref:P%40%24%24w0rd%21%23123@aws-0-us-east-1.pooler.supabase.com:6543/postgres');
assert.strictEqual(t2.valid, true);
assert.strictEqual(t2.username, 'postgres.ref');
assert.strictEqual(t2.password, 'P@$$w0rd!#123');
assert.strictEqual(t2.jdbcUrl, 'jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0');

const t3 = normalizeDatabaseUrl('postgres://postgres:simplepass@db.myproject.supabase.co:5432/postgres');
assert.strictEqual(t3.valid, true);
assert.strictEqual(t3.username, 'postgres');
assert.strictEqual(t3.password, 'simplepass');
assert.strictEqual(t3.jdbcUrl, 'jdbc:postgresql://db.myproject.supabase.co:5432/postgres?sslmode=require');

const t4 = normalizeDatabaseUrl('${DATABASE_URL}');
assert.strictEqual(t4.valid, false);
assert.strictEqual(t4.isPlaceholder, true);

const t5 = normalizeDatabaseUrl('');
assert.strictEqual(t5.valid, false);

console.log('ALL NORMALIZER TESTS PASSED!');

