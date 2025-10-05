// scripts/update_user_auth.js
// Usage:
// SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/update_user_auth.js \
//   --user-id <uuid> [--new-email <email>] [--temp-password <password>]
//
// Example:
// SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
// SUPABASE_SERVICE_ROLE_KEY=eyJ... \
// node scripts/update_user_auth.js --user-id b73d49cf-ae3a-4070-b888-b6f0f0e50a63 \
//   --new-email franciscogiraldezmorales@gmail.com --temp-password LaJungla2025!

import { createClient } from '@supabase/supabase-js';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      out[key] = val;
    }
  }
  return out;
}

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { ['user-id']: userId, ['new-email']: newEmail, ['temp-password']: tempPassword } = parseArgs();

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing env vars. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  if (!userId) {
    console.error('❌ Missing required --user-id <uuid>');
    process.exit(1);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  console.log('🔐 Using service role. Target user:', userId);

  // 1) Update Auth user
  const authUpdatePayload = {};
  if (newEmail) authUpdatePayload.email = newEmail;
  if (tempPassword) authUpdatePayload.password = tempPassword;

  if (Object.keys(authUpdatePayload).length > 0) {
    console.log('👤 Updating Auth user...', authUpdatePayload);
    const { data: authData, error: authErr } = await admin.auth.admin.updateUserById(userId, authUpdatePayload);
    if (authErr) {
      console.error('❌ Auth update error:', authErr);
      process.exit(1);
    }
    console.log('✅ Auth user updated:', { id: authData.user.id, email: authData.user.email });
  } else {
    console.log('ℹ️ No Auth changes requested');
  }

  // 2) Sync employees row
  try {
    // Try locate by user_id first
    console.log('🔎 Locating employee by user_id...');
    const { data: byUserId, error: byUserErr } = await admin
      .from('employees')
      .select('id, email, name, user_id, is_active')
      .eq('user_id', userId)
      .maybeSingle();

    let employeeId = byUserId?.id;
    let updatePayload = { updated_at: new Date().toISOString() };
    if (newEmail) updatePayload.email = newEmail;
    updatePayload.is_active = true;

    if (employeeId) {
      console.log('👤 Employee row found:', byUserId);
      const { data: upd, error: updErr } = await admin
        .from('employees')
        .update(updatePayload)
        .eq('id', employeeId)
        .select()
        .maybeSingle();
      if (updErr) {
        console.error('❌ employees update error:', updErr);
        process.exit(1);
      }
      console.log('✅ employees synced:', upd);
    } else {
      console.log('ℹ️ No employee matched by user_id. Trying to locate by email...');
      if (!newEmail) {
        console.log('⚠️ Skipping employees sync by email because --new-email not provided.');
      } else {
        const { data: byEmail, error: byEmailErr } = await admin
          .from('employees')
          .select('id, email, name, user_id, is_active')
          .eq('email', newEmail)
          .maybeSingle();
        if (byEmailErr) {
          console.error('❌ employees lookup by email error:', byEmailErr);
          process.exit(1);
        }
        if (byEmail?.id) {
          console.log('👤 Employee row found by email:', byEmail);
          const { data: upd2, error: updErr2 } = await admin
            .from('employees')
            .update({ ...updatePayload, user_id: userId })
            .eq('id', byEmail.id)
            .select()
            .maybeSingle();
          if (updErr2) {
            console.error('❌ employees update error:', updErr2);
            process.exit(1);
          }
          console.log('✅ employees synced by email:', upd2);
        } else {
          console.log('⚠️ No employee row found to sync. You may need to create or link it manually.');
        }
      }
    }
  } catch (e) {
    console.error('❌ Unexpected error syncing employees:', e);
    process.exit(1);
  }

  console.log('🎉 Done. If a temp password was set, share it securely with the user.');
}

main().catch((e) => {
  console.error('❌ Fatal error:', e);
  process.exit(1);
});
