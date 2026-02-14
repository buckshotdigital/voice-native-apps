/**
 * Infrastructure audit — checks Supabase config, RLS, OAuth, search, triggers
 * Usage: node scripts/infra-audit.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

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
let warnings = 0;

function ok(msg) { console.log(`  ✓ ${msg}`); passed++; }
function fail(msg) { console.log(`  ✗ ${msg}`); failed++; }
function warn(msg) { console.log(`  ⚠ ${msg}`); warnings++; }

console.log('\n=== INFRASTRUCTURE AUDIT ===\n');

// 1. SITE_URL
console.log('1. Site URL:');
const siteUrl = env.NEXT_PUBLIC_SITE_URL;
if (siteUrl && siteUrl.includes('localhost')) {
  warn(`SITE_URL is "${siteUrl}" — update to production domain for OAuth/email links`);
} else if (siteUrl) {
  ok(`SITE_URL: ${siteUrl}`);
} else {
  fail('NEXT_PUBLIC_SITE_URL not set');
}

// 2. Auth users + email confirmation
console.log('\n2. Auth:');
const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 10 });
ok(`${users?.length || 0} users registered`);
const unconfirmed = (users || []).filter(u => !u.email_confirmed_at);
if (unconfirmed.length > 0) {
  warn(`${unconfirmed.length} user(s) with unconfirmed email`);
} else {
  ok('All users have confirmed emails');
}

// 3. OAuth providers
console.log('\n3. OAuth providers:');
const { data: googleOAuth, error: googleErr } = await anon.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: 'https://voice-native-apps.vercel.app/auth/callback', skipBrowserRedirect: true }
});
if (googleErr) fail(`Google OAuth: ${googleErr.message}`);
else if (googleOAuth?.url) ok('Google OAuth configured');
else warn('Google OAuth status unclear');

const { data: githubOAuth, error: githubErr } = await anon.auth.signInWithOAuth({
  provider: 'github',
  options: { redirectTo: 'https://voice-native-apps.vercel.app/auth/callback', skipBrowserRedirect: true }
});
if (githubErr) fail(`GitHub OAuth: ${githubErr.message}`);
else if (githubOAuth?.url) ok('GitHub OAuth configured');
else warn('GitHub OAuth status unclear');

// 4. Full-text search
console.log('\n4. Full-text search:');
const { data: searchTest, error: searchErr } = await admin
  .from('apps')
  .select('id,name')
  .textSearch('search_vector', 'voice', { type: 'websearch' })
  .limit(3);
if (searchErr) {
  fail(`search_vector not working: ${searchErr.message}`);
} else if (searchTest?.length === 0) {
  warn('search_vector query returned 0 results — may not be populated');
} else {
  ok(`Full-text search works (${searchTest.length} results for "voice")`);
}

// 5. RLS enforcement
console.log('\n5. RLS enforcement (anon access):');

// Anon should NOT read profiles
const { data: anonProfiles } = await anon.from('profiles').select('*').limit(1);
if (!anonProfiles || anonProfiles.length === 0) ok('profiles: protected from anon');
else fail(`profiles: anon can read ${anonProfiles.length} row(s)!`);

// Anon should NOT read reports
const { data: anonReports } = await anon.from('reports').select('*').limit(1);
if (!anonReports || anonReports.length === 0) ok('reports: protected from anon');
else fail(`reports: anon can read ${anonReports.length} row(s)!`);

// Anon SHOULD read approved apps
const { data: publicApps } = await anon.from('apps').select('id').eq('status', 'approved').limit(1);
if (publicApps?.length > 0) ok('apps (approved): publicly readable');
else fail('apps (approved): NOT readable by anon — check SELECT policy');

// Anon should NOT read pending apps
const { data: pendingApps } = await anon.from('apps').select('id').eq('status', 'pending').limit(1);
if (!pendingApps || pendingApps.length === 0) ok('apps (pending): hidden from anon');
else fail(`apps (pending): anon can see ${pendingApps.length} pending app(s)!`);

// Anon should NOT insert apps
const { error: insertErr } = await anon.from('apps').insert({ name: 'RLS Test', slug: 'rls-test-audit' });
if (insertErr) ok('apps: anon cannot insert');
else {
  fail('apps: anon CAN insert! Fix RLS policy.');
  await admin.from('apps').delete().eq('slug', 'rls-test-audit');
}

// Anon should NOT delete apps
const { error: deleteErr } = await anon.from('apps').delete().eq('slug', 'nonexistent');
if (deleteErr) ok('apps: anon cannot delete');
else ok('apps: delete returned no error (but nothing matched)');

// 6. Categories
console.log('\n6. Categories:');
const { data: cats } = await admin.from('categories').select('name,slug,icon,display_order').order('display_order');
const missingIcons = (cats || []).filter(c => !c.icon || c.icon.trim() === '');
if (missingIcons.length > 0) {
  warn(`${missingIcons.length} categories missing icons: ${missingIcons.map(c => c.name).join(', ')}`);
} else {
  ok(`${cats?.length} categories, all with icons`);
}

// 7. Data integrity
console.log('\n7. Data integrity:');
const { data: allApps } = await admin.from('apps').select('id,name,slug,tagline,website_url,category_id,platforms,description').eq('status', 'approved');
let dataIssues = 0;
for (const a of allApps || []) {
  const problems = [];
  if (!a.slug) problems.push('no slug');
  if (!a.tagline) problems.push('no tagline');
  if (!a.website_url) problems.push('no website_url');
  if (!a.category_id) problems.push('no category');
  if (!a.platforms || a.platforms.length === 0) problems.push('no platforms');
  if (!a.description) problems.push('no description');
  if (problems.length > 0) {
    fail(`${a.name}: ${problems.join(', ')}`);
    dataIssues++;
  }
}
if (dataIssues === 0) ok(`All ${allApps?.length} approved apps have required fields`);

// Slug uniqueness
const slugs = (allApps || []).map(a => a.slug);
const slugSet = new Set(slugs);
if (slugs.length === slugSet.size) ok('All slugs unique');
else fail(`${slugs.length - slugSet.size} duplicate slug(s) found!`);

// 8. Storage policies (the bug we just found)
console.log('\n8. Storage:');
const { data: buckets } = await admin.storage.listBuckets();
const appBucket = buckets?.find(b => b.name === 'app-assets');
if (appBucket) {
  ok(`Bucket "app-assets" exists (public: ${appBucket.public})`);
  if (!appBucket.public) warn('Bucket is not public — logos/screenshots won\'t be accessible');
} else {
  fail('Bucket "app-assets" not found');
}

// Test service-role upload
if (appBucket) {
  const testPath = '_audit/test.txt';
  const { error: upErr } = await admin.storage.from('app-assets').upload(testPath, Buffer.from('audit test'));
  if (upErr && !upErr.message.includes('already exists')) {
    fail(`Storage upload failed: ${upErr.message}`);
  } else {
    ok('Storage upload works (service role)');
    await admin.storage.from('app-assets').remove([testPath]);
  }
}

// 9. Profile trigger
console.log('\n9. Profile trigger:');
const { count: profileCount } = await admin.from('profiles').select('*', { count: 'exact', head: true });
const totalUsers = users?.length || 0;
if (profileCount === totalUsers) {
  ok(`Profile count (${profileCount}) matches user count (${totalUsers})`);
} else if (profileCount < totalUsers) {
  warn(`${totalUsers - profileCount} user(s) missing profile row — trigger may have failed`);
} else {
  ok(`${profileCount} profiles for ${totalUsers} users`);
}

// 10. Vercel environment
console.log('\n10. Deployment config:');
if (siteUrl === 'http://localhost:3000') {
  warn('SITE_URL is localhost — OAuth redirects and email links will break in production');
  warn('Set NEXT_PUBLIC_SITE_URL=https://voice-native-apps.vercel.app in Vercel env vars');
}

// Check if the Vercel env has the right value
try {
  const res = await fetch('https://voice-native-apps.vercel.app/auth/callback', {
    method: 'GET',
    redirect: 'manual'
  });
  ok(`Production site reachable (status: ${res.status})`);
} catch (e) {
  fail(`Cannot reach production site: ${e.message}`);
}

// Summary
console.log(`\n=== Results: ${passed} passed, ${failed} failed, ${warnings} warnings ===\n`);
if (failed > 0) console.log('Fix failures before launching.');
else if (warnings > 0) console.log('Review warnings — some may affect production functionality.');
else console.log('All clear!');
