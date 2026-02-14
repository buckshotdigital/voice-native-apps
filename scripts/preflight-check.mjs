/**
 * Pre-launch checklist — run this before deploying to verify
 * all external services and database config are working.
 *
 * Usage: node scripts/preflight-check.mjs
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load .env.local
const envFile = readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim();
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey);
const anon = createClient(url, anonKey);

let passed = 0;
let failed = 0;

function ok(msg) { console.log(`  ✓ ${msg}`); passed++; }
function fail(msg) { console.log(`  ✗ ${msg}`); failed++; }

console.log('\n--- Pre-flight checks ---\n');

// 1. Database connectivity
console.log('Database:');
try {
  const { data, error } = await admin.from('apps').select('id', { count: 'exact', head: true });
  if (error) throw error;
  ok('Connected to database');
} catch (e) {
  fail(`Database connection failed: ${e.message}`);
}

// 2. Tables exist
for (const table of ['apps', 'categories', 'profiles', 'upvotes', 'reports', 'tags', 'app_tags']) {
  const { error } = await admin.from(table).select('*', { count: 'exact', head: true });
  if (error) fail(`Table "${table}" not accessible: ${error.message}`);
  else ok(`Table "${table}" exists`);
}

// 3. Categories populated
console.log('\nData:');
const { data: cats } = await admin.from('categories').select('*');
if (cats && cats.length > 0) ok(`${cats.length} categories found`);
else fail('No categories found — run seed script');

const { count: appCount } = await admin.from('apps').select('*', { count: 'exact', head: true }).eq('status', 'approved');
if (appCount > 0) ok(`${appCount} approved apps`);
else fail('No approved apps');

// 4. Storage bucket
console.log('\nStorage:');
const { data: buckets } = await admin.storage.listBuckets();
const appBucket = buckets?.find(b => b.name === 'app-assets');
if (appBucket) {
  ok(`Bucket "app-assets" exists (public: ${appBucket.public})`);
} else {
  fail('Bucket "app-assets" not found — create it in Supabase dashboard');
}

// 5. Storage upload test (service role)
if (appBucket) {
  const testPath = '_preflight/test.txt';
  const { error: upErr } = await admin.storage.from('app-assets').upload(testPath, Buffer.from('test'));
  if (upErr && !upErr.message.includes('already exists')) {
    fail(`Storage upload failed: ${upErr.message}`);
  } else {
    ok('Storage upload works');
    await admin.storage.from('app-assets').remove([testPath]);
  }

  // 6. Storage public read
  const { data: pubUrl } = admin.storage.from('app-assets').getPublicUrl(testPath);
  if (pubUrl?.publicUrl) ok('Storage public URLs configured');
  else fail('Storage public URLs not working');
}

// 7. Auth
console.log('\nAuth:');
const { data: { users }, error: usersErr } = await admin.auth.admin.listUsers({ perPage: 1 });
if (usersErr) fail(`Auth admin API failed: ${usersErr.message}`);
else ok(`Auth working (${users?.length || 0}+ users)`);

// 8. RLS check — anon should NOT be able to insert apps directly
console.log('\nSecurity:');
const { error: rlsErr } = await anon.from('apps').insert({ name: 'RLS Test', slug: 'rls-test' });
if (rlsErr) ok('RLS blocks anonymous inserts');
else {
  fail('RLS allows anonymous inserts! Fix RLS policies.');
  await admin.from('apps').delete().eq('slug', 'rls-test');
}

// 9. Anon should NOT be able to read profiles
const { data: profileData, error: profileErr } = await anon.from('profiles').select('*').limit(1);
// If RLS is working, either error or empty result
if (!profileData || profileData.length === 0 || profileErr) ok('RLS protects profiles table');
else fail('RLS allows anonymous profile reads — check policies');

// 10. Environment
console.log('\nEnvironment:');
if (url) ok(`SUPABASE_URL: ${url.substring(0, 30)}...`);
else fail('NEXT_PUBLIC_SUPABASE_URL not set');
if (anonKey) ok('SUPABASE_ANON_KEY set');
else fail('NEXT_PUBLIC_SUPABASE_ANON_KEY not set');
if (serviceKey) ok('SUPABASE_SERVICE_ROLE_KEY set');
else fail('SUPABASE_SERVICE_ROLE_KEY not set');
if (env.NEXT_PUBLIC_SITE_URL) ok(`SITE_URL: ${env.NEXT_PUBLIC_SITE_URL}`);
else fail('NEXT_PUBLIC_SITE_URL not set');

// Summary
console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
if (failed > 0) {
  console.log('Fix the failures above before launching.');
  process.exit(1);
}
console.log('All checks passed! Ready for launch.');
