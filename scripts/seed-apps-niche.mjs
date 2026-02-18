import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wllwzzmubsqzovrrucgk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-');
}

const categoryMap = {
  'productivity': 'productivity-assistants',
  'health & wellness': 'health-wellness',
  'entertainment': 'entertainment-media',
  'education': 'education-learning',
  'accessibility': 'accessibility',
  'smart home': 'smart-home-iot',
  'social': 'communication-social',
  'navigation': 'navigation-travel',
  'finance': 'finance-shopping',
  'developer tools': 'developer-tools',
};

const featureMap = {
  'voice commands': 'Voice Commands',
  'voice search': 'Voice Search',
  'voice control': 'Voice Control (Smart Home)',
  'conversational AI': 'Conversational AI',
  'speech-to-text': 'Voice Input/Dictation',
  'text-to-speech': 'Voice Responses/TTS',
  'voice navigation': 'Voice Navigation',
  'voice dictation': 'Voice Input/Dictation',
  'voice authentication': 'Voice Authentication',
};

const apps = [
  {
    name: "AudioDiary",
    tagline: "Just talk — AudioDiary turns your spoken thoughts into lasting AI-powered insights",
    description: "A voice-first journal that turns spoken thoughts into lasting insights with AI analysis, custom tagging, dream analysis, and photo uploads. Encrypted and synced across devices for private reflection.",
    website_url: "https://audiodiary.ai",
    app_store_url: "https://apps.apple.com/us/app/audio-diary-a-simple-journal/id6444500487",
    play_store_url: "https://play.google.com/store/apps/details?id=me.audiodiary.audiodiary",
    category: "health & wellness",
    platforms: ["ios", "android", "web", "macos"],
    voice_features: ["speech-to-text", "conversational AI", "voice dictation"],
    pricing_model: "freemium",
    pricing_details: "Free tier; $149 lifetime Pro",
    tags: ["voice journaling", "ai insights", "mental wellness"],
  },
  {
    name: "Letterly",
    tagline: "Capture your voice and get polished, structured text instantly with AI rewrite presets",
    description: "Records your voice and transforms raw speech into structured text via 27 rewrite presets — summaries, emails, LinkedIn posts, task lists. Supports 90+ languages with auto-detection and webhooks to Notion and Google Docs.",
    website_url: "https://letterly.app",
    app_store_url: null,
    play_store_url: "https://play.google.com/store/apps/details?id=com.draftai",
    category: "productivity",
    platforms: ["ios", "android", "web", "macos"],
    voice_features: ["speech-to-text", "voice dictation"],
    pricing_model: "freemium",
    pricing_details: "Free trial; ~$70/year",
    tags: ["voice to text", "note-taking", "productivity"],
  },
  {
    name: "VOMO",
    tagline: "Studio-grade voice recording meets AI-powered transcription and smart summaries",
    description: "Mobile-centric voice memo tool with GPT-4o powered transcription. Generates AI meeting notes, summaries, email drafts, and action lists from voice recordings. Supports 50+ languages. Ideal for journalists and researchers.",
    website_url: "https://vomo.ai",
    app_store_url: "https://apps.apple.com/us/app/vomo-transcribe-audio-to-text/id6449889336",
    play_store_url: null,
    category: "productivity",
    platforms: ["ios", "web"],
    voice_features: ["speech-to-text", "voice dictation", "conversational AI"],
    pricing_model: "freemium",
    pricing_details: "Free 30 min; Pro ~$100/year",
    tags: ["voice memos", "transcription", "ai notes"],
  },
  {
    name: "Willow Voice",
    tagline: "YC-backed voice dictation with 40% better accuracy than built-in tools",
    description: "Dictation app with significantly better accuracy than built-in tools, working under one second. Supports 100+ languages system-wide across apps. Learns your writing style and custom vocabulary over time.",
    website_url: "https://willowvoice.com",
    app_store_url: null,
    play_store_url: null,
    category: "productivity",
    platforms: ["ios", "macos"],
    voice_features: ["speech-to-text", "voice dictation"],
    pricing_model: "freemium",
    pricing_details: "Free 2,000 words/mo; $15/mo",
    tags: ["dictation", "voice typing", "productivity"],
  },
  {
    name: "BoldVoice",
    tagline: "Speak English clearly with Hollywood accent coaches and real-time AI pronunciation feedback",
    description: "An accent training app combining video lessons from Hollywood accent coaches with real-time AI pronunciation feedback at the sound level. Used by 5M+ people in 150+ countries with personalized plans based on your native language.",
    website_url: "https://boldvoice.com",
    app_store_url: "https://apps.apple.com/us/app/boldvoice-accent-training/id1567841142",
    play_store_url: "https://play.google.com/store/apps/details?id=com.wellocution.androidapp",
    category: "education",
    platforms: ["ios", "android", "web"],
    voice_features: ["speech-to-text", "voice commands", "conversational AI"],
    pricing_model: "subscription",
    pricing_details: "$12.50/mo billed annually",
    tags: ["accent training", "pronunciation", "speech ai"],
  },
  {
    name: "Speech Blubs",
    tagline: "Voice-activated speech therapy games designed for children ages one to six",
    description: "Uses video modeling and voice-activated activities with 1,500+ speech exercises organized by themes. Created with speech therapists for early language development, speech delay, and apraxia. Available in English, Spanish, French, and Portuguese.",
    website_url: "https://speechblubs.com",
    app_store_url: "https://apps.apple.com/us/app/speech-blubs-language-therapy/id1239522573",
    play_store_url: "https://play.google.com/store/apps/details?id=org.blubblub.app.speechblubs",
    category: "education",
    platforms: ["ios", "android"],
    voice_features: ["speech-to-text", "voice commands", "voice control"],
    pricing_model: "subscription",
    pricing_details: "$14.99/month or $59.99/year",
    tags: ["speech therapy", "kids", "language development"],
  },
  {
    name: "SpeechTools",
    tagline: "Award-winning voice therapy and vocal analysis apps designed by speech therapists",
    description: "A suite of specialized voice therapy apps including Voice Analyst for pitch and volume analysis with telehealth, Christella VoiceUp for voice feminization, and DAF PRO for delayed auditory feedback fluency training.",
    website_url: "https://speechtools.co",
    app_store_url: null,
    play_store_url: null,
    category: "health & wellness",
    platforms: ["ios", "android"],
    voice_features: ["speech-to-text", "voice control"],
    pricing_model: "paid",
    pricing_details: "Individual app purchases vary",
    tags: ["speech therapy", "voice analysis", "voice feminization"],
  },
  {
    name: "Envision AI",
    tagline: "AI-powered eyes for people who are blind or have low vision",
    description: "Uses your smartphone camera to read text in 60+ languages, describe surroundings and objects, identify people, and detect colors — all spoken aloud. Self-voicing without needing a screen reader. Also offers Envision Glasses for wearable AI assistance.",
    website_url: "https://www.letsenvision.com",
    app_store_url: "https://apps.apple.com/us/app/envision-ai/id1268632314",
    play_store_url: "https://play.google.com/store/apps/details?id=com.letsenvision.envisionai",
    category: "accessibility",
    platforms: ["ios", "android"],
    voice_features: ["text-to-speech", "voice commands", "voice navigation"],
    pricing_model: "freemium",
    pricing_details: "Free app; Envision Glasses sold separately",
    tags: ["accessibility", "blind", "visual assistance"],
  },
  {
    name: "Roads Audio",
    tagline: "Voice-first messaging designed with the blind community, built for everyone",
    description: "An asynchronous voice messaging app designed with the blind community. Comment on specific moments in voice messages, create private voice channels, and engage without visual verification barriers like CAPTCHAs.",
    website_url: "https://roadsaudio.com",
    app_store_url: null,
    play_store_url: null,
    category: "social",
    platforms: ["ios", "android"],
    voice_features: ["voice commands", "voice navigation", "voice control"],
    pricing_model: "freemium",
    pricing_details: "Free core features",
    tags: ["voice messaging", "accessibility", "social audio"],
  },
  {
    name: "Nomi AI",
    tagline: "AI companion with human-level long-term memory and expressive voice messages",
    description: "Create multiple AI companions each with unique personality, look, and backstory. Features real-time voice messages with tone and cadence that vary with emotions, group chats between Nomis, and genuine long-term memory that evolves with you.",
    website_url: "https://nomi.ai",
    app_store_url: "https://apps.apple.com/us/app/nomi-ai-companion-with-a-soul/id6450270929",
    play_store_url: "https://play.google.com/store/apps/details?id=ai.nomi.twa",
    category: "social",
    platforms: ["ios", "android", "web"],
    voice_features: ["conversational AI", "text-to-speech", "speech-to-text"],
    pricing_model: "freemium",
    pricing_details: "Free limited; $99.99/year unlimited",
    tags: ["ai companion", "conversational ai", "voice messages"],
  },
  {
    name: "Hume AI",
    tagline: "The empathic voice interface — voice AI that understands and responds to human emotions",
    description: "A developer platform for building voice AI that understands and responds to human emotions. The Empathic Voice Interface detects tone, sentiment, and emotional cues in real-time for building conversational AI applications with emotional intelligence.",
    website_url: "https://www.hume.ai",
    app_store_url: null,
    play_store_url: null,
    category: "developer tools",
    platforms: ["web"],
    voice_features: ["conversational AI", "speech-to-text", "text-to-speech", "voice authentication"],
    pricing_model: "freemium",
    pricing_details: "Free 10K chars; Pro from $3/mo",
    tags: ["empathic ai", "emotion detection", "voice api"],
  },
  {
    name: "Vapi",
    tagline: "Build, test, and deploy advanced voice AI agents for phone and web in minutes",
    description: "A developer platform for creating voice AI agents with orchestration across STT, LLM, and TTS providers. Supports phone calls, web, and mobile integration. Used for customer service, appointment booking, and sales automation.",
    website_url: "https://vapi.ai",
    app_store_url: null,
    play_store_url: null,
    category: "developer tools",
    platforms: ["web"],
    voice_features: ["conversational AI", "speech-to-text", "text-to-speech", "voice commands"],
    pricing_model: "freemium",
    pricing_details: "$0.05/min + provider costs",
    tags: ["voice agents", "developer api", "telephony"],
  },
  {
    name: "Fish Audio",
    tagline: "Clone any voice from just 10 seconds of audio with studio-grade AI text-to-speech",
    description: "Clone any voice from just 10 seconds of audio — significantly faster than competitors requiring 60+ seconds. Over 2 million community voices in 8 languages with cross-language capability. Roughly 45% cheaper than ElevenLabs.",
    website_url: "https://fish.audio",
    app_store_url: null,
    play_store_url: null,
    category: "developer tools",
    platforms: ["web"],
    voice_features: ["text-to-speech", "voice commands"],
    pricing_model: "freemium",
    pricing_details: "Free tier; Premium with commercial licensing",
    tags: ["voice cloning", "text-to-speech", "ai voices"],
  },
  {
    name: "Wondercraft",
    tagline: "Create podcasts, audio ads, and narrations with AI — no recording studio needed",
    description: "An AI-powered audio creation platform that generates podcasts, audiobooks, ad narrations, and sales content from text. Features voice cloning, 40+ premium voices, a music library with 200+ tracks, and a video editor.",
    website_url: "https://www.wondercraft.ai",
    app_store_url: null,
    play_store_url: null,
    category: "entertainment",
    platforms: ["web"],
    voice_features: ["text-to-speech", "conversational AI"],
    pricing_model: "freemium",
    pricing_details: "Free 6 credits/mo; Creator $29/mo",
    tags: ["podcast creation", "ai audio", "content creation"],
  },
];

async function seed() {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug');

  if (catError) {
    console.error('Failed to fetch categories:', catError);
    process.exit(1);
  }

  const catBySlug = {};
  for (const c of categories) catBySlug[c.slug] = c.id;

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle();

  const submittedBy = adminProfile?.id;
  if (!submittedBy) {
    console.error('No admin profile found');
    process.exit(1);
  }
  console.log('Using admin profile:', submittedBy);

  let inserted = 0, skipped = 0;

  for (const app of apps) {
    const categorySlug = categoryMap[app.category];
    const categoryId = catBySlug[categorySlug];
    if (!categoryId) {
      console.warn(`  ⚠ No category for "${app.category}". Skipping ${app.name}`);
      skipped++;
      continue;
    }

    // Check for existing by URL or name
    const { data: existingUrl } = await supabase
      .from('apps')
      .select('id')
      .eq('website_url', app.website_url)
      .limit(1)
      .maybeSingle();

    if (existingUrl) {
      console.log(`  ⏭ ${app.name} already exists (URL match), skipping`);
      skipped++;
      continue;
    }

    const { data: existingName } = await supabase
      .from('apps')
      .select('id')
      .ilike('name', app.name)
      .limit(1)
      .maybeSingle();

    if (existingName) {
      console.log(`  ⏭ ${app.name} already exists (name match), skipping`);
      skipped++;
      continue;
    }

    const slug = slugify(app.name);
    const voiceFeatures = [...new Set(app.voice_features.map(f => featureMap[f] || f))];

    const domain = new URL(app.website_url).hostname.replace('www.', '');
    const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    const { data: newApp, error: insertError } = await supabase
      .from('apps')
      .insert({
        submitted_by: submittedBy,
        name: app.name,
        slug,
        tagline: app.tagline,
        description: app.description,
        category_id: categoryId,
        voice_features: voiceFeatures,
        platforms: app.platforms,
        website_url: app.website_url,
        app_store_url: app.app_store_url || null,
        play_store_url: app.play_store_url || null,
        other_download_url: null,
        demo_video_url: null,
        pricing_model: app.pricing_model,
        pricing_details: app.pricing_details || null,
        logo_url: logoUrl,
        screenshot_urls: [],
        status: 'approved',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error(`  ✗ Failed to insert ${app.name}:`, insertError.message);
      continue;
    }

    if (app.tags && newApp) {
      for (const tagName of app.tags) {
        const tagSlug = slugify(tagName);
        const { data: tag } = await supabase
          .from('tags')
          .upsert({ name: tagName.toLowerCase().trim(), slug: tagSlug }, { onConflict: 'slug' })
          .select('id')
          .single();

        if (tag) {
          await supabase.from('app_tags').insert({ app_id: newApp.id, tag_id: tag.id });
        }
      }
    }

    console.log(`  ✓ ${app.name}`);
    inserted++;
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}`);
}

seed().catch(console.error);
