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

// Map research categories to DB category slugs
const categoryMap = {
  'virtual assistants': 'productivity-assistants',
  'productivity': 'productivity-assistants',
  'navigation': 'navigation-travel',
  'entertainment': 'entertainment-media',
  'health & wellness': 'health-wellness',
  'education': 'education-learning',
  'accessibility': 'accessibility',
  'smart home': 'smart-home-iot',
  'social': 'communication-social',
};

// Map research voice features to DB voice feature names
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
    name: "Amazon Alexa",
    tagline: "The voice assistant that controls your smart home, answers questions, and automates your life",
    description: "Set up Alexa-enabled devices, manage smart home gadgets, play music, get news updates, create shopping lists, and control thousands of compatible devices with your voice. Amazon Alexa is one of the most widely used voice assistants in the world.",
    website_url: "https://www.amazon.com/alexa",
    app_store_url: "https://apps.apple.com/us/app/amazon-alexa/id944011620",
    play_store_url: "https://play.google.com/store/apps/details?id=com.amazon.dee.app",
    category: "virtual assistants",
    platforms: ["ios", "android", "web", "alexa"],
    voice_features: ["voice commands", "voice control", "conversational AI", "voice search", "text-to-speech", "voice authentication"],
    pricing_model: "free",
    tags: ["smart home", "assistant", "alexa", "amazon"],
  },
  {
    name: "Google Assistant",
    tagline: "Your own personal Google, always ready to help whenever you need it",
    description: "Ask questions, control smart home devices, make calls, send texts, set reminders, and get personalized assistance using natural conversational voice commands powered by Google AI.",
    website_url: "https://assistant.google.com",
    app_store_url: "https://apps.apple.com/us/app/google-assistant/id1220976145",
    play_store_url: "https://play.google.com/store/apps/details?id=com.google.android.apps.googleassistant",
    category: "virtual assistants",
    platforms: ["ios", "android", "web", "google_assistant"],
    voice_features: ["voice commands", "voice search", "conversational AI", "voice control", "text-to-speech", "voice navigation"],
    pricing_model: "free",
    tags: ["assistant", "google", "smart home", "ai"],
  },
  {
    name: "ChatGPT",
    tagline: "Talk to ChatGPT with Advanced Voice Mode for natural, real-time AI conversations",
    description: "OpenAI's conversational AI with Advanced Voice Mode that lets you have natural spoken conversations, ask questions, brainstorm ideas, and get help with tasks using your voice in real time.",
    website_url: "https://chatgpt.com",
    app_store_url: "https://apps.apple.com/us/app/chatgpt/id6448311069",
    play_store_url: "https://play.google.com/store/apps/details?id=com.openai.chatgpt",
    category: "virtual assistants",
    platforms: ["ios", "android", "web", "macos", "windows"],
    voice_features: ["conversational AI", "voice commands", "speech-to-text", "text-to-speech"],
    pricing_model: "freemium",
    pricing_details: "Free tier; Plus $20/mo; Pro $200/mo",
    tags: ["ai", "chatbot", "openai", "voice chat"],
  },
  {
    name: "Otter.ai",
    tagline: "AI meeting assistant that records, transcribes, and summarizes your meetings in real time",
    description: "Automated meeting notes with real-time transcription, speaker identification, and AI-generated summaries. Integrates with Zoom, Google Meet, and Microsoft Teams for seamless workflow.",
    website_url: "https://otter.ai",
    app_store_url: "https://apps.apple.com/us/app/otter-transcribe-voice-notes/id1276437113",
    play_store_url: "https://play.google.com/store/apps/details?id=com.aisense.otter",
    category: "productivity",
    platforms: ["ios", "android", "web"],
    voice_features: ["speech-to-text", "voice dictation", "voice search"],
    pricing_model: "freemium",
    pricing_details: "Free 300 min/month; Pro $10/mo",
    tags: ["transcription", "meetings", "productivity", "notes"],
  },
  {
    name: "Speechify",
    tagline: "The number one text-to-speech app that reads any text aloud with natural AI voices",
    description: "Text-to-speech platform that reads books, PDFs, articles, and documents aloud using natural-sounding AI voices. Also offers voice dictation and AI writing assistance. Trusted by over 50 million users.",
    website_url: "https://speechify.com",
    app_store_url: "https://apps.apple.com/us/app/speechify-voice-ai-assistant/id1209815023",
    play_store_url: "https://play.google.com/store/apps/details?id=com.cliffweitzman.speechify2",
    category: "productivity",
    platforms: ["ios", "android", "web", "macos"],
    voice_features: ["text-to-speech", "voice dictation", "speech-to-text"],
    pricing_model: "freemium",
    pricing_details: "Limited free; Premium $11.58/mo",
    tags: ["tts", "reading", "accessibility", "productivity"],
  },
  {
    name: "Wispr Flow",
    tagline: "AI-powered voice dictation that works everywhere, four times faster than typing",
    description: "AI-powered voice dictation app that works in any application on your device. Supports over 100 languages, auto-edits text for grammar and formatting, and includes command mode for hands-free editing.",
    website_url: "https://wisprflow.ai",
    app_store_url: "https://apps.apple.com/us/app/wispr-flow-ai-voice-keyboard/id6497229487",
    play_store_url: null,
    category: "productivity",
    platforms: ["ios", "macos", "windows"],
    voice_features: ["voice dictation", "speech-to-text", "voice commands"],
    pricing_model: "freemium",
    pricing_details: "2,000 words/week free; Pro $15/mo",
    tags: ["dictation", "productivity", "writing", "ai"],
  },
  {
    name: "Google Maps",
    tagline: "Navigate your world with real-time GPS, traffic, transit, and voice-guided directions",
    description: "Turn-by-turn voice navigation for driving, walking, cycling, and public transit. Real-time traffic data, voice search for places and businesses, and fully hands-free voice commands while navigating.",
    website_url: "https://maps.google.com",
    app_store_url: "https://apps.apple.com/us/app/google-maps/id585027354",
    play_store_url: "https://play.google.com/store/apps/details?id=com.google.android.apps.maps",
    category: "navigation",
    platforms: ["ios", "android", "web"],
    voice_features: ["voice navigation", "voice search", "voice commands", "text-to-speech"],
    pricing_model: "free",
    tags: ["maps", "navigation", "gps", "directions"],
  },
  {
    name: "Waze",
    tagline: "Community-driven GPS navigation with real-time traffic alerts and custom voice packs",
    description: "Social navigation app with voice-guided directions, real-time traffic reporting by community members, and customizable celebrity voice packs. Users can even record their own voice for navigation prompts.",
    website_url: "https://www.waze.com",
    app_store_url: "https://apps.apple.com/us/app/waze-navigation-live-traffic/id323229106",
    play_store_url: "https://play.google.com/store/apps/details?id=com.waze",
    category: "navigation",
    platforms: ["ios", "android"],
    voice_features: ["voice navigation", "voice commands", "text-to-speech", "voice search"],
    pricing_model: "free",
    tags: ["navigation", "traffic", "driving", "community"],
  },
  {
    name: "Shazam",
    tagline: "Identify any song playing around you in seconds — just tap and listen",
    description: "Music recognition app that identifies songs playing around you using your device microphone. Instantly discover song lyrics, music videos, curated playlists, and upcoming concert information for identified tracks.",
    website_url: "https://www.shazam.com",
    app_store_url: "https://apps.apple.com/us/app/shazam-find-music-concerts/id284993459",
    play_store_url: "https://play.google.com/store/apps/details?id=com.shazam.android",
    category: "entertainment",
    platforms: ["ios", "android", "web", "macos"],
    voice_features: ["voice search"],
    pricing_model: "free",
    tags: ["music", "recognition", "discovery", "audio"],
  },
  {
    name: "Spotify",
    tagline: "Music, podcasts, and audiobooks with voice search and hands-free playback controls",
    description: "The world's largest audio streaming platform with voice-activated search and playback commands. Ask for songs, artists, moods, and genres using natural language. Works with Alexa and Google Assistant.",
    website_url: "https://www.spotify.com",
    app_store_url: "https://apps.apple.com/us/app/spotify-music-and-podcasts/id324684580",
    play_store_url: "https://play.google.com/store/apps/details?id=com.spotify.music",
    category: "entertainment",
    platforms: ["ios", "android", "web", "macos", "windows", "alexa", "google_assistant"],
    voice_features: ["voice search", "voice commands", "voice control"],
    pricing_model: "freemium",
    pricing_details: "Free with ads; Premium $11.99/mo",
    tags: ["music", "streaming", "podcasts", "audio"],
  },
  {
    name: "SoundHound",
    tagline: "Voice AI that identifies music by singing or humming and answers your questions",
    description: "Identify songs by singing or humming a melody, then use conversational voice AI to search across dozens of knowledge domains including weather, sports, stocks, restaurants, and more.",
    website_url: "https://www.soundhound.com",
    app_store_url: "https://apps.apple.com/us/app/soundhound-chat-ai-app/id1032432287",
    play_store_url: "https://play.google.com/store/apps/details?id=com.hound.android.app",
    category: "entertainment",
    platforms: ["ios", "android"],
    voice_features: ["voice search", "conversational AI", "voice commands"],
    pricing_model: "freemium",
    tags: ["music", "recognition", "ai", "voice search"],
  },
  {
    name: "Calm",
    tagline: "The leading app for meditation, sleep stories, and relaxation with guided voice sessions",
    description: "Voice-guided meditation sessions, sleep stories narrated by celebrities, breathing exercises, and relaxation soundscapes. Personalized mindfulness content designed to help with stress, anxiety, and insomnia.",
    website_url: "https://www.calm.com",
    app_store_url: "https://apps.apple.com/us/app/calm/id571800810",
    play_store_url: "https://play.google.com/store/apps/details?id=com.calm.android",
    category: "health & wellness",
    platforms: ["ios", "android", "web"],
    voice_features: ["text-to-speech", "voice commands"],
    pricing_model: "freemium",
    pricing_details: "Select content free; Premium $16.99/mo",
    tags: ["meditation", "sleep", "wellness", "mindfulness"],
  },
  {
    name: "Headspace",
    tagline: "Guided meditation and mindfulness for better sleep, focus, and everyday wellness",
    description: "Voice-guided meditation sessions, sleep content, focus music, and mindfulness exercises led by expert instructors. Features personalized recommendations based on your goals and detailed progress tracking.",
    website_url: "https://www.headspace.com",
    app_store_url: "https://apps.apple.com/us/app/headspace-meditation-sleep/id493145008",
    play_store_url: "https://play.google.com/store/apps/details?id=com.getsomeheadspace.android",
    category: "health & wellness",
    platforms: ["ios", "android", "web"],
    voice_features: ["text-to-speech", "voice commands"],
    pricing_model: "freemium",
    pricing_details: "Basic content free; $12.99/mo",
    tags: ["meditation", "wellness", "mindfulness", "sleep"],
  },
  {
    name: "Duolingo",
    tagline: "Learn languages for free with AI-powered speech recognition and speaking practice",
    description: "The world's most popular language learning app with speech recognition for pronunciation feedback. Practice speaking through roleplay scenarios, flashcards, and conversation exercises from your very first lesson.",
    website_url: "https://www.duolingo.com",
    app_store_url: "https://apps.apple.com/us/app/duolingo-language-lessons/id570060128",
    play_store_url: "https://play.google.com/store/apps/details?id=com.duolingo",
    category: "education",
    platforms: ["ios", "android", "web"],
    voice_features: ["speech-to-text", "voice commands", "conversational AI"],
    pricing_model: "freemium",
    pricing_details: "Free with ads; Super $12.99/mo",
    tags: ["language", "learning", "education", "speaking"],
  },
  {
    name: "Be My Eyes",
    tagline: "Connecting blind and low-vision people with volunteers and AI for visual assistance",
    description: "Free app connecting visually impaired users to sighted volunteers via live video calls. Includes Be My AI powered by GPT-4 for instant image descriptions available in over 36 languages worldwide.",
    website_url: "https://www.bemyeyes.com",
    app_store_url: "https://apps.apple.com/us/app/be-my-eyes/id905177575",
    play_store_url: "https://play.google.com/store/apps/details?id=com.bemyeyes.bemyeyes",
    category: "accessibility",
    platforms: ["ios", "android"],
    voice_features: ["voice commands", "conversational AI", "text-to-speech"],
    pricing_model: "free",
    tags: ["accessibility", "vision", "ai", "volunteers"],
  },
  {
    name: "Seeing AI",
    tagline: "A free Microsoft app that narrates the world around you for blind and low-vision users",
    description: "AI-powered visual assistant by Microsoft that reads text aloud, describes photos, identifies products by barcode, recognizes people and their emotions, and narrates scenes. Supports 18+ languages. Completely free.",
    website_url: "https://www.seeingai.com",
    app_store_url: "https://apps.apple.com/us/app/seeing-ai/id999062298",
    play_store_url: "https://play.google.com/store/apps/details?id=com.microsoft.seeingai",
    category: "accessibility",
    platforms: ["ios", "android"],
    voice_features: ["text-to-speech", "voice commands"],
    pricing_model: "free",
    tags: ["accessibility", "vision", "microsoft", "ai"],
  },
  {
    name: "Voice Dream Reader",
    tagline: "Premium text-to-speech reader for books, PDFs, articles, and web pages",
    description: "Advanced text-to-speech app with over 100 premium natural-sounding voices. Reads books, PDFs, web articles, and documents aloud with adjustable speed, pronunciation controls, and highlighting. Popular with accessibility users.",
    website_url: "https://www.voicedream.com",
    app_store_url: "https://apps.apple.com/us/app/voice-dream-natural-reader/id496177674",
    play_store_url: null,
    category: "accessibility",
    platforms: ["ios", "macos"],
    voice_features: ["text-to-speech"],
    pricing_model: "subscription",
    pricing_details: "$79.99/year",
    tags: ["tts", "reading", "accessibility", "books"],
  },
  {
    name: "Google Home",
    tagline: "Control your entire smart home with voice commands through Google Assistant",
    description: "Manage over 50,000 smart home devices including lights, thermostats, cameras, and appliances. Voice control via Google Assistant, create automation routines, and manage your entire household from one app.",
    website_url: "https://home.google.com",
    app_store_url: "https://apps.apple.com/us/app/google-home/id680819774",
    play_store_url: "https://play.google.com/store/apps/details?id=com.google.android.apps.chromecast.app",
    category: "smart home",
    platforms: ["ios", "android", "web", "google_assistant"],
    voice_features: ["voice commands", "voice control", "conversational AI"],
    pricing_model: "free",
    tags: ["smart home", "google", "iot", "automation"],
  },
  {
    name: "Replika",
    tagline: "Your AI companion that listens, talks, and cares — always available via voice calls",
    description: "AI companion app with voice messaging and real-time voice calls. Features emotional intelligence, long-term memory of your conversations, and customizable personality. Available 24/7 for voice chat whenever you need.",
    website_url: "https://replika.com",
    app_store_url: "https://apps.apple.com/us/app/replika-ai-friend/id1158555867",
    play_store_url: "https://play.google.com/store/apps/details?id=ai.replika.app",
    category: "social",
    platforms: ["ios", "android", "web"],
    voice_features: ["conversational AI", "voice commands", "text-to-speech", "speech-to-text"],
    pricing_model: "freemium",
    pricing_details: "Basic free; Pro $19.99/mo",
    tags: ["ai companion", "chatbot", "social", "voice chat"],
  },
  {
    name: "Josh.ai",
    tagline: "Privacy-first natural language voice control designed for the luxury smart home",
    description: "Premium smart home voice control with deep natural language understanding. Speak naturally without memorized commands to control lights, climate, entertainment, and more. Privacy-focused — no data sold to third parties.",
    website_url: "https://josh.ai",
    app_store_url: "https://apps.apple.com/us/app/josh-home-intelligence/id1024805681",
    play_store_url: "https://play.google.com/store/apps/details?id=com.jstarllc.josh",
    category: "smart home",
    platforms: ["ios", "android"],
    voice_features: ["voice commands", "voice control", "conversational AI", "text-to-speech"],
    pricing_model: "paid",
    pricing_details: "Requires hardware purchase",
    tags: ["smart home", "luxury", "privacy", "voice control"],
  },
];

async function seed() {
  // 1. Get categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug');

  if (catError) {
    console.error('Failed to fetch categories:', catError);
    process.exit(1);
  }

  const catBySlug = {};
  for (const c of categories) {
    catBySlug[c.slug] = c.id;
  }
  console.log('Categories:', Object.keys(catBySlug).join(', '));

  // 2. Get or create a system user for submitted_by
  // Check if there's an admin user we can use
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle();

  let submittedBy;
  if (adminProfile) {
    submittedBy = adminProfile.id;
    console.log('Using admin profile:', submittedBy);
  } else {
    // Use any existing user
    const { data: anyProfile } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle();
    if (!anyProfile) {
      console.error('No profiles found. Create a user account first.');
      process.exit(1);
    }
    submittedBy = anyProfile.id;
    console.log('Using profile:', submittedBy);
  }

  let inserted = 0;
  let skipped = 0;

  for (const app of apps) {
    const categorySlug = categoryMap[app.category];
    const categoryId = catBySlug[categorySlug];
    if (!categoryId) {
      console.warn(`  ⚠ No category found for "${app.category}" (slug: ${categorySlug}). Skipping ${app.name}`);
      skipped++;
      continue;
    }

    // Check for existing
    const { data: existing } = await supabase
      .from('apps')
      .select('id')
      .eq('website_url', app.website_url)
      .limit(1)
      .maybeSingle();

    if (existing) {
      console.log(`  ⏭ ${app.name} already exists, skipping`);
      skipped++;
      continue;
    }

    const slug = slugify(app.name);
    const voiceFeatures = app.voice_features.map(f => featureMap[f] || f);

    // Use clearbit logo API for real logos
    const domain = new URL(app.website_url).hostname.replace('www.', '');
    const logoUrl = `https://logo.clearbit.com/${domain}`;

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

    // Insert tags
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
