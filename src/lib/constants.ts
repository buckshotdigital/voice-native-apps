import { Platform, PricingModel, ReportReason } from '@/types';

export const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'ios', label: 'iOS', icon: '🍎' },
  { value: 'android', label: 'Android', icon: '🤖' },
  { value: 'web', label: 'Web', icon: '🌐' },
  { value: 'macos', label: 'macOS', icon: '💻' },
  { value: 'windows', label: 'Windows', icon: '🪟' },
  { value: 'linux', label: 'Linux', icon: '🐧' },
  { value: 'alexa', label: 'Alexa', icon: '🔵' },
  { value: 'google_assistant', label: 'Google Assistant', icon: '🟢' },
];

export const PRICING_MODELS: { value: PricingModel; label: string; color: string }[] = [
  { value: 'free', label: 'Free', color: 'bg-green-100 text-green-800' },
  { value: 'freemium', label: 'Freemium', color: 'bg-blue-100 text-blue-800' },
  { value: 'paid', label: 'Paid', color: 'bg-orange-100 text-orange-800' },
  { value: 'subscription', label: 'Subscription', color: 'bg-purple-100 text-purple-800' },
];

export const VOICE_FEATURES = [
  'Voice Commands',
  'Voice Search',
  'Voice Navigation',
  'Voice Input/Dictation',
  'Voice Responses/TTS',
  'Conversational AI',
  'Voice Authentication',
  'Voice Control (Smart Home)',
  'Voice Translation',
  'Voice Notes/Memos',
  'Voice Shopping',
  'Voice Gaming',
  'Accessibility (Screen Reader)',
  'Custom Wake Word',
  'Multi-language Voice',
];

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam or promotional content' },
  { value: 'misleading', label: 'Misleading information' },
  { value: 'broken_links', label: 'Broken links' },
  { value: 'duplicate', label: 'Duplicate listing' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
];

export const MAX_SUBMISSIONS_PER_DAY = 3;
export const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_SCREENSHOTS = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const APP_STORE_URL_REGEX = /^https:\/\/apps\.apple\.com\/.+/;
export const PLAY_STORE_URL_REGEX = /^https:\/\/play\.google\.com\/store\/apps\/.+/;
