/**
 * One-time script to replace all Clearbit logo URLs with Google Favicon URLs.
 * Google favicons are already whitelisted in next.config.ts remotePatterns.
 *
 * Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/fix-logos.mjs
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wllwzzmubsqzovrrucgk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixLogos() {
  // Fetch all apps with clearbit logo URLs
  const { data: apps, error } = await supabase
    .from('apps')
    .select('id, name, logo_url, website_url')
    .like('logo_url', '%logo.clearbit.com%');

  if (error) {
    console.error('Failed to fetch apps:', error);
    process.exit(1);
  }

  console.log(`Found ${apps.length} apps with Clearbit logos to fix\n`);

  let updated = 0;
  let failed = 0;

  for (const app of apps) {
    try {
      const domain = new URL(app.website_url).hostname.replace('www.', '');
      const newLogoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

      const { error: updateError } = await supabase
        .from('apps')
        .update({ logo_url: newLogoUrl })
        .eq('id', app.id);

      if (updateError) {
        console.error(`  ✗ ${app.name}: ${updateError.message}`);
        failed++;
      } else {
        console.log(`  ✓ ${app.name} → ${newLogoUrl}`);
        updated++;
      }
    } catch (e) {
      console.error(`  ✗ ${app.name}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`);
}

fixLogos().catch(console.error);
