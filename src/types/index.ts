export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  submissions_today: number;
  last_submission_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
}

export type Platform = 'ios' | 'android' | 'web' | 'macos' | 'windows' | 'linux' | 'alexa' | 'google_assistant';
export type PricingModel = 'free' | 'freemium' | 'paid' | 'subscription';
export type AppStatus = 'pending' | 'approved' | 'rejected';
export type ReportReason = 'spam' | 'misleading' | 'broken_links' | 'duplicate' | 'inappropriate' | 'other';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface App {
  id: string;
  submitted_by: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category_id: string;
  voice_features: string[];
  platforms: Platform[];
  website_url: string;
  app_store_url: string | null;
  play_store_url: string | null;
  other_download_url: string | null;
  logo_url: string;
  screenshot_urls: string[];
  demo_video_url: string | null;
  pricing_model: PricingModel;
  pricing_details: string | null;
  status: AppStatus;
  rejection_reason: string | null;
  featured: boolean;
  is_coming_soon: boolean;
  expected_launch_date: string | null;
  interest_count: number;
  upvote_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
  profile?: Pick<Profile, 'display_name' | 'avatar_url'>;
  tags?: Tag[];
  user_has_upvoted?: boolean;
  user_has_interested?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface AppTag {
  app_id: string;
  tag_id: string;
}

export interface Upvote {
  user_id: string;
  app_id: string;
  created_at: string;
}

export interface AppInterest {
  user_id: string;
  app_id: string;
  country: string | null;
  created_at: string;
}

export interface AppUnlock {
  id: string;
  app_id: string;
  unlocked_by: string;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  created_at: string;
}

export interface InterestTimelinePoint {
  day: string;
  count: number;
}

export interface InterestCountryBreakdown {
  country: string;
  count: number;
}

export interface InterestedUser {
  email: string;
  display_name: string | null;
  country: string | null;
  interested_at: string;
}

export interface Report {
  id: string;
  app_id: string;
  reporter_id: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  created_at: string;
}

export interface SubmitAppFormData {
  name: string;
  tagline: string;
  description: string;
  category_id: string;
  voice_features: string[];
  platforms: Platform[];
  website_url: string;
  app_store_url?: string;
  play_store_url?: string;
  other_download_url?: string;
  demo_video_url?: string;
  pricing_model: PricingModel;
  pricing_details?: string;
  is_coming_soon?: boolean;
  expected_launch_date?: string;
  tags: string[];
  // honeypot
  website2?: string;
}
